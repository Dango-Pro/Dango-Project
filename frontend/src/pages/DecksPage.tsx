import { useEffect, useState } from "react";
import { api } from "../libs/api";
import Layout from "../components/Layout";
import { Link } from "react-router-dom";
import type { Deck } from "../types/deck";
import { useTranslation } from "react-i18next";

export default function DecksPage() {
  const { t } = useTranslation();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [status, setStatus] = useState(t("common.loading"));

  useEffect(() => {
    api
      .get<Deck[]>("/decks")
      .then((res) => {
        setDecks(res.data);
        setStatus(res.data.length ? t("decks.select_msg") : t("decks.no_decks_msg"));
      })
      .catch((err) => {
        console.error(err);
        setStatus(t("decks.load_fail"));
      });
  }, [t]);

  return (
    <Layout pageTitle={t("nav.my_decks")}>
      <div className="glass-card" style={{ marginBottom: 20 }}>
        <div className="card-header">
           <h2 className="card-title">{t("nav.my_decks")}</h2>
           <div style={{ display: 'flex', gap: 10 }}>
             <Link to="/cards/create" className="secondary-btn">{t("decks.new_card_btn")}</Link>
             <Link to="/decks/create" className="primary-btn">{t("decks.create_deck_btn")}</Link>
           </div>
        </div>
        <p className="muted">{status}</p>

        <div className="card-grid" style={{ marginTop: 20 }}>
          {decks.map((deck) => (
             <article key={deck.id} className="item-tile">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                        <h3 className="item-title">{deck.name}</h3>
                        <p className="item-subtitle">{deck.description}</p>
                    </div>
                    <Link to={`/study?deckId=${deck.id}`} className="primary-btn" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                        {t("decks.study_btn")}
                    </Link>
                </div>
                <div style={{ marginTop: 10 }}>
                   <Link to={`/decks/${deck.id}`} className="muted" style={{ textDecoration: 'underline', fontSize: '0.9rem' }}>{t("decks.view_details")}</Link>
                </div>
             </article>
          ))}
        </div>
      </div>

      <div className="glass-card">
         <div className="card-header">
           <h3 className="item-title">{t("decks.all_cards")}</h3>
           <Link to="/cards" className="muted" style={{ textDecoration: 'underline' }}>{t("decks.view_no_deck")}</Link>
         </div>
      </div>
    </Layout>
  );
}
