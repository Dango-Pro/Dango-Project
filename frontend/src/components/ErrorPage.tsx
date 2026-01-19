import { useRouteError } from "react-router-dom";
import Layout from "./Layout";

export default function ErrorPage() {
  const error = useRouteError() as any;
  console.error(error);

  return (
    <Layout pageTitle="Oops!" subtitle="Something went wrong">
      <div className="glass-card" style={{ textAlign: "center", padding: "40px" }}>
        <h2 className="card-title">Unexpected Error</h2>
        <p className="muted" style={{ margin: "20px 0" }}>
          {error.statusText || error.message || "An unknown error occurred."}
        </p>
        <button
          className="primary-btn"
          onClick={() => (window.location.href = "/")}
        >
          Go to Home
        </button>
      </div>
    </Layout>
  );
}
