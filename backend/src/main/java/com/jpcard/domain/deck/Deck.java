package com.jpcard.domain.deck;

import com.jpcard.domain.card.Card;
import com.jpcard.domain.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "decks")
@Getter
@Setter
public class Deck {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "card_template_id")
    private CardTemplate cardTemplate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User owner;

    @Column(nullable = false)
    private boolean isPublic = false;

    // Default learning steps in minutes: 1 -> 10. Comma separated.
    @Column(nullable = false)
    private String learningSteps = "1,10";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private com.jpcard.domain.study.AlgorithmType algorithmType = com.jpcard.domain.study.AlgorithmType.SM2;

    @Column(nullable = false)
    private int dailyNewCardLimit = 20;

    @OneToMany(mappedBy = "deck", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Card> cards = new ArrayList<>();
}
