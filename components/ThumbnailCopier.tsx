import React, { useState } from 'react';
import SparklesIcon from './icons/SparklesIcon';

interface ThumbnailCopierProps {
  originalThumbnailUrl: string;
  generatedThumbnail: string | null;
  onRecreate: (prompt: string) => void;
  isLoading: boolean;
}

const ThumbnailCopier: React.FC<ThumbnailCopierProps> = ({ originalThumbnailUrl, generatedThumbnail, onRecreate, isLoading }) => {
  const [prompt, setPrompt] = useState('Tạo một thumbnail tương tự với phong cách điện ảnh, màu sắc rực rỡ và văn bản nổi bật.');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRecreate(prompt);
  };

  const handleDownload = () => {
    if (!generatedThumbnail) return;
    const link = document.createElement('a');
    link.href = generatedThumbnail;
    link.download = 'generated-thumbnail.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
      <h2 className="text-2xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-red-500">
        Sao chép Thumbnail bằng AI (Nano Banana)
      </h2>

      <div className="grid md:grid-cols-2 gap-6 items-start">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Thumbnail đối thủ</h3>
          <img 
            src={originalThumbnailUrl} 
            alt="Original Thumbnail" 
            className="rounded-lg shadow-md w-full aspect-video object-cover"
            onError={(e) => {
              // Fallback to standard quality if max resolution fails
              e.currentTarget.src = originalThumbnailUrl.replace('maxresdefault.jpg', 'sddefault.jpg');
            }}
          />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Thumbnail tạo bởi AI</h3>
          <div className="relative">
            <div className="rounded-lg shadow-md w-full aspect-video bg-gray-200 flex items-center justify-center">
              {isLoading ? (
                <div className="flex flex-col items-center text-gray-600">
                  <svg className="animate-spin h-8 w-8 text-gray-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Đang tạo...</span>
                </div>
              ) : generatedThumbnail ? (
                <img src={generatedThumbnail} alt="Generated Thumbnail" className="rounded-lg w-full aspect-video object-cover" />
              ) : (
                <div className="text-gray-500">Kết quả sẽ hiển thị ở đây</div>
              )}
            </div>
            {!isLoading && generatedThumbnail && (
               <button
                  onClick={handleDownload}
                  className="absolute bottom-2 right-2 bg-white text-gray-800 font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-gray-100 transition duration-300 ease-in-out flex items-center gap-2"
                  aria-label="Download generated thumbnail"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 9.293a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Tải xuống
                </button>
            )}
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="mt-6">
         <label htmlFor="thumbnail-prompt" className="block text-md font-medium text-gray-700 mb-2">
          Mô tả yêu cầu của bạn
        </label>
        <textarea
          id="thumbnail-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Mô tả ý tưởng thumbnail của bạn..."
          rows={3}
          className="w-full bg-gray-100 border border-gray-300 text-gray-800 rounded-lg p-3 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition duration-200"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="mt-4 w-full bg-gradient-to-r from-pink-600 to-red-600 text-white font-bold py-3 px-6 rounded-lg hover:from-pink-700 hover:to-red-700 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          disabled={isLoading || !prompt}
        >
          <SparklesIcon />
          {isLoading ? 'Đang tạo...' : 'Tạo lại Thumbnail'}
        </button>
      </form>
    </div>
  );
};

export default ThumbnailCopier;