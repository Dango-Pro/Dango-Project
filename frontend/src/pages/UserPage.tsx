import { useEffect, useState } from "react";
import { api } from "../libs/api";
import Layout from "../components/Layout";
import type { User } from "../types/user";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function UserPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState(t("common.loading"));
  const [editingLimit, setEditingLimit] = useState(false);
  const [newLimit, setNewLimit] = useState(20);
  const [editingTimezone, setEditingTimezone] = useState(false);
  const [newTimezone, setNewTimezone] = useState("UTC");

  const timezones = [
    "UTC", "Asia/Seoul", "Asia/Tokyo", "America/New_York", "Europe/London", "Australia/Sydney"
  ];

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = () => {
    api
      .get<User>("/users/me")
      .then((res) => {
        setUser(res.data);
        setNewLimit(res.data.dailyLimit);
        setNewTimezone(res.data.timezone || "UTC");
        setStatus("");
      })
      .catch((err) => {
        console.error(err);
        setStatus(`Error: ${err.message}`);
      });
  };

  const onLogout = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      navigate("/login");
  };

  const onUpdateSettings = async () => {
      try {
          await api.patch("/users/me", { dailyLimit: Number(newLimit), timezone: newTimezone });
          setEditingLimit(false);
          setEditingTimezone(false);
          fetchUser();
      } catch (err) {
          console.error(err);
          alert("Failed to update settings");
      }
  };

  return (
    <Layout pageTitle={t("nav.mypage")}>
      <section className="glass-card">
        <div className="card-header">
          <h2 className="card-title">{t("nav.mypage")}</h2>
          <button className="secondary-btn" onClick={onLogout}>{t("nav.logout")}</button>
        </div>

        {status && <p className="muted">{status}</p>}

        {user && (
          <div className="form-grid" style={{ marginTop: 12 }}>
            <div className="action-card">
              <p className="muted">Username</p>
              <h3 className="item-title">{user.username}</h3>
            </div>
            <div className="action-card">
              <p className="muted">Roles</p>
              <div className="badge-grid">
                {user.roles.map((r) => (
                  <span key={r} className="pill">
                    <span className="pill-dot" />
                    {r}
                  </span>
                ))}
              </div>
            </div>

            <div className="action-card">
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div>
                       <p className="muted">Daily New Cards Limit</p>
                       {editingLimit ? (
                           <input
                             type="number"
                             className="input-field"
                             style={{ width: 100, padding: '4px 8px' }}
                             value={newLimit}
                             onChange={e => setNewLimit(e.target.valueAsNumber)}
                           />
                       ) : (
                           <h3 className="item-title">{user.dailyLimit} cards</h3>
                       )}
                   </div>
                   <div>
                       {editingLimit ? (
                           <div style={{ display: 'flex', gap: 5 }}>
                               <button className="primary-btn" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={onUpdateSettings}>{t("common.save")}</button>
                               <button className="secondary-btn" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => { setEditingLimit(false); setNewLimit(user.dailyLimit); }}>{t("common.cancel")}</button>
                           </div>
                       ) : (
                           <button className="secondary-btn" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => setEditingLimit(true)}>{t("common.edit")}</button>
                       )}
                   </div>
               </div>
            </div>

            <div className="action-card">
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div>
                       <p className="muted">Timezone</p>
                       {editingTimezone ? (
                           <select
                             className="input-field"
                             style={{ width: 150, padding: '4px 8px' }}
                             value={newTimezone}
                             onChange={e => setNewTimezone(e.target.value)}
                           >
                              {timezones.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                           </select>
                       ) : (
                           <h3 className="item-title">{user.timezone || "UTC"}</h3>
                       )}
                   </div>
                   <div>
                       {editingTimezone ? (
                           <div style={{ display: 'flex', gap: 5 }}>
                               <button className="primary-btn" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={onUpdateSettings}>{t("common.save")}</button>
                               <button className="secondary-btn" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => { setEditingTimezone(false); setNewTimezone(user.timezone || "UTC"); }}>{t("common.cancel")}</button>
                           </div>
                       ) : (
                           <button className="secondary-btn" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => setEditingTimezone(true)}>{t("common.edit")}</button>
                       )}
                   </div>
               </div>
            </div>

          </div>
        )}
      </section>
    </Layout>
  );
}
