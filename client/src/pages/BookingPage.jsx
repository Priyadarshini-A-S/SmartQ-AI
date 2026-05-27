import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { sampleBookingInput } from "../demoData";

const centers = {
  Bengaluru: ["Central Aadhaar Center", "Whitefield Seva Kendra"],
  Chennai: ["Anna Nagar Aadhaar Point", "Velachery Seva Kendra"],
  Hyderabad: ["Madhapur Aadhaar Hub", "Kukatpally Citizen Center"]
};

const serviceOptions = [
  "New Aadhaar Enrollment",
  "Address Update",
  "Mobile Number Update",
  "Biometric Update"
];

export default function BookingPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    city: sampleBookingInput.city,
    centerName: sampleBookingInput.centerName,
    serviceType: sampleBookingInput.serviceType,
    appointmentDate: sampleBookingInput.appointmentDate,
    timeSlot: sampleBookingInput.timeSlot,
    name: sampleBookingInput.name,
    mobileNumber: sampleBookingInput.mobileNumber,
    aadhaar: sampleBookingInput.aadhaar
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const onFieldChange = (field, value) => {
    if (field === "city") {
      setForm((prev) => ({
        ...prev,
        city: value,
        centerName: centers[value][0]
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const submitBooking = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setMessageType("info");

    try {
      const response = await api.requestOtp(form);

      navigate("/otp", {
        state: {
          requestId: response.requestId,
          mobileNumber: form.mobileNumber,
          debugOtp: response.debugOtp
        }
      });
    } catch (error) {
      setMessageType("error");
      setMessage(error.message || "Unable to generate OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAiSuggestion = async () => {
    setAiLoading(true);
    setAiSuggestion(null);
    try {
      const result = await api.suggestTime(form.city, form.appointmentDate);
      setAiSuggestion(result);
      onFieldChange("timeSlot", result.suggestedSlot);
    } catch {
      setAiSuggestion({ error: "Could not fetch suggestion. Try again." });
    } finally {
      setAiLoading(false);
    }
  };

  const fillSampleInput = () => {
    setForm({ ...sampleBookingInput });
    setMessageType("info");
    setMessage("Sample input loaded. Click Book Slot to continue demo flow.");
  };

  return (
    <section className="card page-section reveal">
      <h2>Appointment Booking</h2>
      <p>Fill your details and lock your Aadhaar service slot.</p>

      <div className="progress-line" aria-label="Booking progress indicator">
        <span className="active">1. Details</span>
        <span>2. OTP</span>
        <span>3. Confirmation</span>
      </div>

      <div className="demo-strip ai-strip">
        <span>Let AI pick the best time slot based on weather &amp; crowd data.</span>
        <button type="button" className="btn btn-primary" onClick={fetchAiSuggestion} disabled={aiLoading}>
          {aiLoading ? "Analysing..." : "✨ AI Suggest Time"}
        </button>
      </div>

      {aiSuggestion && !aiSuggestion.error && (
        <div className="ai-card">
          <div className="ai-card-header">
            <span className="ai-badge">✨ AI Recommendation</span>
            <span className={`crowd-pill ${aiSuggestion.crowdLevel.toLowerCase()}`}>{aiSuggestion.crowdLevel} crowd</span>
          </div>

          <div className="ai-weather-row">
            <div className="ai-weather-icon">
              {aiSuggestion.weather.rainChance > 60 ? "🌧️" : aiSuggestion.weather.tempC > 33 ? "☀️" : "⛅"}
            </div>
            <div className="ai-weather-details">
              <strong>{aiSuggestion.weather.city} Weather</strong>
              <span className="ai-weather-condition">{aiSuggestion.weather.condition}</span>
              <div className="ai-weather-stats">
                <span>🌡️ {aiSuggestion.weather.tempC}°C</span>
                <span>🌧 {aiSuggestion.weather.rainChance}% rain chance</span>
              </div>
            </div>
          </div>

          <div className="ai-best-slot">
            <span className="ai-slot-label">Recommended Slot</span>
            <strong className="ai-slot-value">{aiSuggestion.suggestedSlot}</strong>
          </div>

          <p className="ai-reason">{aiSuggestion.reason}</p>

          <div className="ai-slot-table">
            {aiSuggestion.allSlots.map((s) => (
              <div key={s.slot} className={`ai-slot-row ${s.slot === aiSuggestion.suggestedSlot ? "ai-slot-best" : ""}`}>
                <span>{s.slot}</span>
                <span className={`crowd-pill ${s.crowdLevel.toLowerCase()}`}>{s.crowdLevel}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {aiSuggestion?.error && <p className="error-text">{aiSuggestion.error}</p>}

      <div className="demo-strip">
        <span>Sample input is prefilled for quick demo.</span>
        <button type="button" className="btn btn-secondary" onClick={fillSampleInput}>
          Reload Sample Input
        </button>
      </div>

      <form className="form-grid" onSubmit={submitBooking}>
        <label>
          Select City
          <select value={form.city} onChange={(e) => onFieldChange("city", e.target.value)}>
            {Object.keys(centers).map((city) => (
              <option key={city}>{city}</option>
            ))}
          </select>
        </label>

        <label>
          Select Center
          <select value={form.centerName} onChange={(e) => onFieldChange("centerName", e.target.value)}>
            {centers[form.city].map((center) => (
              <option key={center}>{center}</option>
            ))}
          </select>
        </label>

        <label>
          Select Service Type
          <select value={form.serviceType} onChange={(e) => onFieldChange("serviceType", e.target.value)}>
            {serviceOptions.map((service) => (
              <option key={service}>{service}</option>
            ))}
          </select>
        </label>

        <label>
          Select Date
          <input
            type="date"
            required
            value={form.appointmentDate}
            onChange={(e) => onFieldChange("appointmentDate", e.target.value)}
          />
        </label>

        <label>
          Select Time Slot
          <select value={form.timeSlot} onChange={(e) => onFieldChange("timeSlot", e.target.value)}>
            <option>10:00 AM - 10:30 AM</option>
            <option>11:00 AM - 11:30 AM</option>
            <option>12:00 PM - 12:30 PM</option>
            <option>02:00 PM - 02:30 PM</option>
            <option>03:00 PM - 03:30 PM</option>
          </select>
        </label>

        <label>
          Name
          <input
            type="text"
            required
            placeholder="Enter full name"
            value={form.name}
            onChange={(e) => onFieldChange("name", e.target.value)}
          />
        </label>

        <label>
          Mobile Number
          <input
            type="tel"
            required
            placeholder="10-digit number"
            value={form.mobileNumber}
            onChange={(e) => onFieldChange("mobileNumber", e.target.value)}
          />
        </label>

        <label>
          Aadhaar (optional)
          <input
            type="text"
            placeholder="XXXX XXXX XXXX"
            value={form.aadhaar}
            onChange={(e) => onFieldChange("aadhaar", e.target.value)}
          />
        </label>

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Please wait..." : "Book Slot"}
        </button>
      </form>

      {message && <p className={messageType === "error" ? "error-text" : "helper-text"}>{message}</p>}

      <div className="sample-box">
        <h3>Sample Input Snapshot</h3>
        <p>
          {form.name} | {form.mobileNumber} | {form.serviceType}
        </p>
        <p>
          {form.city}, {form.centerName} | {form.appointmentDate} | {form.timeSlot}
        </p>
      </div>
    </section>
  );
}
