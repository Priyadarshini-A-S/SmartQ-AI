import { useEffect, useState } from "react";
import { api } from "../api";

const DEFAULT_CENTER = "Central Aadhaar Center";
const centerOptions = [
  "Central Aadhaar Center",
  "Whitefield Seva Kendra",
  "Anna Nagar Aadhaar Point",
  "Madhapur Aadhaar Hub"
];

export default function LiveQueuePage() {
  const [centerName, setCenterName] = useState(DEFAULT_CENTER);
  const [queue, setQueue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastAction, setLastAction] = useState("Waiting for first sync...");

  const fetchQueue = async (center) => {
    setLoading(true);

    try {
      const response = await api.getLiveQueue(center);
      setQueue(response);
      setError("");
      setLastAction(`Synced at ${new Date().toLocaleTimeString()}`);
    } catch (err) {
      setQueue(null);
      setError(err.message || "Unable to fetch live queue.");
      setLastAction("Sync failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue(centerName);
    const timer = setInterval(() => fetchQueue(centerName), 10000);
    return () => clearInterval(timer);
  }, [centerName]);

  const simulateAdvance = async () => {
    try {
      await api.advanceQueue(centerName);
      await fetchQueue(centerName);
      setLastAction("Advanced queue by one token");
    } catch (err) {
      setError(err.message);
    }
  };

  const simulateRush = async () => {
    try {
      await Promise.all([
        api.createWalkinToken({
          centerName,
          customerName: `Walkin ${Date.now().toString().slice(-4)}`,
          serviceType: "Address Update"
        }),
        api.createWalkinToken({
          centerName,
          customerName: `Walkin ${Date.now().toString().slice(-3)}`,
          serviceType: "Mobile Number Update"
        }),
        api.createWalkinToken({
          centerName,
          customerName: `Walkin ${Date.now().toString().slice(-2)}`,
          serviceType: "Biometric Update"
        })
      ]);
      await fetchQueue(centerName);
      setLastAction("Simulated rush: added 3 tokens");
    } catch (err) {
      setError(err.message || "Unable to simulate rush.");
    }
  };

  const queueIntensity = Math.min((queue?.totalWaiting || 0) * 8, 100);
  const crowdLevelClass = queue?.crowdLevel ? queue.crowdLevel.toLowerCase() : "low";
  const activeLane = queue?.nowServing || 0;

  return (
    <section className="card page-section reveal">
      <div className="dashboard-head">
        <div>
          <h2>Interactive Live Queue Dashboard</h2>
          <p>Auto refresh every 10 seconds with simulation controls for demo scenarios.</p>
        </div>
        <span className={`sync-dot ${loading ? "loading" : "ready"}`}>{loading ? "Syncing" : "Live"}</span>
      </div>

      <div className="center-switcher" role="tablist" aria-label="Center quick selection">
        {centerOptions.map((center) => (
          <button
            key={center}
            type="button"
            className={center === centerName ? "chip active" : "chip"}
            onClick={() => setCenterName(center)}
          >
            {center}
          </button>
        ))}
      </div>

      <label>
        Center Name
        <input type="text" value={centerName} onChange={(e) => setCenterName(e.target.value)} />
      </label>

      <div className="hero-actions queue-actions">
        <button className="btn btn-secondary" onClick={() => fetchQueue(centerName)} disabled={loading}>
          Refresh Now
        </button>
        <button className="btn btn-primary" onClick={simulateAdvance}>
          Simulate Next Token
        </button>
        <button className="btn btn-secondary" onClick={simulateRush}>
          Simulate Rush Hour
        </button>
      </div>

      {queue && (
        <div className="live-stats">
          <article>
            <h3>Total People Waiting</h3>
            <p>{queue.totalWaiting}</p>
          </article>
          <article>
            <h3>Current Token Running</h3>
            <p>{queue.nowServing}</p>
          </article>
          <article>
            <h3>Crowd Level</h3>
            <p>
              <span className={`crowd-pill ${crowdLevelClass}`}>{queue.crowdLevel}</span>
            </p>
          </article>
        </div>
      )}

      {queue && (
        <div className="queue-lanes" aria-label="Queue activity lanes">
          {Array.from({ length: 6 }, (_, idx) => {
            const tokenNumber = queue.nowServing + idx;
            const laneState = idx === 0 ? "serving" : idx <= queue.totalWaiting ? "waiting" : "open";

            return (
              <article key={tokenNumber} className={`lane-card ${laneState}`}>
                <h4>{idx === 0 ? "Now Serving" : "Upcoming"}</h4>
                <p>#{tokenNumber || activeLane}</p>
                <span>{laneState === "open" ? "No token" : laneState}</span>
              </article>
            );
          })}
        </div>
      )}

      {queue && (
        <div className="queue-meter-wrap">
          <div className="queue-meter-label">
            <span>Queue Intensity</span>
            <strong>{queue.totalWaiting} waiting</strong>
          </div>
          <div className="queue-meter-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={queueIntensity}>
            <div className="queue-meter-fill" style={{ width: `${queueIntensity}%` }} />
          </div>
        </div>
      )}

      <p className="helper-text">{lastAction}</p>
      {queue && <p className="helper-text">Updated at {new Date(queue.refreshedAt).toLocaleTimeString()}</p>}
      {error && <p className="error-text">{error}</p>}
    </section>
  );
}
