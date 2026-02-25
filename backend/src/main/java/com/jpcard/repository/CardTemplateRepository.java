package com.jpcard.repository;

import com.jpcard.domain.deck.CardTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CardTemplateRepository extends JpaRepository<CardTemplate, Long> {
    List<CardTemplate> findByUserIdOrUserIdIsNull(Long userId);
}
