import { useState } from "react";
import { api } from "../api";

const defaultCenter = "Central Aadhaar Center";

export default function TokenStatusPage() {
  const [tokenForm, setTokenForm] = useState({
    customerName: "Priya Sharma",
    centerName: defaultCenter,
    serviceType: "Mobile Number Update"
  });
  const [tokenId, setTokenId] = useState("");
  const [tokenStatus, setTokenStatus] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const crowdLevelClass = tokenStatus?.crowdLevel ? tokenStatus.crowdLevel.toLowerCase() : "low";

  const createToken = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await api.createWalkinToken(tokenForm);
      setTokenId(response.token.tokenId);
      const latestStatus = await api.getTokenStatus(response.token.tokenId);
      setTokenStatus(latestStatus);
      localStorage.setItem("lastTokenId", response.token.tokenId);
    } catch (error) {
      setMessage(error.message || "Unable to generate token.");
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = async () => {
    const lookupToken = tokenId || localStorage.getItem("lastTokenId");

    if (!lookupToken) {
      setMessage("Create a token or enter an existing token ID.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const status = await api.getTokenStatus(lookupToken);
      setTokenStatus(status);
      setTokenId(lookupToken);
    } catch (error) {
      setMessage(error.message || "Unable to fetch token status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-section split-grid">
      <article className="card reveal">
        <h2>Get Token (Walk-in)</h2>
        <form className="form-grid" onSubmit={createToken}>
          <label>
            Name
            <input
              type="text"
              required
              value={tokenForm.customerName}
              onChange={(e) => setTokenForm((prev) => ({ ...prev, customerName: e.target.value }))}
            />
          </label>

          <label>
            Center Name
            <input
              type="text"
              required
              value={tokenForm.centerName}
              onChange={(e) => setTokenForm((prev) => ({ ...prev, centerName: e.target.value }))}
            />
          </label>

          <label>
            Service Type
            <select
              value={tokenForm.serviceType}
              onChange={(e) => setTokenForm((prev) => ({ ...prev, serviceType: e.target.value }))}
            >
              <option>Address Update</option>
              <option>Mobile Number Update</option>
              <option>Biometric Update</option>
              <option>PAN Linking</option>
            </select>
          </label>

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Generating..." : "Generate Token"}
          </button>
        </form>
      </article>

      <article className="card reveal delay-1">
        <h2>Token & Queue Status</h2>
        <p className="helper-text">Track your live token progress instantly.</p>
        <label>
          Token ID
          <input
            type="text"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            placeholder="Ex: TK-AB12CD34"
          />
        </label>

        <button className="btn btn-secondary" onClick={checkStatus} disabled={loading}>
          Check Status
        </button>

        {tokenStatus && (
          <div className="status-board">
            <p>
              <span>Your Token</span>
              <strong>{tokenStatus.yourToken}</strong>
            </p>
            <p>
              <span>Now Serving</span>
              <strong>{tokenStatus.nowServing}</strong>
            </p>
            <p>
              <span>Waiting Time</span>
              <strong>{tokenStatus.estimatedWaitMinutes} mins</strong>
            </p>
            <p>
              <span>Crowd Level</span>
              <strong className={`crowd-pill ${crowdLevelClass}`}>{tokenStatus.crowdLevel}</strong>
            </p>
            <p>
              <span>Service Status</span>
              <strong className={`status-pill ${tokenStatus.status}`}>{tokenStatus.status}</strong>
            </p>
          </div>
        )}

        {message && <p className="error-text">{message}</p>}
      </article>
    </section>
  );
}
