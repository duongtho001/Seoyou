import React, { useState, useEffect } from 'react';

interface ApiKeyManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (keys: string[]) => void;
  initialKeys: string[];
}

const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ isOpen, onClose, onSave, initialKeys }) => {
  const [keysInput, setKeysInput] = useState('');

  useEffect(() => {
    if (initialKeys) {
      setKeysInput(initialKeys.join('\n'));
    }
  }, [initialKeys]);

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    const keys = keysInput.split('\n').map(k => k.trim()).filter(Boolean);
    onSave(keys);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Quản lý Gemini API Key</h2>
        <p className="text-gray-600 mb-4">
          Nhập các API key của bạn, mỗi key một dòng. Ứng dụng sẽ tự động chuyển sang key tiếp theo nếu key hiện tại hết hạn ngạch.
        </p>
        <textarea
          value={keysInput}
          onChange={(e) => setKeysInput(e.target.value)}
          placeholder="AIzaSy...
AIzaSy...
AIzaSy..."
          rows={8}
          className="w-full bg-gray-100 border border-gray-300 text-gray-800 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200"
          aria-label="API Keys Input"
        />
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-pink-700 transition duration-300 ease-in-out"
          >
            Lưu API Keys
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyManager;
