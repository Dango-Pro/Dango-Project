package com.jpcard.service;

import com.jpcard.domain.post.*;
import com.jpcard.domain.user.User;
import com.jpcard.domain.user.Role;
import com.jpcard.repository.PostAttachmentRepository;
import com.jpcard.repository.PostRepository;
import com.jpcard.repository.StudyApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
	
	private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;
	private static final Set<String> ALLOWED_CONTENT_TYPES = new HashSet<>(Arrays.asList(
			"image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf", "text/plain"
	));
	
	private final PostRepository postRepository;
	private final PostAttachmentRepository postAttachmentRepository;
	private final StudyApplicationRepository studyApplicationRepository;
	
	@Transactional(readOnly = true)
	public Page<Post> search(String keyword, Pageable pageable) {
		String searchKey = (keyword != null && !keyword.isEmpty()) ? "%" + keyword.toLowerCase() + "%" : null;
		return postRepository.search(searchKey, pageable);
	}
	
	@Transactional(readOnly = true)
	public List<Post> findNotices() {
		return postRepository.findByIsNoticeTrueOrderByIdDesc();
	}
	
	@Transactional
	public Post create(String title, String content, boolean isNotice, String authorName, String ipAddress,
					   List<MultipartFile> files, User author,
					   PostCategory category, StudyType studyType, String contactLink) {
		
		Post post = new Post();
		post.setTitle(title);
		post.setContent(content);
		post.setNotice(isNotice);
		post.setAuthorName(authorName);
		post.setIpAddress(ipAddress);
		post.setAuthor(author);
		post.setCategory(category);
		
		if (category == PostCategory.STUDY) {
			StudyRecruitment recruitment = new StudyRecruitment(post, studyType, contactLink);
			post.setStudyRecruitment(recruitment);
		}
		
		Post savedPost = postRepository.save(post);
		saveAttachments(files, savedPost);
		return savedPost;
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
	
	@Transactional
	public Post likePost(Long id) {
		Post post = findById(id);
		post.setLikeCount(post.getLikeCount() + 1);
		return post;
	}
	
	// --- 스터디 기능 ---
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
		checkOwner(post, currentUser); // 작성자만 볼 수 있음
		return studyApplicationRepository.findByPostId(postId);
	}
	
	@Transactional(readOnly = true)
	public boolean hasApplied(Long postId, User currentUser) {
		if (currentUser == null) return false;
		return studyApplicationRepository.findByPostIdAndApplicantId(postId, currentUser.getId()).isPresent();
	}
	
	@Transactional
	public void cancelApplication(Long postId, User applicant) {
		StudyApplication application = studyApplicationRepository.findByPostIdAndApplicantId(postId, applicant.getId())
				.orElseThrow(() -> new IllegalArgumentException("신청 내역이 존재하지 않습니다."));
		studyApplicationRepository.delete(application);
	}
	
	@Transactional
	public void updateRecruitmentStatus(Long postId, User user, RecruitmentStatus status) {
		Post post = findById(postId);
		checkOwner(post, user);
		if (post.getStudyRecruitment() != null) {
			post.getStudyRecruitment().setRecruitmentStatus(status);
		}
	}
	
	// --- 유틸리티 ---
	@Transactional(readOnly = true)
	public Post findById(Long id) {
		return postRepository.findById(id)
				.orElseThrow(() -> new com.jpcard.util.ResourceNotFoundException("Post not found: " + id));
	}
	
	private void checkOwner(Post post, User user) {
		if (user == null) throw new AccessDeniedException("로그인이 필요합니다.");
		boolean isManager = user.getRoles().contains(Role.ROLE_MANAGER) || user.getRoles().contains(Role.ROLE_ADMIN);
		if (post.getAuthor() != null && !post.getAuthor().getId().equals(user.getId()) && !isManager) {
			throw new AccessDeniedException("권한이 없습니다.");
		}
	}
	
	private void saveAttachments(List<MultipartFile> files, Post post) {
		if (files == null || files.isEmpty()) return;
		for (MultipartFile file : files) {
			if (file.isEmpty()) continue;
			try {
				String original = file.getOriginalFilename();
				String store = UUID.randomUUID() + "." + (original.contains(".") ? original.substring(original.lastIndexOf(".") + 1) : "");
				File dest = new File("uploads/" + store);
				dest.getParentFile().mkdirs();
				file.transferTo(dest);
				
				PostAttachment att = new PostAttachment();
				att.setPost(post);
				att.setOriginalFilename(original);
				att.setStoreFilename(store);
				postAttachmentRepository.save(att);
				post.getAttachments().add(att);
			} catch (IOException e) {
				throw new RuntimeException("File upload failed", e);
			}
		}
	}
}