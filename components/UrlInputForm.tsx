import React from 'react';

interface UrlInputFormProps {
  url: string;
  setUrl: (url: string) => void;
  selectedLanguage: string;
  setSelectedLanguage: (language: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  hasApiKeys: boolean;
}

const UrlInputForm: React.FC<UrlInputFormProps> = ({ url, setUrl, selectedLanguage, setSelectedLanguage, onAnalyze, isLoading, hasApiKeys }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze();
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="youtube-url" className="block text-lg font-medium text-gray-700 mb-2">
              Dán link YouTube đối thủ vào đây
            </label>
            <input
              id="youtube-url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full bg-gray-100 border border-gray-300 text-gray-800 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200"
              disabled={isLoading}
            />
          </div>
          <div>
             <label htmlFor="language-select" className="block text-lg font-medium text-gray-700 mb-2">
              Chọn ngôn ngữ phân tích
            </label>
            <select
              id="language-select"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full bg-gray-100 border border-gray-300 text-gray-800 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200"
              disabled={isLoading}
            >
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="ja">日本語 (Japanese)</option>
              <option value="ko">한국어 (Korean)</option>
            </select>
          </div>
          {!hasApiKeys && <p className="text-sm text-center text-red-600">Vui lòng thêm Gemini API Key trong phần Cài đặt để sử dụng tính năng này.</p>}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            disabled={isLoading || !url || !hasApiKeys}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang xử lý...
              </>
            ) : (
              'Phân Tích'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UrlInputForm;
