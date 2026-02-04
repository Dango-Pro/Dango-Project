export interface Post {
  id: number;
  title: string;
  content: string;
  likeCount: number;
  authorName?: string;
  authorId?: number;
  attachmentUrls?: string[];
  isNotice: boolean;
}
