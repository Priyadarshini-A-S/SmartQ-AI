// ── Fully simulated in-memory API — no backend required ──────────────────────

const otpStore = new Map();   // requestId → { otp, payload }
const bookings = new Map();   // bookingId → booking
const tokens   = new Map();   // tokenId   → token

// per-center state: { counter, nowServing }
const queueState = new Map();

function centerState(centerName) {
  if (!queueState.has(centerName)) {
    queueState.set(centerName, { counter: 10, nowServing: 8 });
  }
  return queueState.get(centerName);
}

function crowdLevel(waiting) {
  return waiting > 10 ? "High" : waiting > 4 ? "Medium" : "Low";
}

function delay(ms = 400) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── helpers ───────────────────────────────────────────────────────────────────
function nanoid(n = 6) {
  return Math.random().toString(36).slice(2, 2 + n).toUpperCase();
}

// ── simulated handlers ────────────────────────────────────────────────────────
async function requestOtp(payload) {
  await delay();
  const { city, centerName, serviceType, appointmentDate, timeSlot, name, mobileNumber } = payload;
  if (!city || !centerName || !serviceType || !appointmentDate || !timeSlot || !name || !mobileNumber) {
    throw new Error("Please fill all required fields.");
  }
  if (!/^\d{10}$/.test(String(mobileNumber))) {
    throw new Error("Mobile number must be a valid 10-digit number.");
  }
  const requestId = nanoid(10);
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  otpStore.set(requestId, { otp, payload });
  return { message: "OTP generated.", requestId, debugOtp: otp };
}

async function verifyOtp({ requestId, otp }) {
  await delay();
  const entry = otpStore.get(requestId);
  if (!entry) throw new Error("OTP request not found. Please retry.");
  if (entry.otp !== String(otp)) throw new Error("Invalid OTP.");
  otpStore.delete(requestId);
  const bookingId = `BK-${new Date().getFullYear()}-${nanoid(6)}`;
  const booking = { bookingId, ...entry.payload, status: "confirmed", createdAt: new Date().toISOString() };
  bookings.set(bookingId, booking);
  return { message: "Booking confirmed.", booking };
}

async function getBooking(bookingId) {
  await delay();
  const booking = bookings.get(bookingId);
  if (!booking) throw new Error("Booking not found.");
  return { booking };
}

async function createWalkinToken({ centerName, customerName, serviceType }) {
  await delay();
  if (!centerName || !customerName) throw new Error("Center name and customer name are required.");
  const state = centerState(centerName);
  state.counter += 1;
  const tokenId = `TK-${nanoid(8)}`;
  const token = {
    tokenId,
    tokenNumber: state.counter,
    centerName,
    customerName,
    serviceType,
    status: "waiting",
    createdAt: new Date().toISOString()
  };
  tokens.set(tokenId, token);
  return { token };
}

async function getTokenStatus(tokenId) {
  await delay();
  const token = tokens.get(tokenId);
  if (!token) throw new Error("Token not found.");
  const state = centerState(token.centerName);
  const waiting = Math.max(0, token.tokenNumber - state.nowServing);
  return {
    tokenId: token.tokenId,
    yourToken: token.tokenNumber,
    nowServing: state.nowServing,
    estimatedWaitMinutes: waiting * 5,
    centerName: token.centerName,
    crowdLevel: crowdLevel(waiting),
    status: token.status
  };
}

async function getLiveQueue(centerName) {
  await delay();
  const state = centerState(centerName);
  const totalIssued = state.counter;
  const totalWaiting = Math.max(0, totalIssued - state.nowServing);
  return {
    centerName,
    totalWaiting,
    nowServing: state.nowServing,
    totalIssued,
    crowdLevel: crowdLevel(totalWaiting),
    refreshedAt: new Date().toISOString()
  };
}

async function advanceQueue(centerName) {
  await delay();
  const state = centerState(centerName);
  state.nowServing += 1;
  // mark the served token as completed
  for (const token of tokens.values()) {
    if (token.centerName === centerName && token.tokenNumber === state.nowServing - 1) {
      token.status = "completed";
    }
  }
  return { message: "Queue advanced." };
}

async function suggestTime(city, appointmentDate) {
  await delay();
  const slots = [
    { slot: "10:00 AM - 10:30 AM", crowdLevel: "High" },
    { slot: "11:00 AM - 11:30 AM", crowdLevel: "Medium" },
    { slot: "12:00 PM - 12:30 PM", crowdLevel: "Low" },
    { slot: "02:00 PM - 02:30 PM", crowdLevel: "Low" },
    { slot: "03:00 PM - 03:30 PM", crowdLevel: "Medium" }
  ];
  const best = slots.find((s) => s.crowdLevel === "Low") || slots[2];
  return {
    suggestedSlot: best.slot,
    crowdLevel: best.crowdLevel,
    reason: "Low crowd expected based on historical patterns.",
    allSlots: slots,
    weather: { city, condition: "Partly Cloudy", tempC: 28, rainChance: 20 }
  };
}

// ── public API object (same shape as before) ─────────────────────────────────
export const api = {
  requestOtp,
  verifyOtp,
  getBooking,
  createWalkinToken,
  getTokenStatus,
  getLiveQueue,
  advanceQueue,
  suggestTime
};
