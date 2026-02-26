package com.jpcard.service;

import com.jpcard.controller.dto.StudyApplicationResponse;
import com.jpcard.domain.post.*;
import com.jpcard.domain.user.User;
import com.jpcard.repository.PostAttachmentRepository;
import com.jpcard.repository.PostRepository;
import com.jpcard.repository.StudyApplicationRepository;
import com.jpcard.util.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostService {
	
	private final PostRepository postRepository;
	private final PostAttachmentRepository postAttachmentRepository;
	private final StudyApplicationRepository studyApplicationRepository;
	
	@Transactional(readOnly = true)
	public Page<Post> search(String keyword, PostCategory category, Long authorId, Pageable pageable) {
		// 공지 상단 고정: isNotice DESC, id DESC
		Pageable sorted = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(),
				Sort.by(Sort.Order.desc("isNotice"), Sort.Order.desc("id")));
		String kw = (keyword != null && !keyword.isBlank()) ? keyword : null;
		return postRepository.searchWithAuthor(kw, category, authorId, sorted);
	}
	
	@Transactional(readOnly = true)
	public Post findById(Long id) {
		return postRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("게시글을 찾을 수 없습니다."));
	}
	
	@Transactional
	public void incrementViewCount(Long id) {
		Post post = findById(id);
		post.setViewCount(post.getViewCount() + 1);
		postRepository.save(post);
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
		post.setCreatedAt(LocalDateTime.now());
		
		if (category == PostCategory.STUDY) {
			StudyRecruitment recruitment = new StudyRecruitment(post, studyType, contactLink);
			post.setStudyRecruitment(recruitment);
		}
		
		Post savedPost = postRepository.save(post);
		saveAttachments(files, savedPost);
		return savedPost;
	}
	
	@Transactional
	public Post update(Long id, String title, String content, boolean isNotice, User user) {
		Post post = findById(id);
		// 권한 체크 로직 필요 시 추가
		post.setTitle(title);
		post.setContent(content);
		post.setNotice(isNotice);
		return post;
	}
	
	@Transactional
	public void delete(Long id, User user) {
		Post post = findById(id);
		postRepository.delete(post);
	}
	
	@Transactional
	public Post likePost(Long id) {
		Post post = findById(id);
		post.setLikeCount(post.getLikeCount() + 1);
		return post;
	}
	
	private void saveAttachments(List<MultipartFile> files, Post post) {
		if (files == null || files.isEmpty()) return;
		// 파일 저장 로직 (생략 - 기존 프로젝트 로직 사용)
	}
	
	// 관리자용 공지사항 조회 등 추가 메서드...
	public List<Post> findNotices() {
		return postRepository.findByIsNoticeTrueOrderByIdDesc();
	}

	// ---------- 스터디 모집 / 신청 ----------
	@Transactional
	public StudyApplication applyStudy(Long postId, User applicant, String message, String contactInfo) {
		Post post = findById(postId);
		StudyRecruitment sr = post.getStudyRecruitment();
		if (sr == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이 게시글은 스터디 모집이 아닙니다.");
		}
		if (sr.getRecruitmentStatus() != RecruitmentStatus.RECRUITING) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "모집이 마감되었습니다.");
		}
		if (applicant == null) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
		}
		if (studyApplicationRepository.findByPostIdAndApplicantId(postId, applicant.getId()).isPresent()) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 신청하셨습니다.");
		}
		StudyApplication app = new StudyApplication(post, applicant, message != null ? message : "", contactInfo != null ? contactInfo : "");
		return studyApplicationRepository.save(app);
	}

	@Transactional
	public void cancelApplication(Long postId, User applicant) {
		if (applicant == null) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
		}
		StudyApplication app = studyApplicationRepository.findByPostIdAndApplicantId(postId, applicant.getId())
				.orElseThrow(() -> new ResourceNotFoundException("신청 내역이 없습니다."));
		studyApplicationRepository.delete(app);
	}

	@Transactional
	public Post updateRecruitmentStatus(Long postId, RecruitmentStatus status, User user) {
		Post post = findById(postId);
		StudyRecruitment sr = post.getStudyRecruitment();
		if (sr == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "스터디 모집 게시글이 아닙니다.");
		}
		User author = post.getAuthor();
		if (author == null || user == null || !author.getId().equals(user.getId())) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "작성자만 모집 상태를 변경할 수 있습니다.");
		}
		sr.setRecruitmentStatus(status);
		return post;
	}

	@Transactional(readOnly = true)
	public List<StudyApplicationResponse> getApplicants(Long postId) {
		Post post = findById(postId);
		return studyApplicationRepository.findByPostId(postId).stream()
				.map(a -> new StudyApplicationResponse(
						a.getId(),
						a.getApplicant() != null ? a.getApplicant().getId() : null,
						a.getApplicant() != null ? a.getApplicant().getEmail() : null,
						a.getApplicant() != null ? (a.getApplicant().getNickname() != null ? a.getApplicant().getNickname() : a.getApplicant().getEmail()) : "Unknown",
						a.getMessage(),
						a.getContactInfo(),
						a.getAppliedAt()
				))
				.collect(Collectors.toList());
	}

	@Transactional(readOnly = true)
	public Optional<StudyApplicationResponse> getMyApplication(Long postId, User user) {
		if (user == null) return Optional.empty();
		return studyApplicationRepository.findByPostIdAndApplicantId(postId, user.getId())
				.map(a -> new StudyApplicationResponse(
						a.getId(),
						a.getApplicant().getId(),
						a.getApplicant().getEmail(),
						a.getApplicant().getNickname() != null ? a.getApplicant().getNickname() : a.getApplicant().getEmail(),
						a.getMessage(),
						a.getContactInfo(),
						a.getAppliedAt()
				));
	}
}