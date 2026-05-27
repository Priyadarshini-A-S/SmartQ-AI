import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "../api";
import { sampleBookingOutput, sampleOtp } from "../demoData";

export default function OTPPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [otp, setOtp] = useState(state?.debugOtp || sampleOtp);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const mobile = state?.mobileNumber || sampleBookingOutput.mobileNumber;
  const currentOtp = state?.debugOtp || sampleOtp;
  const hasRequest = Boolean(state?.requestId);

  const verifyOtp = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    if (!hasRequest || state?.demoMode) {
      if (otp !== currentOtp) {
        setError("Incorrect sample OTP. Try the displayed value.");
        setLoading(false);
        return;
      }

      const demoBooking = {
        ...sampleBookingOutput,
        ...state?.draftBooking,
        bookingId: sampleBookingOutput.bookingId
      };

      localStorage.setItem("lastBooking", JSON.stringify(demoBooking));
      navigate("/confirmation", { state: { booking: demoBooking } });
      setLoading(false);
      return;
    }

    try {
      const response = await api.verifyOtp({ requestId: state.requestId, otp });
      localStorage.setItem("lastBooking", JSON.stringify(response.booking));
      navigate("/confirmation", {
        state: { booking: response.booking }
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card page-section reveal">
      <h2>OTP Verification</h2>
      <p>
        Enter the OTP sent to mobile: <strong>{mobile}</strong>
      </p>
      <p className="helper-text">Sample OTP: {currentOtp}</p>

      <form className="otp-row" onSubmit={verifyOtp}>
        <input
          type="text"
          maxLength={6}
          required
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter 6-digit OTP"
        />
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Verifying..." : "Confirm Booking"}
        </button>
      </form>

      {!hasRequest && (
        <p className="helper-text">
          No prior booking found. This page is running in sample mode to showcase full output.
        </p>
      )}

      {!hasRequest && (
        <Link className="btn btn-secondary" to="/book">
          Go to Booking
        </Link>
      )}

      {error && <p className="error-text">{error}</p>}
    </section>
  );
}
