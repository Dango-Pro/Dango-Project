export interface Comment {
  id: number;
  content: string;
  postId: number;
  authorName?: string;
  parentId?: number;
  replies?: Comment[];
}
