import { Navigate, Route, Routes } from "react-router-dom";
import { Shell } from "./components/Shell.jsx";
import HomePage from "./pages/HomePage.jsx";
import BookingPage from "./pages/BookingPage.jsx";
import OTPPage from "./pages/OTPPage.jsx";
import ConfirmationPage from "./pages/ConfirmationPage.jsx";
import TokenStatusPage from "./pages/TokenStatusPage.jsx";
import LiveQueuePage from "./pages/LiveQueuePage.jsx";

export default function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/book" element={<BookingPage />} />
        <Route path="/otp" element={<OTPPage />} />
        <Route path="/confirmation" element={<ConfirmationPage />} />
        <Route path="/token" element={<TokenStatusPage />} />
        <Route path="/live-queue" element={<LiveQueuePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Shell>
  );
}
