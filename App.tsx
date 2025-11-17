
import React, { useState, useCallback, useEffect } from 'react';
import { analyzeYoutubeVideo, recreateThumbnail } from './services/geminiService';
import { getVideoDetails, searchVideos, getVideoStatistics, getTrendingVideos } from './services/youtubeService';
import { extractVideoId, isValidYoutubeUrl } from './utils/helpers';
import type { HistoryItem, SearchResultItem } from './types';
import UrlInputForm from './components/UrlInputForm';
import SeoAnalysisDisplay from './components/SeoAnalysisDisplay';
import ThumbnailCopier from './components/ThumbnailCopier';
import Loader from './components/Loader';
import History from './components/History';
import Discovery from './components/Discovery';
import Statistics from './components/Statistics';
import Trending from './components/Trending';
import ZaloIcon from './components/icons/ZaloIcon';
import ApiKeyManager from './components/ApiKeyManager';
import SettingsIcon from './components/icons/SettingsIcon';


const App: React.FC = () => {
  // Hardcode the YouTube API key as provided in the initial setup.
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
  
  // State for Discovery module
  const [discoveryQuery, setDiscoveryQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // State for API Key Management
  const [geminiApiKeys, setGeminiApiKeys] = useState<string[]>([]);
  const [currentGeminiKeyIndex, setCurrentGeminiKeyIndex] = useState(0);
  const [isApiKeyManagerOpen, setIsApiKeyManagerOpen] = useState(false);


  // Load data from localStorage on initial render
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('youtube-seo-history');
      if (storedHistory) setHistory(JSON.parse(storedHistory));
      
      const storedGeminiKeys = localStorage.getItem('gemini-api-keys');
      if (storedGeminiKeys) {
        const parsedKeys = JSON.parse(storedGeminiKeys);
        if (Array.isArray(parsedKeys) && parsedKeys.length > 0) {
          setGeminiApiKeys(parsedKeys);
        } else {
          setIsApiKeyManagerOpen(true); // Open manager if keys are invalid or empty
        }
      } else {
        setIsApiKeyManagerOpen(true); // Open manager if no keys are stored
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
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

  const handleSaveApiKeys = (keys: string[]) => {
    setGeminiApiKeys(keys);
    setCurrentGeminiKeyIndex(0); // Reset to the first key
    try {
        localStorage.setItem('gemini-api-keys', JSON.stringify(keys));
    } catch (error) {
        console.error("Failed to save Gemini API keys to localStorage", error);
    }
  };

  const handleAnalysis = useCallback(async () => {
    if (geminiApiKeys.length === 0) {
      setError("Vui lòng cung cấp Gemini API Key trong phần Cài đặt.");
      setIsApiKeyManagerOpen(true);
      return;
    }
    if (!isValidYoutubeUrl(youtubeUrl)) {
      setError('Vui lòng nhập một URL YouTube hợp lệ.');
      return;
    }
    setError(null);
    setAnalysisResult(null);
    setOriginalThumbnailUrl(null);
    setGeneratedThumbnail(null);
    setIsLoadingAnalysis(true);

    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      setError('Không thể trích xuất ID video từ URL.');
      setIsLoadingAnalysis(false);
      return;
    }

    let videoDetails;
    try {
        videoDetails = await getVideoDetails(videoId, YOUTUBE_API_KEY);
        setOriginalThumbnailUrl(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Lỗi khi lấy chi tiết video.';
        setError(errorMessage);
        setIsLoadingAnalysis(false);
        return;
    }
    
    let success = false;
    let keyIndex = currentGeminiKeyIndex;

    for (let i = 0; i < geminiApiKeys.length; i++) {
        const apiKey = geminiApiKeys[keyIndex];
        try {
            const result = await analyzeYoutubeVideo(videoDetails, videoId, selectedLanguage, apiKey);
            setAnalysisResult(result);
            success = true;
            setCurrentGeminiKeyIndex(keyIndex); // Save the working key index for next time
            break; // Exit loop on success
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '';
            console.warn(`Key at index ${keyIndex} failed: ${errorMessage}`);
            if (errorMessage.toLowerCase().includes('quota')) {
                keyIndex = (keyIndex + 1) % geminiApiKeys.length; // Move to the next key
            } else {
                setError(errorMessage || "Đã xảy ra lỗi không xác định khi phân tích.");
                break; // A different error occurred, stop trying
            }
        }
    }

    if (success) {
      setHistory(prevHistory => {
        const newHistoryItem: HistoryItem = { url: youtubeUrl, title: videoDetails.title, videoId: videoId };
        const filteredHistory = prevHistory.filter(item => item.videoId !== newHistoryItem.videoId);
        return [newHistoryItem, ...filteredHistory].slice(0, 15);
      });
    } else {
        setError("Tất cả các Gemini API key đều đã hết hạn ngạch hoặc không hợp lệ. Vui lòng kiểm tra lại trong Cài đặt.");
    }
    
    setIsLoadingAnalysis(false);

  }, [youtubeUrl, selectedLanguage, geminiApiKeys, currentGeminiKeyIndex]);
  
  // Effect to run analysis when triggered by a history click or discovery selection
  useEffect(() => {
    if (isAnalysisTriggeredByHistory) {
      handleAnalysis();
      setIsAnalysisTriggeredByHistory(false);
    }
  }, [isAnalysisTriggeredByHistory, handleAnalysis]);

  const handleHistoryClick = useCallback((url: string) => {
    setYoutubeUrl(url);
    setIsAnalysisTriggeredByHistory(true);
    const analysisSection = document.getElementById('analysis-section');
    if (analysisSection) {
       analysisSection.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handleDeleteItem = useCallback((videoId: string) => {
    setHistory(prev => prev.filter(item => item.videoId !== videoId));
  }, []);

  const handleClearHistory = useCallback(() => {
    setHistory([]);
  }, []);


  const handleRecreateThumbnail = useCallback(async (prompt: string) => {
     if (geminiApiKeys.length === 0) {
      setError("Vui lòng cung cấp Gemini API Key trong phần Cài đặt.");
      setIsApiKeyManagerOpen(true);
      return;
    }
    if (!originalThumbnailUrl) {
      setError('Không có thumbnail gốc để sao chép.');
      return;
    }
    setError(null);
    setGeneratedThumbnail(null);
    setIsGeneratingThumbnail(true);

    let success = false;
    let keyIndex = currentGeminiKeyIndex;

     for (let i = 0; i < geminiApiKeys.length; i++) {
        const apiKey = geminiApiKeys[keyIndex];
        try {
            const newThumbnail = await recreateThumbnail(originalThumbnailUrl, prompt, apiKey);
            setGeneratedThumbnail(newThumbnail);
            success = true;
            setCurrentGeminiKeyIndex(keyIndex);
            break;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '';
            console.warn(`Key at index ${keyIndex} failed: ${errorMessage}`);
            if (errorMessage.toLowerCase().includes('quota')) {
                keyIndex = (keyIndex + 1) % geminiApiKeys.length;
            } else {
                setError(errorMessage || 'Đã xảy ra lỗi không xác định khi tạo thumbnail.');
                break;
            }
        }
    }

    if (!success) {
         setError("Tất cả các Gemini API key đều đã hết hạn ngạch hoặc không hợp lệ. Vui lòng kiểm tra lại trong Cài đặt.");
    }

    setIsGeneratingThumbnail(false);
  }, [originalThumbnailUrl, geminiApiKeys, currentGeminiKeyIndex]);
  
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchError('Vui lòng nhập từ khóa để tìm kiếm.');
      return;
    }
    setIsSearching(true);
    setSearchError(null);
    setSearchResults([]);

    try {
      const results = await searchVideos(query, YOUTUBE_API_KEY);
      setSearchResults(results);
      if (results.length === 0) {
        setSearchError('Không tìm thấy video nào phù hợp.');
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tìm kiếm.';
      setSearchError(errorMessage);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleVideoSelect = useCallback((videoId: string) => {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    setYoutubeUrl(url);
    setIsAnalysisTriggeredByHistory(true);
    const analysisSection = document.getElementById('analysis-section');
    if (analysisSection) {
       analysisSection.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Handlers for new modules, passing the API key
  const handleGetStats = useCallback((videoIds: string[]) => {
    return getVideoStatistics(videoIds, YOUTUBE_API_KEY);
  }, []);

  const handleGetTrends = useCallback((regionCode: string) => {
    return getTrendingVideos(regionCode, YOUTUBE_API_KEY);
  }, []);

  const handleTrendKeywordSelect = useCallback((keyword: string) => {
    setDiscoveryQuery(keyword);
    handleSearch(keyword);
    
    const discoverySection = document.getElementById('discovery-section');
    if (discoverySection) {
        discoverySection.scrollIntoView({ behavior: 'smooth' });
    }
  }, [handleSearch]);

  const hasGeminiKeys = geminiApiKeys.length > 0;

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 font-sans p-4 sm:p-6 lg:p-8">
      <ApiKeyManager
        isOpen={isApiKeyManagerOpen}
        onClose={() => setIsApiKeyManagerOpen(false)}
        onSave={handleSaveApiKeys}
        initialKeys={geminiApiKeys}
      />
      <div className="max-w-6xl mx-auto">
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 lg:top-8 lg:right-8">
            <button
                onClick={() => setIsApiKeyManagerOpen(true)}
                className="p-2 bg-white rounded-full shadow-md text-gray-600 hover:text-purple-600 hover:bg-gray-50 transition-colors"
                aria-label="Open API Key Settings"
            >
                <SettingsIcon />
            </button>
        </div>
        
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 mb-6 flex items-center justify-between flex-wrap gap-4">
          <p className="text-sm font-semibold text-gray-700">
            App của Thọ - 0934415387
          </p>
          <a 
            href="https://zalo.me/g/sgkzgk550" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-blue-500 text-white text-sm font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <ZaloIcon />
            Tham Gia Nhóm zalo tạo app
          </a>
        </div>

        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
            KeyTube
          </h1>
        </header>

        <main className="space-y-8">
          <div id="discovery-section">
            <Discovery
              query={discoveryQuery}
              setQuery={setDiscoveryQuery}
              onSearch={handleSearch}
              onVideoSelect={handleVideoSelect}
              results={searchResults}
              isLoading={isSearching}
              error={searchError}
            />
          </div>
          
          <div className="flex items-center" aria-hidden="true">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-500 font-semibold">HOẶC</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <div id="analysis-section">
            <UrlInputForm
              url={youtubeUrl}
              setUrl={setYoutubeUrl}
              selectedLanguage={selectedLanguage}
              setSelectedLanguage={setSelectedLanguage}
              onAnalyze={handleAnalysis}
              isLoading={isLoadingAnalysis}
              hasGeminiKeys={hasGeminiKeys}
            />
          </div>

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
                  hasGeminiKeys={hasGeminiKeys}
                />
              )}
            </div>
          )}

          <History
            history={history}
            onItemClick={handleHistoryClick}
            onDeleteItem={handleDeleteItem}
            onClearHistory={handleClearHistory}
          />
          
          <div className="space-y-8 mt-8">
            <div className="text-center pt-4">
                <h2 className="text-3xl font-bold text-gray-800">Module 2: Phân Tích Nâng Cao</h2>
                <p className="text-gray-600 mt-2">Sử dụng các công cụ mạnh mẽ để nghiên cứu sâu hơn về thị trường.</p>
            </div>
            <Statistics onGetStats={handleGetStats} />
            <Trending onGetTrends={handleGetTrends} onKeywordSelect={handleTrendKeywordSelect} />
          </div>

        </main>
        <footer className="text-center mt-12 text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} KeyTube</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
