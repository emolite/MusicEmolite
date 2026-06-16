export interface YoutubeVideoResponse {
  videoId: string;
  kind: string;
  etag: string;

  title: string;
  description: string;
  channelId: string;
  channel: string;
  publishedAt: string | null;

  thumbnailDefault: string;
  thumbnailMedium: string;
  thumbnailHigh: string;
  thumbnailStandard: string;
  thumbnailMaxres: string;

  liveBroadcastContent: string;
  publishTime: string;

  durationRaw: string;
  duration: number;

  dimension: string;
  definition: string;
  caption: boolean;
  licensedContent: boolean;
  projection: string;

  views: number;
  likeCount: number;
  commentCount: number;

  embeddable: boolean;
  publicStatsViewable: boolean;
  privacyStatus: string;
  uploadStatus: string;

  embedHtml: string;
}