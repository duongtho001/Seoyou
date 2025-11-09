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
import ApiKeyPrompt from './components/ApiKeyPrompt';

// Mock process.env
if (typeof process === 'undefined') {
  (window as any).process = { env: {} };
}

// FIX: Resolve "Subsequent property declarations" error by defining the type for
// 'aistudio' directly within the global declaration. This avoids creating a
// module-scoped interface that can conflict with global augmentations.
// Define the aistudio object on the window for TypeScript
declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}


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
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [isCheckingApiKey, setIsCheckingApiKey] = useState<boolean>(true);


  useEffect(() => {
    const checkApiKey = async () => {
      try {
        if (window.aistudio && (await window.aistudio.hasSelectedApiKey())) {
          setHasApiKey(true);
        }
      } catch (e) {
        console.error("Error checking for API key", e);
        setError("Could not verify API key status.");
      } finally {
        setIsCheckingApiKey(false);
      }
    };
    checkApiKey();
  }, []);

  // Load history from localStorage on initial render
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('youtube-seo-history');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to load history from localStorage", error);
      setHistory([]);
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


  const handleAnalysis = useCallback(async () => {
    if (!isValidYoutubeUrl(youtubeUrl)) {
      setError('Vui lòng nhập một URL YouTube hợp lệ.');
      return;
    }
    setError(null);
    setAnalysisResult(null);
    setOriginalThumbnailUrl(null);
    setGeneratedThumbnail(null);
    setIsLoadingAnalysis(true);

    try {
      const videoId = extractVideoId(youtubeUrl);
      if (!videoId) {
        throw new Error('Không thể trích xuất ID video từ URL.');
      }
      setOriginalThumbnailUrl(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`);

      const videoDetails = await getVideoDetails(videoId, YOUTUBE_API_KEY);
      const result = await analyzeYoutubeVideo(videoDetails, videoId, selectedLanguage);
      setAnalysisResult(result);

      // Add to history after successful analysis
      setHistory(prevHistory => {
        const newHistoryItem: HistoryItem = {
          url: youtubeUrl,
          title: videoDetails.title,
          videoId: videoId,
        };
        const filteredHistory = prevHistory.filter(item => item.videoId !== newHistoryItem.videoId);
        const updatedHistory = [newHistoryItem, ...filteredHistory].slice(0, 15); // Limit to 15 items
        return updatedHistory;
      });

    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định khi phân tích.';
       setError(errorMessage);
       if (errorMessage.includes("Requested entity was not found") || errorMessage.includes("API key not valid") || errorMessage.includes("Lỗi hạn ngạch API 429")) {
         setHasApiKey(false);
         setError("API Key đã hết hạn ngạch hoặc không hợp lệ. Vui lòng chọn một API Key khác để tiếp tục.");
       }
    } finally {
      setIsLoadingAnalysis(false);
    }
  }, [youtubeUrl, selectedLanguage]);
  
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
    setError(null);
    setGeneratedThumbnail(null);
    setIsGeneratingThumbnail(true);
    try {
      const newThumbnail = await recreateThumbnail(originalThumbnailUrl, prompt);
      setGeneratedThumbnail(newThumbnail);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định khi tạo thumbnail.';
      setError(errorMessage);
      if (errorMessage.includes("Requested entity was not found") || errorMessage.includes("API key not valid") || errorMessage.includes("Lỗi hạn ngạch API 429")) {
        setHasApiKey(false);
        setError("API Key đã hết hạn ngạch hoặc không hợp lệ. Vui lòng chọn một API Key khác để tiếp tục.");
      }
    } finally {
      setIsGeneratingThumbnail(false);
    }
  }, [originalThumbnailUrl]);

  const handleSelectKey = async () => {
    try {
      if (window.aistudio) {
        await window.aistudio.openSelectKey();
        // Optimistically set hasApiKey to true to avoid race conditions.
        // If the key is invalid, the next API call will fail and reset this.
        setHasApiKey(true);
        setError(null); // Clear previous errors
      }
    } catch (e) {
      console.error("Could not open API key selection dialog", e);
      setError("Không thể mở hộp thoại chọn API Key.");
    }
  };

  if (isCheckingApiKey) {
    return <Loader message="Đang kiểm tra cấu hình..." />;
  }

  if (!hasApiKey) {
    return <ApiKeyPrompt onSelectKey={handleSelectKey} error={error} />;
  }
  

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
            YouTube SEO Analyzer
          </h1>
           <p className="mt-2 text-lg text-gray-700 font-semibold">
            by Đường Thọ - 0934315387
          </p>
          <p className="mt-2 text-lg text-gray-600">
            Phân tích đối thủ và tối ưu hóa video của bạn để thống trị kết quả tìm kiếm.
          </p>
        </header>

        <main>
          <UrlInputForm
            url={youtubeUrl}
            setUrl={setYoutubeUrl}
            selectedLanguage={selectedLanguage}
            setSelectedLanguage={setSelectedLanguage}
            onAnalyze={handleAnalysis}
            isLoading={isLoadingAnalysis}
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
  );
};

export default App;