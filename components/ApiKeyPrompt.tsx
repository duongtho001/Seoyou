import React from 'react';

interface ApiKeyPromptProps {
  onSelectKey: () => void;
  error?: string | null;
}

const ApiKeyPrompt: React.FC<ApiKeyPromptProps> = ({ onSelectKey, error }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-gray-200 text-center">
        
        {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-left" role="alert">
              <p className="font-bold">Lỗi:</p>
              <p>{error}</p>
            </div>
        )}

        <button
          onClick={onSelectKey}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition duration-300 ease-in-out mb-4"
        >
          Chọn API Key
        </button>
        <p className="mt-4 text-sm text-gray-500">
          Việc sử dụng API có thể phát sinh chi phí. 
          <a
            href="https://ai.google.dev/gemini-api/docs/billing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline ml-1"
          >
            Tìm hiểu thêm về thanh toán.
          </a>
        </p>
      </div>
    </div>
  );
};

export default ApiKeyPrompt;
