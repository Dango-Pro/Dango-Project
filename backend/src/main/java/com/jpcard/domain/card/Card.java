package com.jpcard.domain.card;

import com.jpcard.domain.deck.Deck;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "cards")
@Getter
@Setter
public class Card {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String term;

    @Column(nullable = false)
    private String meaning;

    @Column(nullable = false)
    private boolean isMemorized = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deck_id")
    private Deck deck;

    @Column(columnDefinition = "TEXT")
    private String contentJson;
}
