package com.jpcard.domain.deck;

import com.jpcard.domain.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "card_templates")
@Getter @Setter
public class CardTemplate {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "card_template_fields", joinColumns = @JoinColumn(name = "template_id"))
    @Column(name = "field_name")
    @OrderColumn(name = "field_order")
    private List<String> fieldNames = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user; // If null, it's a system default template
}
