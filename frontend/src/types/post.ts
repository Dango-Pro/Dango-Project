export type RecruitmentStatus = "RECRUITING" | "CLOSED";
export type StudyType = "ONLINE" | "OFFLINE" | "HYBRID";
export type PostCategory = "FREE" | "QNA" | "STUDY";

export interface Post {
  id: number;
  title: string;
  content: string;
  likeCount: number;
  viewCount?: number;
  authorName?: string;
  authorId?: number | null;
  attachmentUrls?: string[];
  isNotice: boolean;
  category?: PostCategory;
  recruitmentStatus?: RecruitmentStatus | null;
  studyType?: StudyType | null;
  contactLink?: string | null;
  createdAt?: string;
}

export interface StudyApplicationResponse {
  id: number;
  applicantId: number | null;
  applicantName: string;
  message: string;
  contactInfo: string;
  appliedAt: string;
}
