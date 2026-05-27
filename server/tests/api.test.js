import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../src/app.js";

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  await mongoose.connection.dropDatabase();
}, 120000);

afterEach(async () => {
  if (mongoose.connection?.db) {
    await mongoose.connection.db.dropDatabase();
  }
});

afterAll(async () => {
  await mongoose.disconnect();

  if (mongoServer) {
    await mongoServer.stop();
  }
}, 120000);

describe("API smoke tests", () => {
  test("GET /api/health returns ok", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });

  test("booking OTP flow creates and fetches a booking", async () => {
    const requestBody = {
      city: "Bengaluru",
      centerName: "Central Aadhaar Center",
      serviceType: "Mobile Number Update",
      appointmentDate: "2026-04-20",
      timeSlot: "11:00 AM - 11:30 AM",
      name: "Test User",
      mobileNumber: "9876543210",
      aadhaar: "123456789012"
    };

    const otpResponse = await request(app).post("/api/bookings/request-otp").send(requestBody);
    expect(otpResponse.status).toBe(200);
    expect(otpResponse.body.requestId).toBeTruthy();
    expect(otpResponse.body.debugOtp).toMatch(/^\d{6}$/);

    const verifyResponse = await request(app)
      .post("/api/bookings/verify-otp")
      .send({ requestId: otpResponse.body.requestId, otp: otpResponse.body.debugOtp });

    expect(verifyResponse.status).toBe(201);
    expect(verifyResponse.body.booking.bookingId).toMatch(/^BK-2026-/);

    const bookingResponse = await request(app).get(`/api/bookings/${verifyResponse.body.booking.bookingId}`);
    expect(bookingResponse.status).toBe(200);
    expect(bookingResponse.body.booking.name).toBe("Test User");
  });

  test("token flow creates, reports, and advances queue state", async () => {
    const createResponse = await request(app)
      .post("/api/tokens/walkin")
      .send({
        centerName: "Central Aadhaar Center",
        customerName: "Queue User",
        serviceType: "Address Update"
      });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.token.tokenNumber).toBe(1);
    expect(createResponse.body.token.status).toBe("waiting");

    const statusResponse = await request(app).get(`/api/tokens/status/${createResponse.body.token.tokenId}`);
    expect(statusResponse.status).toBe(200);
    expect(statusResponse.body.yourToken).toBe(1);
    expect(statusResponse.body.status).toBe("waiting");

    const liveResponse = await request(app).get("/api/tokens/live?centerName=Central%20Aadhaar%20Center");
    expect(liveResponse.status).toBe(200);
    expect(liveResponse.body.totalIssued).toBe(1);
    expect(liveResponse.body.totalWaiting).toBe(1);

    const advanceResponse = await request(app)
      .post("/api/tokens/advance")
      .send({ centerName: "Central Aadhaar Center" });

    expect(advanceResponse.status).toBe(200);
    expect(advanceResponse.body.nowServing).toBe(1);

    const afterAdvanceResponse = await request(app).get(`/api/tokens/status/${createResponse.body.token.tokenId}`);
    expect(afterAdvanceResponse.status).toBe(200);
    expect(afterAdvanceResponse.body.status).toBe("serving");
    expect(afterAdvanceResponse.body.nowServing).toBe(1);
  });
});