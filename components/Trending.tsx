
import React, { useState, useEffect } from 'react';
import type { SearchResultItem } from '../types';
import { extractKeywordsFromTitles } from '../utils/trends';

interface TrendingProps {
  onGetTrends: (regionCode: string) => Promise<SearchResultItem[]>;
  onKeywordSelect: (keyword: string) => void;
}

const COUNTRIES = [
    { code: 'VN', name: 'Việt Nam' },
    { code: 'EG', name: 'Ai Cập (EG)' },
    { code: 'AR', name: 'Argentina (AR)' },
    { code: 'IN', name: 'Ấn Độ (IN)' },
    { code: 'PL', name: 'Ba Lan (PL)' },
    { code: 'BR', name: 'Brazil (BR)' },
    { code: 'CA', name: 'Canada (CA)' },
    { code: 'TW', name: 'Đài Loan (TW)' },
    { code: 'DE', name: 'Đức (DE)' },
    { code: 'NL', name: 'Hà Lan (NL)' },
    { code: 'KR', name: 'Hàn Quốc (KR)' },
    { code: 'US', name: 'Hoa Kỳ (US)' },
    { code: 'HK', name: 'Hồng Kông (HK)' },
    { code: 'ID', name: 'Indonesia (ID)' },
    { code: 'MY', name: 'Malaysia (MY)' },
    { code: 'MX', name: 'Mexico (MX)' },
    { code: 'ZA', name: 'Nam Phi (ZA)' },
    { code: 'RU', name: 'Nga (RU)' },
    { code: 'JP', name: 'Nhật Bản (JP)' },
    { code: 'NG', name: 'Nigeria (NG)' },
    { code: 'FR', name: 'Pháp (FR)' },
    { code: 'PH', name: 'Philippines (PH)' },
    { code: 'SG', name: 'Singapore (SG)' },
    { code: 'ES', name: 'Tây Ban Nha (ES)' },
    { code: 'TH', name: 'Thái Lan (TH)' },
    { code: 'TR', name: 'Thổ Nhĩ Kỳ (TR)' },
    { code: 'SE', name: 'Thụy Điển (SE)' },
    { code: 'AU', name: 'Úc (AU)' },
    { code: 'GB', name: 'Vương quốc Anh (GB)' },
    { code: 'IT', name: 'Ý (IT)' },
];

const Trending: React.FC<TrendingProps> = ({ onGetTrends, onKeywordSelect }) => {
  const [selectedCountry, setSelectedCountry] = useState('VN');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrends = async () => {
      setError(null);
      setIsLoading(true);
      setKeywords([]);
      try {
        const videos = await onGetTrends(selectedCountry);
        const titles = videos.map(v => v.title);
        const lang = selectedCountry === 'VN' ? 'vi' : 'en';
        const extracted = extractKeywordsFromTitles(titles, lang);
        setKeywords(extracted);
        if (extracted.length === 0) {
            setError('Không thể trích xuất từ khóa. Có thể không có đủ dữ liệu thịnh hành.');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrends();
  }, [selectedCountry, onGetTrends]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
            Gợi Ý Trend Thịnh Hành
        </h3>
        <div className="max-w-xs mx-auto mb-6">
            <label htmlFor="country-select" className="sr-only">Chọn quốc gia</label>
            <select
                id="country-select"
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full bg-gray-100 border border-gray-300 text-gray-800 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200"
                disabled={isLoading}
            >
                {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
            </select>
        </div>

        {isLoading && (
            <div className="flex justify-center items-center h-24">
                 <svg className="animate-spin h-8 w-8 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
        )}
        {error && <p className="text-red-500 text-center my-4">{error}</p>}
        
        {!isLoading && keywords.length > 0 && (
             <div className="flex flex-wrap justify-center gap-3">
                {keywords.map((keyword, index) => (
                    <button
                        key={index}
                        onClick={() => onKeywordSelect(keyword)}
                        className="bg-purple-100 text-purple-800 text-sm font-semibold px-4 py-2 rounded-full hover:bg-purple-200 hover:shadow-md transition-all duration-200"
                        title={`Tìm kiếm video với từ khóa "${keyword}"`}
                    >
                        #{keyword}
                    </button>
                ))}
            </div>
        )}
    </div>
  );
};
export default Trending;