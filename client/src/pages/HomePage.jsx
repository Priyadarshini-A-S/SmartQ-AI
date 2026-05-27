import { Link, useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <section className="hero-grid">
      <article className="hero-panel reveal">
        <p className="eyebrow">Citizen Experience</p>
        <h2>Skip lines. Secure your Aadhaar service slot in minutes.</h2>
        <p>
          Book appointments, get walk-in tokens, and monitor live queue status from your phone before
          you reach the center.
        </p>

        <div className="hero-actions">
          <Link className="btn btn-primary" to="/book">
            Book Appointment
          </Link>
          <button className="btn btn-secondary" onClick={() => navigate("/token")}>
            Get Token (Walk-in)
          </button>
        </div>

        <div className="metric-grid">
          <article className="metric-card">
            <h4>Average Wait Reduction</h4>
            <p>42%</p>
          </article>
          <article className="metric-card">
            <h4>Booking Time</h4>
            <p>&lt; 2 min</p>
          </article>
          <article className="metric-card">
            <h4>Live Queue Sync</h4>
            <p>10 sec</p>
          </article>
        </div>
      </article>

      <article className="crowd-panel reveal delay-1">
        <h3>Live Crowd Indicator</h3>
        <ul className="crowd-list">
          <li>
            <span className="dot low" /> Low
          </li>
          <li>
            <span className="dot medium" /> Medium
          </li>
          <li>
            <span className="dot high" /> High
          </li>
        </ul>
        <Link className="text-link" to="/live-queue">
          View Live Queue
        </Link>
      </article>

      <article className="flow-panel reveal delay-2">
        <h3>User Flow</h3>
        <div className="flow-steps">
          <span>Home</span>
          <span>Book Slot</span>
          <span>Verify OTP</span>
          <span>Get Confirmation</span>
          <span>Visit Center</span>
        </div>
      </article>
    </section>
  );
}
