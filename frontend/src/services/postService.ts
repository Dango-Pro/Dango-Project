import { api } from "../libs/api";

export interface PostData {
    title: string;
    content: string;
    isNotice: boolean;
    files?: FileList | null;
}

export const postService = {
    createPost: async (data: PostData) => {
        const formData = new FormData();
        formData.append("title", data.title);
        formData.append("content", data.content);
        formData.append("isNotice", data.isNotice.toString());
        if (data.files) {
            for (let i = 0; i < data.files.length; i++) {
                formData.append("files", data.files[i]);
            }
        }
        return await api.post("/posts", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },
    // Future expansion: getPosts, getPost, etc.
};
