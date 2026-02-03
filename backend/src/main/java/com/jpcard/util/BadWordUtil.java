package com.jpcard.util;

import java.util.List;

public class BadWordUtil {
    private static final List<String> BAD_WORDS = List.of(
            "시발", "씨발", "개새끼", "병신", "좆", "씹", "거시기"
    );

    public static boolean containsBadWord(String text) {
        if (text == null || text.trim().isEmpty()) {
            return false;
        }
        for (String badWord : BAD_WORDS) {
            if (text.contains(badWord)) {
                return true;
            }
        }
        return false;
    }
}
