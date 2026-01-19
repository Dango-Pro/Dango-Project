export interface Post {
  id: number;
  title: string;
  content: string;
  likeCount: number;
  authorName?: string;
  attachmentUrls?: string[];
  isNotice: boolean;
}
