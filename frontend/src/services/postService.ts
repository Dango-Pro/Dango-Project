import { api } from "../libs/api";
import type { PostCategory, StudyType } from "../types/post";

export interface PostData {
title: string;
content: string;
isNotice: boolean;
files?: FileList | null;

// ★ 추가된 필드들
category: PostCategory;
studyType?: StudyType;
contactLink?: string;
}

export const postService = {
createPost: async (data: PostData) => {
        const formData = new FormData();
        formData.append("title", data.title);
        formData.append("content", data.content);
        formData.append("isNotice", data.isNotice.toString());

        // ★ 카테고리 필수 전송
        formData.append("category", data.category);

        // ★ 스터디 모집일 때만 전송
        if (data.category === "STUDY") {
            if (data.studyType) formData.append("studyType", data.studyType);
            if (data.contactLink) formData.append("contactLink", data.contactLink);
        }

        if (data.files) {
            for (let i = 0; i < data.files.length; i++) {
                formData.append("files", data.files[i]);
            }
        }
        return await api.post("/posts", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },
};