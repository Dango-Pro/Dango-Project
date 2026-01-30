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

    /**
     * @deprecated This field is legacy and does not reflect multi-user progress.
     * Use UserCardProgress instead. Kept for backward compatibility.
     */
    @Column(nullable = false)
    @Deprecated
    private boolean isMemorized = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deck_id")
    private Deck deck;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String contentJson;

    // Groups siblings (e.g. Forward/Reverse cards)
    @Column
    private Long noteId;
}
