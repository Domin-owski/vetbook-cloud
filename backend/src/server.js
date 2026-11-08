import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import appointmentRoutes from "./routes/appointmentRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/health", (request, response) => {
  response.status(200).json({
    status: "ok",
    service: "VetBook API",
  });
});

app.use("/api/appointments", appointmentRoutes);

app.use((request, response) => {
  response.status(404).json({
    error: "Nie znaleziono endpointu",
  });
});

app.use((error, request, response, next) => {
  console.error(error);

  response.status(500).json({
    error: "Wewnętrzny błąd serwera",
  });
});

app.listen(PORT, () => {
  console.log(`VetBook API działa na http://localhost:${PORT}`);
});