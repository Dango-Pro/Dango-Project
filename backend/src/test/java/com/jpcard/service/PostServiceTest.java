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

        com.jpcard.domain.user.User user = new com.jpcard.domain.user.User();
        Post created = postService.create("Test Title", "Content", false, "Author", "127.0.0.1", null, user,
                com.jpcard.domain.post.PostCategory.FREE, null, null);

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

        com.jpcard.domain.user.User user = new com.jpcard.domain.user.User();
        user.setId(1L); // user must be owner to update, but post in test doesn't have an owner set
                        // properly, let's just use admin role
        user.setRole("ROLE_ADMIN");
        Post updated = postService.update(1L, "New Title", "New Content", true, user);

        assertEquals("New Title", updated.getTitle());
        assertEquals(true, updated.isNotice());
    }
}
