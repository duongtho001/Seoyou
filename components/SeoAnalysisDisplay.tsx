import React, { useMemo } from 'react';
import ClipboardIcon from './icons/ClipboardIcon';

const useCopyToClipboard = () => {
  const [copiedText, setCopiedText] = React.useState<string | null>(null);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2000); // Reset after 2 seconds
      return true;
    } catch (error) {
      console.warn('Copy failed', error);
      setCopiedText(null);
      return false;
    }
  };

  return { copiedText, copy };
};

// Declare marked for TypeScript to access it from the global window object
declare global {
  interface Window {
    marked: {
      parse: (markdownString: string) => string;
    };
  }
}

interface SeoAnalysisDisplayProps {
  analysisResult: string;
}

const SeoAnalysisDisplay: React.FC<SeoAnalysisDisplayProps> = ({ analysisResult }) => {
    const { copiedText, copy } = useCopyToClipboard();
    const isCopied = copiedText === analysisResult;

    const renderedHtml = useMemo(() => {
        // Check if the marked library is available on the window object
        if (window.marked?.parse) {
            return window.marked.parse(analysisResult);
        }
        return null; // Return null if marked is not available
    }, [analysisResult]);

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 relative">
            <button
                onClick={() => copy(analysisResult)}
                className="absolute top-4 right-4 p-2 rounded-md bg-gray-200 hover:bg-gray-300 transition-colors text-gray-600 hover:text-black z-10"
                aria-label="Copy full report to clipboard"
            >
                {isCopied ? (
                    <span className="text-sm text-green-600">Đã chép!</span>
                ) : (
                    <ClipboardIcon />
                )}
            </button>
            <h2 className="text-3xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-600">
                Báo cáo Phân tích SEO
            </h2>
            {renderedHtml ? (
                 <div 
                    className="markdown-content text-gray-800 font-sans text-base"
                    dangerouslySetInnerHTML={{ __html: renderedHtml }}
                />
            ) : (
                 <pre className="text-gray-800 whitespace-pre-wrap font-sans text-base overflow-x-auto bg-gray-100 p-4 rounded-lg">
                    {analysisResult}
                </pre>
            )}
        </div>
    );
};

export default SeoAnalysisDisplay;