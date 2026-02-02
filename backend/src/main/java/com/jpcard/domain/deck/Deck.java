package com.jpcard.domain.deck;

import com.jpcard.domain.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

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
}
