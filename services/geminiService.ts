import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { VideoDetails } from '../types';
import { imageUrlToBase64 } from "../utils/helpers";

const languageMap: { [key: string]: string } = {
  'vi': 'Tiếng Việt',
  'en': 'English',
  'es': 'Español',
  'fr': 'Français',
  'de': 'Deutsch',
  'ja': '日本語',
  'ko': '한국어',
};

export const analyzeYoutubeVideo = async (videoDetails: VideoDetails, videoId: string, languageCode: string, apiKey: string): Promise<string> => {
  if (!apiKey) {
    throw new Error("Gemini API key is not provided.");
  }
  const ai = new GoogleGenAI({ apiKey: apiKey });
  const fullVideoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const languageName = languageMap[languageCode] || 'the specified language';

  const prompt = `Bạn là Trợ lý Seo Từng Điểm Chính của Youtube. Nhiệm vụ của bạn là tạo một báo cáo phân tích SEO chuyên sâu, được định dạng bằng Markdown, cho video YouTube được cung cấp. Báo cáo PHẢI được viết bằng ngôn ngữ **${languageName}** và tuân thủ nghiêm ngặt cấu trúc và giọng văn trong ví dụ dưới đây.

**Hãy sử dụng các thông tin bổ sung sau đây để đưa ra phân tích sâu sắc hơn:**
- **Ngày đăng video:** Giúp đánh giá hiệu suất theo thời gian.
- **Chủ đề (Topics):** Hiểu cách YouTube phân loại nội dung này.
- **Quốc gia kênh:** Giúp xác định đối tượng mục tiêu.
- **Trạng thái "Dành cho trẻ em":** Yếu tố quan trọng ảnh hưởng đến tính năng và quảng cáo.

**Dữ liệu Video & Kênh để Phân tích:**
- URL Video: "${fullVideoUrl}"
- Tiêu đề gốc: "${videoDetails.title}"
- Tên kênh: "${videoDetails.channelTitle}"
- URL kênh: "https://www.youtube.com/channel/${videoDetails.channelId}"
- Mô tả gốc: "${videoDetails.description}"
- Tags gốc: ${videoDetails.tags.length > 0 ? videoDetails.tags.join(', ') : 'Không có'}
- Lượt xem: ${new Intl.NumberFormat().format(parseInt(videoDetails.viewCount))}
- Lượt thích: ${new Intl.NumberFormat().format(parseInt(videoDetails.likeCount))}
- Thời lượng: ${videoDetails.duration}
- Ngày đăng video: ${new Date(videoDetails.videoPublishedAt).toLocaleDateString('vi-VN')}
- Chủ đề video (do YouTube xác định): ${videoDetails.videoTopics.join(', ') || 'Không có'}
---
- Lượt đăng ký kênh: ${new Intl.NumberFormat().format(parseInt(videoDetails.subscriberCount))}
- Quốc gia kênh: ${videoDetails.channelCountry}
- Kênh dành cho trẻ em: ${videoDetails.channelIsMadeForKids ? 'Có' : 'Không'}
- Chủ đề kênh (do YouTube xác định): ${videoDetails.channelTopics.join(', ') || 'Không có'}

---

**Cấu trúc Báo cáo Markdown BẮT BUỘC (viết bằng ngôn ngữ ${languageName}):**

Chào bạn, tôi là Trợ lý Seo Từng Điểm Chính của Youtube. Dưới đây là phần phân tích SEO chuyên sâu cho video đối thủ mà bạn cung cấp, cùng với các gợi ý sao chép chiến lược để tối ưu hóa kênh của bạn.

URL Video: [${fullVideoUrl}](${fullVideoUrl})
Tiêu đề gốc: \`${videoDetails.title}\`
Tên kênh: \`${videoDetails.channelTitle}\`

-----

## I. SEO THÔ (RAW SEO)

Phân tích các yếu tố cốt lõi của video:

| Yếu tố | Thông tin/Gợi ý |
| :--- | :--- |
| **Từ khóa chính** | **[Suy ra từ khóa chính quan trọng nhất từ tiêu đề và mô tả gốc. Giữ nguyên ngôn ngữ gốc.]** |
| **Tên kênh** | ${videoDetails.channelTitle} |
| **URL kênh** | https://www.youtube.com/channel/${videoDetails.channelId} |

-----

## II. SEO ON TOP (Chiến lược sao chép)

Để cạnh tranh với đối thủ, bạn cần xây dựng Tiêu đề và Mô tả xoay quanh từ khóa chính **"[Lặp lại từ khóa chính ở đây]"**.

### 1. Tiêu đề chứa từ khóa:

**Tiêu đề đề xuất (tối ưu SEO):**

> [Tạo một tiêu đề mới được tối ưu hóa SEO, viết bằng ngôn ngữ gốc. Tiêu đề này BẮT BUỘC phải dựa trên tiêu đề gốc, giữ lại ý nghĩa cốt lõi và chứa từ khóa chính.]

### 2. Mô tả (SEO Tối ưu)

Mô tả tập trung vào việc lặp lại từ khóa chính 5 lần, sử dụng Timelap để tăng tính điều hướng và đặt Hashtag chứa từ khóa.

| Phần Mô tả | Nội dung chi tiết |
| :--- | :--- |
| **Chứa 5 lần từ khóa chính** | [Viết lại một mô tả chi tiết, hấp dẫn bằng ngôn ngữ gốc. Mô tả BẮT BUỘC phải đề cập đến từ khóa chính đúng 5 lần.] |
| **Timelap: chứa từ khóa chính** | [Tạo các mốc thời gian (Timestamps) hợp lý dựa trên thời lượng video. Ít nhất một mô tả mốc thời gian phải chứa từ khóa chính.] |
| **Hashtag: Đứng đầu, chứa từ khóa chính** | [Tạo các hashtag liên quan, với hashtag đầu tiên là từ khóa chính (không dấu, viết liền).] |

### 3. Bộ từ khóa (Thẻ tags)

Đây là bộ từ khóa quan trọng cần điền vào mục Thẻ (Tags) của video:

  * **Từ khóa chính:** \`[Từ khóa chính]\`
  * **Từ khóa 1:** \`[Từ khóa liên quan 1]\`
  * **Từ khóa 2:** \`[Từ khóa liên quan 2]\`
  * **Từ khóa 3:** \`[Từ khóa liên quan 3]\`
  * **Từ khóa 4:** \`[Từ khóa liên quan 4]\`
  * **Tên kênh:** \`${videoDetails.channelTitle}\`

-----

## III. SAO CHÉP THUMBNAIL ĐỐI THỦ
`;
  
  try {
    const response = await ai.models.generateContent({
      // FIX: Use gemini-2.5-pro for complex text generation tasks like SEO analysis.
      model: 'gemini-2.5-pro',
      contents: prompt,
    });

    return response.text;

  } catch (error) {
    console.error("Error analyzing video with Gemini:", error);
    if (error instanceof Error) {
        try {
            // The API sometimes returns a JSON string in the error message for rate limits or other issues.
            const errorData = JSON.parse(error.message);
            if (errorData?.error?.code === 429) {
                // Standardized quota error message to be caught in App.tsx
                throw new Error("Lỗi hạn ngạch API 429.");
            }
        } catch (e) {
            // Not a JSON error, or not the one we're looking for.
            // The original error will be thrown below.
        }
        throw error; // Re-throw original error if it's not a handled one.
    }
    throw new Error("Không thể phân tích video. Vui lòng thử lại.");
  }
};


export const recreateThumbnail = async (imageUrl: string, prompt: string, apiKey: string): Promise<string> => {
   if (!apiKey) {
    throw new Error("Gemini API key is not provided.");
  }
  const ai = new GoogleGenAI({ apiKey: apiKey });
  try {
    const base64ImageData = await imageUrlToBase64(imageUrl);

    const imagePart = {
      inlineData: {
        data: base64ImageData,
        mimeType: 'image/jpeg',
      },
    };

    const textPart = {
      text: prompt,
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [imagePart, textPart],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    if (!response.candidates || response.candidates.length === 0) {
        const blockReason = response.promptFeedback?.blockReason;
        if (blockReason) {
            throw new Error(`Yêu cầu đã bị chặn vì lý do an toàn: ${blockReason}. Vui lòng thử lại với một ảnh hoặc mô tả khác.`);
        }
        throw new Error("AI không trả về bất kỳ kết quả nào. Phản hồi trống.");
    }

    // FIX: Use optional chaining (?.) to safely access nested properties.
    // This prevents the "Cannot read properties of undefined (reading 'parts')" error.
    for (const part of response.candidates[0]?.content?.parts || []) {
        if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            return `data:image/png;base64,${base64ImageBytes}`;
        }
    }
    
    const textResponse = response.text?.trim();
    if (textResponse) {
        throw new Error(`AI đã trả về văn bản thay vì hình ảnh: "${textResponse}"`);
    }

    throw new Error("Không tìm thấy dữ liệu hình ảnh trong phản hồi của AI.");

  } catch (error) {
    console.error("Error recreating thumbnail with Gemini:", error);
    
    if (error instanceof Error) {
        try {
            // The API sometimes returns a JSON string in the error message for rate limits.
            const errorData = JSON.parse(error.message);
            if (errorData?.error?.code === 429) {
                // Standardized quota error message to be caught in App.tsx
                throw new Error("Lỗi hạn ngạch API 429.");
            }
        } catch (e) {
            // This means the error message was not a JSON string, so it's a different error.
            // We will just throw the original error below.
        }
        
        throw error;
    }
    
    throw new Error("Không thể tạo thumbnail mới. Vui lòng thử lại.");
  }
};