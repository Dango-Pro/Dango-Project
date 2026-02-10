package com.jpcard.domain.study;

import com.jpcard.domain.card.Card;
import com.jpcard.domain.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_card_progress", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "card_id"})
})
@Getter
@Setter
public class UserCardProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "card_id", nullable = false)
    private Card card;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StudyStatus status = StudyStatus.NEW;

    // When is the card next due?
    @Column(nullable = false)
    private LocalDateTime nextReview = LocalDateTime.now();

    // Current interval in minutes (to support < 1 min, 10 mins, etc.)
    @Column(nullable = false)
    private int intervalMinutes = 0;

    // Ease factor (SM-2 default starts around 2.5)
    @Column(nullable = false)
    private double ease = 2.5;

    // Consecutive correct reviews
    @Column(nullable = false)
    private int repetitions = 0;

    // To track daily limits
    private LocalDateTime firstStudiedAt;

    // For multi-step learning (0 = 1min, 1 = 10min, etc)
    @Column(nullable = false)
    private int learningStep = 0;

    // Count of times the card was failed (FAIL rating)
    @Column(nullable = false)
    private int lapses = 0;

    // FSRS / SM-2 style
    private Double stability;
    // Half-life regression
    private Double halfLife;
    // Leitner system box (0 = learning)
    private Integer leitnerBox;
    // FSRS difficulty (1-10)
    private Double difficulty;
}
