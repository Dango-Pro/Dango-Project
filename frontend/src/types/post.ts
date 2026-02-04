export type PostCategory = "FREE" | "QNA" | "STUDY";
export type StudyType = "ONLINE" | "OFFLINE" | "HYBRID";
export type RecruitmentStatus = "OPEN" | "CLOSED";

export interface Post {
    id: number;
title: string;
content: string;
likeCount: number;
authorName?: string;
attachmentUrls?: string[];
isNotice: boolean;

// ★ 추가된 필드들
category: PostCategory;
studyType?: StudyType;
recruitmentStatus?: RecruitmentStatus;
contactLink?: string;
}