import React, { useState, useCallback, useEffect } from 'react';
import { analyzeYoutubeVideo, recreateThumbnail } from './services/geminiService';
import { getVideoDetails } from './services/youtubeService';
import { extractVideoId, isValidYoutubeUrl } from './utils/helpers';
import type { HistoryItem } from './types';
import UrlInputForm from './components/UrlInputForm';
import SeoAnalysisDisplay from './components/SeoAnalysisDisplay';
import ThumbnailCopier from './components/ThumbnailCopier';
import Loader from './components/Loader';
import History from './components/History';
import ApiKeyManager from './components/ApiKeyManager';
import SettingsIcon from './components/icons/SettingsIcon';

const App: React.FC = () => {
  // Hardcode the YouTube API key and remove the input field
  const YOUTUBE_API_KEY = 'AIzaSyDwTSvkH1mvEuXwjbnE8OqpBlI3SMZTbDk';

  const [youtubeUrl, setYoutubeUrl] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('vi');
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [originalThumbnailUrl, setOriginalThumbnailUrl] = useState<string | null>(null);
  const [generatedThumbnail, setGeneratedThumbnail] = useState<string | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState<boolean>(false);
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isAnalysisTriggeredByHistory, setIsAnalysisTriggeredByHistory] = useState(false);

  // API Key Management State
  const [apiKeys, setApiKeys] = useState<string[]>([]);
  const [currentApiKeyIndex, setCurrentApiKeyIndex] = useState<number>(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);


  // Load history and API keys from localStorage on initial render
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('youtube-seo-history');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
      const storedApiKeys = localStorage.getItem('gemini-api-keys');
      if (storedApiKeys) {
        const parsedKeys = JSON.parse(storedApiKeys);
        if (Array.isArray(parsedKeys) && parsedKeys.length > 0) {
          setApiKeys(parsedKeys);
        } else {
          setIsSettingsOpen(true); // Prompt for keys if stored value is invalid or empty
        }
      } else {
        setIsSettingsOpen(true); // Prompt for keys on first visit
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      setIsSettingsOpen(true);
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('youtube-seo-history', JSON.stringify(history));
    } catch (error) {
       console.error("Failed to save history to localStorage", error);
    }
  }, [history]);

  const handleSaveApiKeys = useCallback((keys: string[]) => {
    setApiKeys(keys);
    setCurrentApiKeyIndex(0); // Reset to the first key
    try {
      localStorage.setItem('gemini-api-keys', JSON.stringify(keys));
    } catch (error) {
      console.error("Failed to save API keys to localStorage", error);
    }
  }, []);


  const handleAnalysis = useCallback(async () => {
    if (!isValidYoutubeUrl(youtubeUrl)) {
      setError('Vui lòng nhập một URL YouTube hợp lệ.');
      return;
    }
    if (apiKeys.length === 0) {
      setError('Vui lòng thêm Gemini API Key trong phần Cài đặt.');
      setIsSettingsOpen(true);
      return;
    }
    setError(null);
    setAnalysisResult(null);
    setOriginalThumbnailUrl(null);
    setGeneratedThumbnail(null);
    setIsLoadingAnalysis(true);

    let success = false;
    let keyIndex = currentApiKeyIndex;

    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      setError('Không thể trích xuất ID video từ URL.');
      setIsLoadingAnalysis(false);
      return;
    }

    try {
      const videoDetails = await getVideoDetails(videoId, YOUTUBE_API_KEY);
      setOriginalThumbnailUrl(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`);

      while (!success && keyIndex < apiKeys.length) {
        try {
          const currentKey = apiKeys[keyIndex];
          const result = await analyzeYoutubeVideo(videoDetails, videoId, selectedLanguage, currentKey);
          setAnalysisResult(result);
          success = true;

          setHistory(prevHistory => {
            const newHistoryItem: HistoryItem = { url: youtubeUrl, title: videoDetails.title, videoId: videoId };
            const filteredHistory = prevHistory.filter(item => item.videoId !== newHistoryItem.videoId);
            return [newHistoryItem, ...filteredHistory].slice(0, 15);
          });

        } catch (err) {
          if (err instanceof Error && err.message.includes("429")) {
            console.warn(`API key at index ${keyIndex} exhausted. Trying next.`);
            keyIndex++;
          } else {
            throw err; // Re-throw other errors
          }
        }
      }

      if (success) {
        setCurrentApiKeyIndex(keyIndex);
      } else {
        throw new Error("Tất cả các API key đều đã hết hạn ngạch hoặc không hợp lệ. Vui lòng kiểm tra lại trong phần Cài đặt.");
      }

    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định khi phân tích.';
      setError(errorMessage);
    } finally {
      setIsLoadingAnalysis(false);
    }
  }, [youtubeUrl, selectedLanguage, apiKeys, currentApiKeyIndex]);
  
  // Effect to run analysis when triggered by a history click
  useEffect(() => {
    if (isAnalysisTriggeredByHistory) {
      handleAnalysis();
      setIsAnalysisTriggeredByHistory(false);
    }
  }, [isAnalysisTriggeredByHistory, handleAnalysis]);

  const handleHistoryClick = useCallback((url: string) => {
    setYoutubeUrl(url);
    setIsAnalysisTriggeredByHistory(true);
  }, []);

  const handleDeleteItem = useCallback((videoId: string) => {
    setHistory(prev => prev.filter(item => item.videoId !== videoId));
  }, []);

  const handleClearHistory = useCallback(() => {
    setHistory([]);
  }, []);


  const handleRecreateThumbnail = useCallback(async (prompt: string) => {
    if (!originalThumbnailUrl) {
      setError('Không có thumbnail gốc để sao chép.');
      return;
    }
     if (apiKeys.length === 0) {
      setError('Vui lòng thêm Gemini API Key trong phần Cài đặt.');
      setIsSettingsOpen(true);
      return;
    }
    setError(null);
    setGeneratedThumbnail(null);
    setIsGeneratingThumbnail(true);

    let success = false;
    let keyIndex = currentApiKeyIndex;

    try {
       while (!success && keyIndex < apiKeys.length) {
        try {
          const currentKey = apiKeys[keyIndex];
          const newThumbnail = await recreateThumbnail(originalThumbnailUrl, prompt, currentKey);
          setGeneratedThumbnail(newThumbnail);
          success = true;
        } catch (err) {
           if (err instanceof Error && err.message.includes("429")) {
            console.warn(`API key at index ${keyIndex} exhausted. Trying next.`);
            keyIndex++;
          } else {
            throw err; // Re-throw other errors
          }
        }
      }

       if (success) {
        setCurrentApiKeyIndex(keyIndex);
      } else {
        throw new Error("Tất cả các API key đều đã hết hạn ngạch hoặc không hợp lệ. Vui lòng kiểm tra lại trong phần Cài đặt.");
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định khi tạo thumbnail.';
      setError(errorMessage);
    } finally {
      setIsGeneratingThumbnail(false);
    }
  }, [originalThumbnailUrl, apiKeys, currentApiKeyIndex]);

  return (
    <>
      <ApiKeyManager
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveApiKeys}
        initialKeys={apiKeys}
      />
      <div className="min-h-screen bg-gray-100 text-gray-800 font-sans p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-8 relative">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              YouTube SEO Analyzer
            </h1>
             <p className="mt-2 text-lg text-gray-700 font-semibold">
              by Đường Thọ - 0934315387
            </p>
            <p className="mt-2 text-lg text-gray-600">
              Phân tích đối thủ và tối ưu hóa video của bạn để thống trị kết quả tìm kiếm.
            </p>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="absolute top-0 right-0 p-2 text-gray-500 hover:text-purple-600 transition-colors"
              aria-label="Open API Key Settings"
            >
              <SettingsIcon />
            </button>
          </header>

          <main>
            <UrlInputForm
              url={youtubeUrl}
              setUrl={setYoutubeUrl}
              selectedLanguage={selectedLanguage}
              setSelectedLanguage={setSelectedLanguage}
              onAnalyze={handleAnalysis}
              isLoading={isLoadingAnalysis}
              hasApiKeys={apiKeys.length > 0}
            />

            <History
              history={history}
              onItemClick={handleHistoryClick}
              onDeleteItem={handleDeleteItem}
              onClearHistory={handleClearHistory}
            />

            {error && (
              <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center" role="alert">
                <p>{error}</p>
              </div>
            )}

            {isLoadingAnalysis && <Loader message="Đang lấy dữ liệu và phân tích, vui lòng chờ..." />}

            {analysisResult && (
              <div className="mt-8 space-y-8">
                <SeoAnalysisDisplay analysisResult={analysisResult} />
                {originalThumbnailUrl && (
                  <ThumbnailCopier
                    originalThumbnailUrl={originalThumbnailUrl}
                    generatedThumbnail={generatedThumbnail}
                    onRecreate={handleRecreateThumbnail}
                    isLoading={isGeneratingThumbnail}
                  />
                )}
              </div>
            )}
          </main>
          <footer className="text-center mt-12 text-gray-500 text-sm">
            <p>© {new Date().getFullYear()} Bản quyền thuộc về Đường Thọ</p>
          </footer>
        </div>
      </div>
    </>
  );
};

export default App;
