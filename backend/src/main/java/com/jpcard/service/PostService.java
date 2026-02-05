package com.jpcard.service;

import com.jpcard.domain.post.*;
import com.jpcard.domain.user.User;
import com.jpcard.domain.user.Role;
import com.jpcard.repository.PostAttachmentRepository;
import com.jpcard.repository.PostRepository;
import com.jpcard.repository.StudyApplicationRepository; // ★ 추가됨
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PostService {
	
	private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
	private static final Set<String> ALLOWED_CONTENT_TYPES = new HashSet<>(Arrays.asList(
			"image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf", "text/plain"
	));
	
	private final PostRepository postRepository;
	private final PostAttachmentRepository postAttachmentRepository;
	private final StudyApplicationRepository studyApplicationRepository; // ★ 추가됨
	
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
	
	// ★ [수정됨] 매개변수 10개로 확장 (Controller와 일치시킴)
	@Transactional
	public Post create(String title, String content, boolean isNotice, String authorName, String ipAddress,
					   List<MultipartFile> files, User author,
					   PostCategory category, StudyType studyType, String contactLink) {
		
		// 1. 기본 정보 설정
		Post post = new Post();
		post.setTitle(title);
		post.setContent(content);
		post.setNotice(isNotice);
		post.setAuthorName(authorName);
		post.setIpAddress(ipAddress);
		post.setAuthor(author);
		post.setCategory(category); // 카테고리 설정
		
		// 2. 스터디 모집 정보 설정 (STUDY일 때만)
		if (category == PostCategory.STUDY) {
			StudyRecruitment recruitment = new StudyRecruitment(post, studyType, contactLink);
			post.setStudyRecruitment(recruitment);
		}
		
		Post savedPost = postRepository.save(post);
		
		// 3. 파일 저장 로직 (회원님 기존 코드 유지)
		if (files != null && !files.isEmpty()) {
			for (MultipartFile file : files) {
				if (file.isEmpty()) continue;
				validateFile(file);
				try {
					String originalFilename = file.getOriginalFilename();
					String storeFilename = createStoreFilename(originalFilename);
					String fullPath = getFullPath(storeFilename);
					
					File dest = new File(fullPath);
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
	
	// --- 파일 관련 유틸리티 (기존 유지) ---
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
	public Post update(Long id, String title, String content, boolean isNotice, User currentUser) {
		Post post = findById(id);
		checkOwner(post, currentUser);
		post.setTitle(title);
		post.setContent(content);
		post.setNotice(isNotice);
		return post;
	}
	
	@Transactional
	public void delete(Long id, User currentUser) {
		Post post = findById(id);
		checkOwner(post, currentUser);
		postRepository.deleteById(id);
	}
	
	private void checkOwner(Post post, User user) {
		if (user == null) {
			throw new AccessDeniedException("로그인이 필요한 서비스입니다.");
		}
		boolean isManager = user.getRoles().contains(Role.ROLE_MANAGER) ||
				user.getRoles().contains(Role.ROLE_ADMIN);
		
		if (post.getAuthor() != null) {
			if (!post.getAuthor().getId().equals(user.getId()) && !isManager) {
				throw new AccessDeniedException("해당 게시글에 대한 수정/삭제 권한이 없습니다.");
			}
		} else {
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
	
	// --- ★ [추가됨] 스터디 신청 관련 메서드 ---
	
	@Transactional
	public void applyStudy(Long postId, User applicant, String message, String contactInfo) {
		Post post = findById(postId);
		
		if (post.getAuthor() != null && post.getAuthor().getId().equals(applicant.getId())) {
			throw new IllegalArgumentException("본인이 모집한 스터디에는 신청할 수 없습니다.");
		}
		
		if (studyApplicationRepository.findByPostIdAndApplicantId(postId, applicant.getId()).isPresent()) {
			throw new IllegalArgumentException("이미 신청한 스터디입니다.");
		}
		
		StudyApplication application = new StudyApplication(post, applicant, message, contactInfo);
		studyApplicationRepository.save(application);
	}
	
	@Transactional(readOnly = true)
	public List<StudyApplication> getApplications(Long postId, User currentUser) {
		Post post = findById(postId);
		
		// 작성자 본인 확인
		if (post.getAuthor() != null && !post.getAuthor().getId().equals(currentUser.getId())) {
			throw new AccessDeniedException("신청자 목록은 작성자만 볼 수 있습니다.");
		}
		
		return studyApplicationRepository.findByPostId(postId);
	}
	
	@Transactional(readOnly = true)
	public boolean hasApplied(Long postId, User currentUser) {
		if (currentUser == null) return false;
		return studyApplicationRepository.findByPostIdAndApplicantId(postId, currentUser.getId()).isPresent();
	}
}