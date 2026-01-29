package com.jpcard.service;

import com.jpcard.domain.post.Post;
import com.jpcard.domain.post.PostAttachment;
import com.jpcard.repository.PostAttachmentRepository;
import com.jpcard.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.Set;
import java.util.HashSet;
import java.util.Arrays;

@Service
@RequiredArgsConstructor
public class PostService {

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final Set<String> ALLOWED_CONTENT_TYPES = new HashSet<>(Arrays.asList(
            "image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf", "text/plain"
    ));

    private final PostRepository postRepository;
    private final PostAttachmentRepository postAttachmentRepository;

    @Transactional(readOnly = true)
    public List<Post> search(String keyword) {
        String searchKey = (keyword != null && !keyword.isEmpty()) ? "%" + keyword.toLowerCase() + "%" : null;
        return postRepository.search(searchKey);
    }

    @Transactional(readOnly = true)
    public List<Post> findNotices() {
        return postRepository.findByIsNoticeTrueOrderByIdDesc();
    }

    @Transactional(readOnly = true)
    public List<Post> findAll() {
        return postRepository.findAll();
    }

    @Transactional
    public Post create(String title, String content, boolean isNotice, String authorName, String ipAddress, List<MultipartFile> files) {
        Post post = new Post();
        post.setTitle(title);
        post.setContent(content);
        post.setNotice(isNotice);
        post.setAuthorName(authorName);
        post.setIpAddress(ipAddress);
        Post savedPost = postRepository.save(post);

        if (files != null && !files.isEmpty()) {
            for (MultipartFile file : files) {
                if (file.isEmpty()) continue;
                validateFile(file);
                try {
                    String originalFilename = file.getOriginalFilename();
                    String storeFilename = createStoreFilename(originalFilename);
                    String fullPath = getFullPath(storeFilename);

                    File dest = new File(fullPath);
                    // Path Traversal Check
                    if (!dest.getCanonicalPath().startsWith(new File("uploads").getCanonicalPath())) {
                         throw new RuntimeException("Invalid file path");
                    }

                    file.transferTo(dest.getAbsoluteFile());

                    PostAttachment attachment = new PostAttachment();
                    attachment.setPost(savedPost);
                    attachment.setOriginalFilename(originalFilename);
                    attachment.setStoreFilename(storeFilename);
                    postAttachmentRepository.save(attachment);

                    savedPost.getAttachments().add(attachment);
                } catch (IOException e) {
                    throw new RuntimeException("Failed to store file", e);
                }
            }
        }
        return savedPost;
    }

    private String createStoreFilename(String originalFilename) {
        String ext = extractExt(originalFilename);
        String uuid = UUID.randomUUID().toString();
        return uuid + "." + ext;
    }

    private String extractExt(String originalFilename) {
        int pos = originalFilename.lastIndexOf(".");
        return (pos == -1) ? "" : originalFilename.substring(pos + 1);
    }

    private String getFullPath(String filename) {
        String uploadDir = "uploads/";
        File dir = new File(uploadDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }
        return uploadDir + filename;
    }

    private void validateFile(MultipartFile file) {
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException("File size exceeds limit (5MB)");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new RuntimeException("Invalid file type: " + contentType);
        }
    }

    @Transactional(readOnly = true)
    public Post findById(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new com.jpcard.util.ResourceNotFoundException("Post not found with id: " + id));
    }

    @Transactional
    public Post update(Long id, String title, String content, boolean isNotice) {
        Post post = findById(id);
        post.setTitle(title);
        post.setContent(content);
        post.setNotice(isNotice);
        return post;
    }

    @Transactional
    public void delete(Long id) {
        postRepository.deleteById(id);
    }

    @Transactional
    public Post likePost(Long id) {
        Post post = findById(id);
        post.setLikeCount(post.getLikeCount() + 1);
        return post;
    }
}
