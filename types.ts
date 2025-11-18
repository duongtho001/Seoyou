
// Fix: Correctly define the VideoDetails interface. The previous content was incorrect.
export interface VideoDetails {
  title: string;
  description: string;
  channelId: string;
  channelTitle: string;
  tags: string[];
  viewCount: string;
  likeCount: string;
  commentCount: string;
  duration: string;
  hasCaptions: boolean;
  videoPublishedAt: string;
  videoTopics: string[];
  subscriberCount: string;
  channelDescription: string;
  channelPublishedAt: string;
  channelViewCount: string;
  channelVideoCount: string;
  channelKeywords: string[];
  channelCountry: string;
  channelIsMadeForKids: boolean;
  channelTopics: string[];
}

export interface HistoryItem {
  url: string;
  title: string;
  videoId: string;
}

export interface SearchResultItem {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  publishedAt: string; // ISO 8601 format string
}

export interface VideoStatistic {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  viewCount: string;
  likeCount: string;
  commentCount: string;
}
