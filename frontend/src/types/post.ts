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
createdAt?: string; // 작성일

// ★ 이 부분들이 있어야 스터디 기능과 작성자 확인이 됩니다!
authorId?: number;
category?: PostCategory;
studyType?: StudyType;
recruitmentStatus?: RecruitmentStatus;
contactLink?: string;
}