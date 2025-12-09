
import React from 'react';
import type { SearchResultItem } from '../types';

interface DiscoveryProps {
  query: string;
  setQuery: (query: string) => void;
  onSearch: (query: string) => void;
  onVideoSelect: (videoId: string) => void;
  results: SearchResultItem[];
  isLoading: boolean;
  error: string | null;
}

const Discovery: React.FC<DiscoveryProps> = ({ query, setQuery, onSearch, onVideoSelect, results, isLoading, error }) => {

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
        Module 1: Khám Phá & Phân Tích Đối Thủ
      </h2>
      <p className="text-gray-600 text-center mb-6">
        Tìm kiếm video theo từ khóa (trong 7 ngày qua tại Việt Nam) để nắm bắt xu hướng và phân tích đối thủ.
      </p>
      
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 mb-6 max-w-2xl mx-auto">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nhập từ khóa (vd: Du lịch núi tuyết)..."
          className="flex-grow bg-gray-100 border border-gray-300 text-gray-800 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          disabled={isLoading || !query}
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            'Tìm kiếm'
          )}
        </button>
      </form>

      {error && <p className="text-red-500 text-center my-4">{error}</p>}

      {results.length > 0 && (
        <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Kết quả tìm kiếm</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {results.map(video => (
                <div 
                key={video.videoId} 
                className="border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg hover:border-purple-400 transition-all transform hover:-translate-y-1"
                onClick={() => onVideoSelect(video.videoId)}
                title={`Phân tích video: ${video.title}`}
                >
                <img src={video.thumbnailUrl} alt={video.title} className="w-full aspect-video object-cover" />
                <div className="p-3">
                    <h3 className="font-semibold text-sm text-gray-800 line-clamp-2" style={{ minHeight: '2.5em' }}>{video.title}</h3>
                    <p className="text-xs text-gray-600 mt-1 truncate">{video.channelTitle}</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(video.publishedAt).toLocaleDateString('vi-VN')}</p>
                </div>
                </div>
            ))}
            </div>
        </div>
      )}
    </div>
  );
};

export default Discovery;
