import { useState, useEffect } from 'react';
import { api } from '../libs/api';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { type CardTemplate } from '../types/template';

export default function DeckCreatePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [status, setStatus] = useState('');
  const [algorithmType, setAlgorithmType] = useState('SM2');
  const [dailyNewCardLimit, setDailyNewCardLimit] = useState(20);


  const [templates, setTemplates] = useState<CardTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newFields, setNewFields] = useState<string[]>(['Front', 'Back']);

  useEffect(() => {
    api
      .get<CardTemplate[]>('/templates')
      .then((res) => {
        setTemplates(res.data);
        const last = localStorage.getItem('lastTemplateId');
        if (last && res.data.find((t) => t.id === Number(last))) {
          setSelectedTemplateId(Number(last));
        } else if (res.data.length > 0) {
          setSelectedTemplateId(res.data[0].id);
        }
      })
      .catch(console.error);
  }, []);

  const handleCreateTemplate = async () => {
    if (!newTemplateName.trim()) return;
    try {
      const res = await api.post('/templates', { name: newTemplateName, fieldNames: newFields });
      setTemplates([...templates, res.data]);
      setSelectedTemplateId(res.data.id);
      localStorage.setItem('lastTemplateId', String(res.data.id));
      setIsCreatingTemplate(false);
      setNewTemplateName('');
      setNewFields(['Front', 'Back']);
    } catch (err) {
      console.error(err);
      setStatus(t('deck.fail_create_template'));
    }
  };

  const addField = () => setNewFields([...newFields, '']);
  const updateField = (idx: number, val: string) => {
    const updated = [...newFields];
    updated[idx] = val;
    setNewFields(updated);
  };
  const removeField = (idx: number) => {
    setNewFields(newFields.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedTemplateId) localStorage.setItem('lastTemplateId', String(selectedTemplateId));
      await api.post('/decks', { name, description, templateId: selectedTemplateId, isPublic, algorithmType, dailyNewCardLimit });
      navigate('/decks');
    } catch (err) {
      console.error(err);
      setStatus(t('deck.fail_create_deck'));
    }
  };

  return (
    <Layout pageTitle={t('deck.create_deck_title')}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <section className="glass-card" style={{ padding: 40 }}>
          <h2 className="card-title" style={{ textAlign: 'center', marginBottom: 30 }}>
            {t('deck.design_your_deck')}
          </h2>
          {status && (
            <p className="muted" style={{ textAlign: 'center' }}>
              {status}
            </p>
          )}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="input-group">
              <label htmlFor="deck-name" className="input-label">
                {t('deck.deck_name')}
              </label>
              <input
                id="deck-name"
                className="text-input"
                placeholder={t('deck.deck_name_placeholder')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ fontSize: '1.1rem' }}
              />
            </div>
            <div className="input-group">
              <label htmlFor="deck-desc" className="input-label">
                {t('deck.description')} <span className="muted">{t('deck.description_optional')}</span>
              </label>
              <textarea
                id="deck-desc"
                className="text-area"
                rows={4}
                placeholder={t('deck.description_placeholder')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="daily-limit" className="input-label">
                {t('deck.daily_new_cards_limit')}
              </label>
              <input
                id="daily-limit"
                type="number"
                className="text-input"
                value={dailyNewCardLimit}
                onChange={(e) => setDailyNewCardLimit(e.target.valueAsNumber)}
                min={0}
                style={{ fontSize: '1.1rem' }}
              />
              <span className="muted" style={{ fontSize: '0.8rem' }}>
                {t('deck.daily_new_cards_limit_desc')}
              </span>
            </div>


            <div className="input-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <input
                type="checkbox"
                id="is-public"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                style={{ width: 18, height: 18, cursor: 'pointer' }}
              />
              <label htmlFor="is-public" className="input-label" style={{ cursor: 'pointer', marginBottom: 0 }}>
                {t('deck.make_public')}
              </label>
              <span className="muted" style={{ fontSize: '0.8rem' }}>
                {t('deck.visible_to_community')}
              </span>
            </div>

            <div className="input-group">
              <label className="input-label">{t('deck.card_template')}</label>
              {!isCreatingTemplate ? (
                <div style={{ display: 'flex', gap: 10 }}>
                  <select
                    className="text-input"
                    style={{ flex: 1 }}
                    value={selectedTemplateId || ''}
                    onChange={(e) => setSelectedTemplateId(Number(e.target.value))}>
                    {templates.map((tmpl) => (
                      <option key={tmpl.id} value={tmpl.id} style={{ color: 'black' }}>
                        {tmpl.name} ({tmpl.fieldNames.join(', ')})
                      </option>
                    ))}
                  </select>
                  <button type="button" className="secondary-btn" onClick={() => setIsCreatingTemplate(true)}>
                    {t('deck.new_template_btn')}
                  </button>
                </div>
              ) : (
                <div className="glass-card" style={{ background: 'rgba(255,255,255,0.4)', padding: 15 }}>
                  <div style={{ marginBottom: 10 }}>
                    <label className="input-label" style={{ fontSize: '0.8rem' }}>
                      {t('deck.template_name')}
                    </label>
                    <input
                      className="text-input"
                      value={newTemplateName}
                      onChange={(e) => setNewTemplateName(e.target.value)}
                      placeholder={t('deck.template_name_placeholder')}
                    />
                  </div>
                  <label className="input-label" style={{ fontSize: '0.8rem' }}>
                    {t('deck.fields_label')}
                  </label>
                  {newFields.map((f, i) => (
                    <div key={i} style={{ display: 'flex', gap: 5, marginBottom: 5 }}>
                      <input
                        className="text-input"
                        value={f}
                        onChange={(e) => updateField(i, e.target.value)}
                        placeholder={t('deck.field_n', { n: i + 1 })}
                      />
                      <button type="button" className="secondary-btn" onClick={() => removeField(i)}>
                        X
                      </button>
                    </div>
                  ))}
                  <button type="button" className="secondary-btn" onClick={addField} style={{ width: '100%', marginBottom: 10 }}>
                    {t('deck.add_field')}
                  </button>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="button" className="primary-btn" onClick={handleCreateTemplate}>
                      {t('deck.save_template')}
                    </button>
                    <button type="button" className="secondary-btn" onClick={() => setIsCreatingTemplate(false)}>
                      {t('common.cancel')}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="input-group" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <label className="input-label" style={{ marginBottom: 0 }}>
                  {t('deck.algorithm_label')}
                </label>
                <div
                  className="info-icon"
                  style={{
                    cursor: 'help',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: '#ccc',
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                  }}
                >
                  ?
                  <div className="tooltip-box">
                    <p style={{ fontWeight: 'bold', marginBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.3)', paddingBottom: 4 }}>
                      {t('deck.algorithm_label')}
                    </p>
                    <ul style={{ paddingLeft: 16, margin: 0, listStyle: 'disk' }}>
                      <li style={{ marginBottom: 4 }}>
                        <strong>SM-2:</strong> {t('deck.algo_desc_sm2')}
                      </li>
                      <li style={{ marginBottom: 4 }}>
                        <strong>FSRS:</strong> {t('deck.algo_desc_fsrs')}
                      </li>
                      <li style={{ marginBottom: 4 }}>
                        <strong>Half-Life Regression:</strong> {t('deck.algo_desc_hlr')}
                      </li>
                      <li style={{ marginBottom: 4 }}>
                        <strong>Leitner:</strong> {t('deck.algo_desc_leitner')}
                      </li>
                      <li>
                        <strong>Sprint:</strong> {t('deck.algo_desc_sprint')}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <select
                className="text-input"
                value={algorithmType}
                onChange={(e) => setAlgorithmType(e.target.value)}
                style={{ fontSize: '1rem' }}>
                <option value="SM2">{t('deck.algo_sm2')}</option>
                <option value="FSRS">{t('deck.algo_fsrs')}</option>
                <option value="HALF_LIFE_REGRESSION">{t('deck.algo_hlr')}</option>
                <option value="LEITNER_SYSTEM">{t('deck.algo_leitner')}</option>
                <option value="SPRINT">{t('deck.algo_sprint')}</option>
              </select>
              <span className="muted" style={{ fontSize: '0.8rem', marginTop: 5 }}>
                {t('deck.algorithm_helper')}
              </span>
            </div>

            <button type="submit" className="primary-btn" style={{ marginTop: 10, padding: '14px', fontSize: '1.1rem' }}>
              {t('decks.create_deck_btn')}
            </button>
          </form>
        </section>
      </div>
      <style>{`
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .input-label {
          font-size: 0.9rem;
          color: #555;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 600;
        }
        .info-icon {
          position: relative;
        }
        .tooltip-box {
          visibility: hidden;
          opacity: 0;
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          width: 300px;
          background: rgba(0, 0, 0, 0.85);
          color: #fff;
          padding: 12px;
          border-radius: 8px;
          font-size: 0.85rem;
          line-height: 1.4;
          z-index: 100;
          transition: opacity 0.2s;
          pointer-events: none;
          margin-bottom: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        
        .tooltip-box::after {
          content: "";
          position: absolute;
          top: 100%;
          left: 50%;
          margin-left: -5px;
          border-width: 5px;
          border-style: solid;
          border-color: rgba(0, 0, 0, 0.85) transparent transparent transparent;
        }

        .info-icon:hover .tooltip-box {
          visibility: visible;
          opacity: 1;
        }
      `}</style>
    </Layout>
  );
}
