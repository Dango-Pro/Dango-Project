import { useRouteError } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from './Layout';

export default function ErrorPage() {
  const { t } = useTranslation();
  const error = useRouteError() as any;
  console.error(error);

  return (
    <Layout pageTitle={t('error.oops')} subtitle={t('error.something_wrong')}>
      <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
        <h2 className="card-title">{t('error.unexpected')}</h2>
        <p className="muted" style={{ margin: '20px 0' }}>
          {error?.statusText || error?.message || t('error.unknown')}
        </p>
        <button className="primary-btn" onClick={() => (window.location.href = '/')}>
          {t('error.go_home')}
        </button>
      </div>
    </Layout>
  );
}
