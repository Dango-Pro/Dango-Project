package com.jpcard.service;

import com.jpcard.domain.post.Post;
import com.jpcard.repository.PostAttachmentRepository;
import com.jpcard.repository.PostRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PostServiceTest {

    @Mock
    private PostRepository postRepository;

    @Mock
    private PostAttachmentRepository postAttachmentRepository;

    @InjectMocks
    private PostService postService;

    @Test
    void create_ShouldSavePost() {
        Post post = new Post();
        post.setId(1L);
        post.setTitle("Test Title");

        when(postRepository.save(any(Post.class))).thenReturn(post);

        Post created = postService.create("Test Title", "Content", false, "User", "127.0.0.1", null);

        assertNotNull(created);
        assertEquals("Test Title", created.getTitle());
        verify(postRepository).save(any(Post.class));
    }

    @Test
    void update_ShouldUpdatePost() {
        Post post = new Post();
        post.setId(1L);
        post.setTitle("Old Title");

        when(postRepository.findById(1L)).thenReturn(Optional.of(post));

        Post updated = postService.update(1L, "New Title", "New Content", true);

        assertEquals("New Title", updated.getTitle());
        assertEquals(true, updated.isNotice());
    }
}
