package com.jpcard.service;

import com.jpcard.domain.post.Post;
import com.jpcard.domain.post.PostAttachment;
import com.jpcard.domain.user.User;
import com.jpcard.domain.user.Role;
import com.jpcard.repository.PostAttachmentRepository;
import com.jpcard.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
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
    public Post create(String title, String content, boolean isNotice, String authorName, String ipAddress, List<MultipartFile> files, User author) {
        Post post = new Post();
        post.setTitle(title);
        post.setContent(content);
        post.setNotice(isNotice);
        post.setAuthorName(authorName);
        post.setIpAddress(ipAddress);
        post.setAuthor(author);
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
	public Post update(Long id, String title, String content, boolean isNotice, User currentUser) { // String -> User로 변경
		// 1. 게시글 존재 여부 확인
		Post post = findById(id);
		
		// 2. 권한 체크 (수정한 checkOwner 메서드 호출)
		checkOwner(post, currentUser);
		
		// 3. 데이터 업데이트
		post.setTitle(title);
		post.setContent(content);
		post.setNotice(isNotice);
		
		return post;
	}
	
	@Transactional
	public void delete(Long id, User currentUser) { // String -> User로 변경
		// 1. 게시글 존재 여부 확인
		Post post = findById(id);
		
		// 2. 권한 체크
		checkOwner(post, currentUser);
		
		// 3. 삭제 수행
		postRepository.deleteById(id);
	}
	
	private void checkOwner(Post post, User user) {
		if (user == null) {
			throw new AccessDeniedException("로그인이 필요한 서비스입니다.");
		}
		
		// 관리자 또는 매니저 권한 확인
		boolean isManager = user.getRoles().contains(Role.ROLE_MANAGER) ||
				user.getRoles().contains(Role.ROLE_ADMIN);
		
		if (post.getAuthor() != null) {
			// 작성자 본인도 아니고 관리자도 아닌 경우
			if (!post.getAuthor().getId().equals(user.getId()) && !isManager) {
				throw new AccessDeniedException("해당 게시글에 대한 수정/삭제 권한이 없습니다.");
			}
		} else {
			// 작성자 정보가 없는 구버전/익명 게시글의 경우 관리자만 제어 가능
			if (!isManager) {
				throw new AccessDeniedException("해당 게시글을 수정/삭제할 권한이 없습니다.");
			}
        }
    }

    @Transactional
    public Post likePost(Long id) {
        Post post = findById(id);
        post.setLikeCount(post.getLikeCount() + 1);
        return post;
    }
}
