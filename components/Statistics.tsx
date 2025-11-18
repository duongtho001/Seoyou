
import React, { useState } from 'react';
import type { VideoStatistic } from '../types';
import { extractVideoId } from '../utils/helpers';

interface StatisticsProps {
  onGetStats: (videoIds: string[]) => Promise<VideoStatistic[]>;
}

const Statistics: React.FC<StatisticsProps> = ({ onGetStats }) => {
  const [videoUrlsInput, setVideoUrlsInput] = useState('');
  const [stats, setStats] = useState<VideoStatistic[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const urls = videoUrlsInput.split(/[\n\s,]+/).map(url => url.trim()).filter(Boolean);
    const videoIds = urls.map(url => extractVideoId(url)).filter((id): id is string => id !== null);

    if (videoIds.length === 0) {
      setError('Vui lòng nhập ít nhất một URL video YouTube hợp lệ.');
      return;
    }
    
    setError(null);
    setIsLoading(true);
    setStats([]);

    try {
      const result = await onGetStats(videoIds);
      setStats(result);
      if (result.length === 0) {
        setError('Không tìm thấy thông tin cho các URL đã cung cấp.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
        Lấy Thống Kê Hàng Loạt
      </h3>
       <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          value={videoUrlsInput}
          onChange={(e) => setVideoUrlsInput(e.target.value)}
          placeholder="Dán danh sách URL video, mỗi URL một dòng..."
          rows={5}
          className="w-full bg-gray-100 border border-gray-300 text-gray-800 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="mt-4 w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          disabled={isLoading || !videoUrlsInput}
        >
          {isLoading ? (
            <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang lấy...
            </>
          ) : (
            'Lấy Thống Kê'
          )}
        </button>
      </form>
      
      {error && <p className="text-red-500 text-center my-4">{error}</p>}

      {stats.length > 0 && (
        <div className="space-y-8">
            <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                        <tr>
                            <th scope="col" className="px-4 py-3">Thumbnail</th>
                            <th scope="col" className="px-4 py-3">Tiêu đề</th>
                            <th scope="col" className="px-4 py-3 text-right">Lượt xem</th>
                            <th scope="col" className="px-4 py-3 text-right">Lượt thích</th>
                            <th scope="col" className="px-4 py-3 text-right">Bình luận</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stats.map(video => (
                            <tr key={video.videoId} className="bg-white border-b hover:bg-gray-50">
                                <td className="p-2">
                                    <a href={`https://www.youtube.com/watch?v=${video.videoId}`} target="_blank" rel="noopener noreferrer">
                                        <img src={video.thumbnailUrl} alt="thumbnail" className="w-24 h-auto rounded hover:opacity-80 transition-opacity"/>
                                    </a>
                                </td>
                                <th scope="row" className="px-4 py-3 font-medium text-gray-900 whitespace-normal">
                                    <a href={`https://www.youtube.com/watch?v=${video.videoId}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                        {video.title}
                                    </a>
                                </th>
                                <td className="px-4 py-3 text-right">{video.viewCount}</td>
                                <td className="px-4 py-3 text-right">{video.likeCount}</td>
                                <td className="px-4 py-3 text-right">{video.commentCount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}
    </div>
  );
};

export default Statistics;
