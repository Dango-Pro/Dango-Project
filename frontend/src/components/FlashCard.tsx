import { useTranslation } from "react-i18next";
import { speak } from "../libs/tts";
import type { Card } from "../types/card";

interface IntervalPreview {
  failMinutes: number;
  hardMinutes: number;
  goodMinutes: number;
  easyMinutes: number;
}

interface FlashCardProps {
  card: Card;
  isFlipped: boolean;
  onFlip: () => void;
  onReview: (rating: string) => void;
  intervalPreview?: IntervalPreview | null;
}

/** Convert minutes to a human-friendly string, e.g. "1분", "12시간", "3일" */
function formatInterval(minutes: number): string {
  if (minutes < 1) return "<1분";
  if (minutes < 60) return `${minutes}분`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}시간`;
  const days = Math.round(minutes / 1440);
  return `${days}일`;
}

export default function FlashCard({ card, isFlipped, onFlip, onReview, intervalPreview }: FlashCardProps) {
  const { t } = useTranslation();

  // Determine if this is a custom template card or a legacy card
  const isCustomTemplate = card.templateFieldNames && card.templateFieldNames.length > 0;
  
  // For custom template cards, use templateFieldNames and content
  // For legacy cards, fall back to term/meaning
  const frontFieldName = isCustomTemplate ? card.templateFieldNames![0] : "term";
  const frontFieldValue = isCustomTemplate ? card.content[frontFieldName] : (card.term || "");
  
  // For back, show all remaining fields (or just meaning for legacy)
  const backFields: Array<{ name: string; value: string }> = [];
  if (isCustomTemplate) {
    // Skip the first field (already shown on front)
    for (let i = 1; i < card.templateFieldNames!.length; i++) {
      const fieldName = card.templateFieldNames![i];
      const fieldValue = card.content[fieldName] || "";
      backFields.push({ name: fieldName, value: fieldValue });
    }
  } else {
    // Legacy: just show meaning
    backFields.push({ name: "meaning", value: card.meaning || "" });
  }

  // Special handling for pronunciation (for Japanese cards)
  const pronunciationField = backFields.find(f => f.name.toLowerCase() === 'pronunciation');

  const failLabel   = intervalPreview ? `${t("study.rate_again")} (${formatInterval(intervalPreview.failMinutes)})` : t("study.rate_again");
  const hardLabel   = intervalPreview ? `${t("study.rate_hard")} (${formatInterval(intervalPreview.hardMinutes)})` : t("study.rate_hard");
  const goodLabel   = intervalPreview ? `${t("study.rate_good")} (${formatInterval(intervalPreview.goodMinutes)})` : t("study.rate_good");
  const easyLabel   = intervalPreview ? `${t("study.rate_easy")} (${formatInterval(intervalPreview.easyMinutes)})` : t("study.rate_easy");

  return (
    <div className="study-container">
      <div
        className={`flash-card ${isFlipped ? "flipped" : ""}`}
        onClick={onFlip}
      >
        <div className="card-face card-front">
          <span className="card-label">{isCustomTemplate ? frontFieldName : t("study.term_label")}</span>
          <h2>{frontFieldValue}</h2>
          <button
            className="icon-btn"
            onClick={(e) => { e.stopPropagation(); speak(frontFieldValue || ""); }}
            style={{ position: 'absolute', top: 16, right: 16 }}
          >
            🔊
          </button>
          <p className="click-hint">{t("study.click_flip")}</p>
        </div>
        <div className="card-face card-back">
          {/* Show pronunciation first if it exists */}
          {pronunciationField && (
            <h3 style={{ fontSize: '1.5rem', marginBottom: '8px', color: '#666', fontWeight: 'normal' }}>
              {pronunciationField.value}
            </h3>
          )}
          
          {/* Display all back fields */}
          {backFields.map((field, idx) => {
            // Skip pronunciation since we displayed it separately above
            if (field.name.toLowerCase() === 'pronunciation') return null;
            
            return (
              <div key={idx} style={{ marginBottom: idx < backFields.length - 1 ? '12px' : '0' }}>
                {isCustomTemplate && backFields.length > 1 && (
                  <span className="card-label" style={{ position: 'relative', top: 'auto', left: 'auto', display: 'block', marginBottom: '4px' }}>
                    {field.name}
                  </span>
                )}
                <h2 style={{ margin: 0 }}>{field.value}</h2>
              </div>
            );
          })}
          
          <button
            className="icon-btn"
            onClick={(e) => {
              e.stopPropagation();
              if (pronunciationField) {
                speak(pronunciationField.value, "ja-JP");
              } else {
                // Speak the first non-pronunciation back field
                const firstBackValue = backFields.find(f => f.name.toLowerCase() !== 'pronunciation')?.value || "";
                speak(firstBackValue, "ko-KR");
              }
            }}
            style={{ position: 'absolute', top: 16, right: 16 }}
          >
            🔊
          </button>
        </div>
      </div>

      {!isFlipped ? (
          <div className="controls" style={{ marginTop: 20 }}>
             <p className="muted">{t("study.tap_hint")}</p>
          </div>
      ) : (
          <div className="action-row" style={{ marginTop: 20, display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
             <button className="nav-btn" style={{ borderColor: '#ff4d4f', color: '#ff4d4f' }} onClick={() => onReview("FAIL")}>
               {failLabel}
             </button>
             <button className="nav-btn" style={{ borderColor: '#faad14', color: '#faad14' }} onClick={() => onReview("HARD")}>
               {hardLabel}
             </button>
             <button className="nav-btn" style={{ borderColor: '#52c41a', color: '#52c41a' }} onClick={() => onReview("GOOD")}>
               {goodLabel}
             </button>
             <button className="nav-btn" style={{ borderColor: '#1890ff', color: '#1890ff' }} onClick={() => onReview("EASY")}>
               {easyLabel}
             </button>
          </div>
      )}

      <style>{`
        .study-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }
        .flash-card {
          width: 100%;
          max-width: 400px;
          min-height: 250px;
          position: relative;
          perspective: 1000px;
          cursor: pointer;
        }
        .card-face {
          position: absolute;
          width: 100%;
          min-height: 250px;
          backface-visibility: hidden;
          transition: transform 0.6s;
          background: #ffffff;
          border: 2px solid #ffb7b2;
          border-radius: 20px;
          color: #333333;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 20px;
          text-align: center;
          box-shadow: 0 8px 24px rgba(255, 183, 178, 0.15);
        }
        .card-front {
          transform: rotateY(0deg);
        }
        .flipped .card-front {
          transform: rotateY(180deg);
        }
        .card-back {
          transform: rotateY(180deg);
        }
        .flipped .card-back {
          transform: rotateY(0deg);
        }
        .card-label {
          position: absolute;
          top: 16px;
          left: 16px;
          font-size: 0.75rem;
          color: #ffb7b2;
          letter-spacing: 1px;
          text-transform: uppercase;
          font-weight: 700;
        }
        .click-hint {
          position: absolute;
          bottom: 16px;
          font-size: 0.8rem;
          color: #999;
        }
        .controls {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .nav-btn {
          background: #ffffff;
          border: 1px solid #ffb7b2;
          color: #333;
          padding: 8px 16px;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 600;
        }
        .nav-btn:hover {
          background: #fff0f0;
          border-color: #ffb7b2;
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
}
