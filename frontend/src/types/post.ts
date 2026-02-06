export type PostCategory = "FREE" | "QNA" | "STUDY";
export type StudyType = "ONLINE" | "OFFLINE" | "HYBRID";
export type RecruitmentStatus = "RECRUITING" | "CLOSED";

export interface Post {
    id: number;
title: string;
content: string;
likeCount: number;
authorName?: string;
attachmentUrls?: string[];
isNotice: boolean;
createdAt?: string;

// ★ 이 필드들이 있어야 화면에 버튼이 나옵니다
authorId?: number;
category?: PostCategory;
studyType?: StudyType;
recruitmentStatus?: RecruitmentStatus;
contactLink?: string;
}