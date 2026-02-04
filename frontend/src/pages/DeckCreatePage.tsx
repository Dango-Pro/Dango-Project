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
      await api.post('/decks', { name, description, templateId: selectedTemplateId, isPublic, algorithmType });
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

            <div className="input-group">
              <label className="input-label">Learning Algorithm</label>
              <select
                className="text-input"
                value={algorithmType}
                onChange={(e) => setAlgorithmType(e.target.value)}
                style={{ fontSize: '1rem' }}>
                <option value="SM2">SM-2 - Classic spaced repetition (balanced)</option>
                <option value="FSRS">FSRS - Modern ML-based algorithm (optimized)</option>
                <option value="HALF_LIFE_REGRESSION">Half-Life Regression - Duolingo-style learning</option>
                <option value="LEITNER_SYSTEM">Leitner System - Traditional box method</option>
                <option value="SPRINT">Sprint - Intensive short-term learning</option>
              </select>
              <span className="muted" style={{ fontSize: '0.8rem', marginTop: 5 }}>
                Choose the spaced repetition algorithm for this deck
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
      `}</style>
    </Layout>
  );
}
