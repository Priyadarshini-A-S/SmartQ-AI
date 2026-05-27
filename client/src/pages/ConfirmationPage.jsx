import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { sampleBookingOutput } from "../demoData";

export default function ConfirmationPage() {
  const { state } = useLocation();

  const booking = useMemo(() => {
    if (state?.booking) {
      return state.booking;
    }

    const cached = localStorage.getItem("lastBooking");
    return cached ? JSON.parse(cached) : sampleBookingOutput;
  }, [state]);

  return (
    <section className="card page-section reveal">
      <h2>Booking Confirmed</h2>
      <p>Your appointment has been scheduled successfully.</p>

      <div className="slip">
        <p>
          <span>Booking ID</span>
          <strong>{booking.bookingId}</strong>
        </p>
        <p>
          <span>Date & Time</span>
          <strong>
            {booking.appointmentDate} | {booking.timeSlot}
          </strong>
        </p>
        <p>
          <span>Center Name</span>
          <strong>{booking.centerName}</strong>
        </p>
      </div>

      <button className="btn btn-primary" onClick={() => window.print()}>
        Download / Screenshot Slip
      </button>

      <Link className="btn btn-secondary" to="/book">
        Book Another Slot
      </Link>
    </section>
  );
}
