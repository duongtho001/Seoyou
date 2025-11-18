import React from 'react';
import type { HistoryItem } from '../types';
import ClockIcon from './icons/ClockIcon';
import TrashIcon from './icons/TrashIcon';
import XCircleIcon from './icons/XCircleIcon';


interface HistoryProps {
  history: HistoryItem[];
  onItemClick: (url: string) => void;
  onDeleteItem: (videoId: string) => void;
  onClearHistory: () => void;
}

const History: React.FC<HistoryProps> = ({ history, onItemClick, onDeleteItem, onClearHistory }) => {
  if (history.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 bg-white p-6 rounded-xl shadow-md border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <ClockIcon />
          Lịch sử Phân tích
        </h2>
        <button
          onClick={onClearHistory}
          className="text-sm text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 transition-colors"
          aria-label="Clear all history"
        >
          <TrashIcon />
          Xóa tất cả
        </button>
      </div>
      <ul className="space-y-2">
        {history.map((item) => (
          <li key={item.videoId} className="group flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <button
              onClick={() => onItemClick(item.url)}
              className="text-left flex-grow"
            >
              <p className="text-gray-700 font-medium truncate group-hover:text-purple-600" title={item.title}>
                {item.title}
              </p>
              <p className="text-xs text-gray-500 truncate" title={item.url}>
                {item.url}
              </p>
            </button>
            <button
              onClick={() => onDeleteItem(item.videoId)}
              className="ml-4 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label={`Delete ${item.title}`}
            >
              <XCircleIcon />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default History;
