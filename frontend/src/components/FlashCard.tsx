import { useTranslation } from "react-i18next";
import { speak } from "../libs/tts";
import type { Card } from "../types/card";

interface FlashCardProps {
  card: Card;
  isFlipped: boolean;
  onFlip: () => void;
  onReview: (rating: string) => void;
}

export default function FlashCard({ card, isFlipped, onFlip, onReview }: FlashCardProps) {
  const { t } = useTranslation();

  return (
    <div className="study-container">
      <div
        className={`flash-card ${isFlipped ? "flipped" : ""}`}
        onClick={onFlip}
      >
        <div className="card-face card-front">
          <span className="card-label">{t("study.term_label")}</span>
          <h2>{card.term}</h2>
          <button
            className="icon-btn"
            onClick={(e) => { e.stopPropagation(); speak(card.term || ""); }}
            style={{ position: 'absolute', top: 16, right: 16 }}
          >
            🔊
          </button>
          <p className="click-hint">{t("study.click_flip")}</p>
        </div>
        <div className="card-face card-back">
          <span className="card-label">{t("study.meaning_label")}</span>
          <h2>{card.meaning}</h2>
          <button
            className="icon-btn"
            onClick={(e) => { e.stopPropagation(); speak(card.meaning || "", "en-US"); }}
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
               {t("study.rate_again")}
             </button>
             <button className="nav-btn" style={{ borderColor: '#faad14', color: '#faad14' }} onClick={() => onReview("HARD")}>
               {t("study.rate_hard")}
             </button>
             <button className="nav-btn" style={{ borderColor: '#52c41a', color: '#52c41a' }} onClick={() => onReview("GOOD")}>
               {t("study.rate_good")}
             </button>
             <button className="nav-btn" style={{ borderColor: '#1890ff', color: '#1890ff' }} onClick={() => onReview("EASY")}>
               {t("study.rate_easy")}
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
          height: 250px;
          position: relative;
          perspective: 1000px;
          cursor: pointer;
        }
        .card-face {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          transition: transform 0.6s;
          background: rgba(20, 20, 20, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          color: #ffffff;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 20px;
          text-align: center;
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
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
          color: rgba(255, 255, 255, 0.4);
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        .click-hint {
          position: absolute;
          bottom: 16px;
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.3);
        }
        .controls {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .nav-btn {
          background: none;
          border: 1px solid rgba(255,255,255,0.2);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .nav-btn:hover {
          background: rgba(255,255,255,0.1);
        }
      `}</style>
    </div>
  );
}
