
// Basic stop words for Vietnamese and English, expanded for better filtering.
// Stop words are common words that are often filtered out in natural language processing.
const VIETNAMESE_STOP_WORDS = new Set([
  'và', 'là', 'của', 'có', 'một', 'cho', 'không', 'được', 'với', 'trong', 'để', 
  'khi', 'thì', 'mà', 'tại', 'này', 'đã', 'ra', 'về', 'từ', 'cách', 'làm', 'video', 
  'youtube', 'phần', 'tập', 'đầy', 'đủ', 'mới', 'nhất', 'hot', 'trend', 'top', 
  'thử', 'xem', 'review', 'hướng', 'dẫn', 'shorts', 'tiktok', 'cùng', 'đến', 
  'như', 'những', 'cũng', 'sẽ', 'đó', 'đây', 'chỉ', 'còn', 'lại', 'thêm', 'tôi', 'bạn'
]);

const ENGLISH_STOP_WORDS = new Set([
  'a', 'an', 'and', 'the', 'is', 'in', 'it', 'of', 'for', 'on', 'with', 'to', 'this',
  'that', 'how', 'video', 'youtube', 'new', 'part', 'episode', 'hot', 'top', 'trending',
  'shorts', 'vs', 'ft', 'i', 'me', 'my', 'you', 'your', 'he', 'she', 'we', 'our', 'they',
  'them', 'what', 'who', 'when', 'where', 'why', 'official', 'music', 'trailer'
]);

const getStopWords = (lang: 'vi' | 'en') => {
    return lang === 'vi' ? VIETNAMESE_STOP_WORDS : ENGLISH_STOP_WORDS;
}

export const extractKeywordsFromTitles = (titles: string[], lang: 'vi' | 'en' = 'vi'): string[] => {
    const stopWords = getStopWords(lang);
    const wordCounts: { [key: string]: number } = {};
    
    titles.forEach(title => {
        // Normalize: lowercase, remove punctuation, special characters, and numbers.
        // Also remove content in parentheses or brackets which often contains non-keyword info.
        const words = title
            .toLowerCase()
            .replace(/\[.*?\]/g, '') // remove content in square brackets
            .replace(/\(.*?\)/g, '')  // remove content in parentheses
            .replace(/[|“”".,\/#!$%\^&\*;:{}=\-_`~()\[\]\d]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 2 && !stopWords.has(word));

        words.forEach(word => {
            wordCounts[word] = (wordCounts[word] || 0) + 1;
        });
    });

    // Convert to array, filter for words that appear more than once, sort by count, and take the top 15
    const sortedKeywords = Object.entries(wordCounts)
        .filter(([, count]) => count > 1) // Only include keywords that appear at least twice
        .sort(([, a], [, b]) => b - a)
        .slice(0, 15)
        .map(([word]) => word);

    return sortedKeywords;
};
