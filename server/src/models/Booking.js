// In-memory Booking store — replaces Mongoose model
const bookings = new Map();

export const Booking = {
  create(data) {
    const doc = { ...data, createdAt: new Date(), updatedAt: new Date() };
    bookings.set(data.bookingId, doc);
    return Promise.resolve(doc);
  },
  findOne({ bookingId }) {
    return Promise.resolve(bookings.get(bookingId) ?? null);
  }
};
