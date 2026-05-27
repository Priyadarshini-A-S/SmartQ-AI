import express from "express";
import cors from "cors";
import bookingRoutes from "./routes/bookingRoutes.js";
import tokenRoutes from "./routes/tokenRoutes.js";
import suggestRoutes from "./routes/suggestRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/bookings", bookingRoutes);
app.use("/api/tokens", tokenRoutes);
app.use("/api", suggestRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;