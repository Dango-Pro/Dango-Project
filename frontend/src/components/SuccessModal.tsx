interface SuccessModalProps {
  isOpen: boolean;
  message: string;
  onClose?: () => void;
}

export default function SuccessModal({ isOpen, message, onClose }: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        backdropFilter: "blur(5px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div className="glass-card" style={{ maxWidth: 400, textAlign: "center", padding: 30 }}>
        <h2 className="card-title" style={{ marginBottom: 15 }}>Success</h2>
        <p className="item-subtitle" style={{ marginBottom: 20 }}>{message}</p>
        <button className="primary-btn" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
}
