import { Router } from "express";
import {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from "../controllers/appointmentController.js";

import {
  validateAppointment,
  validateAppointmentUpdate,
} from "../validators/appointmentValidator.js";

const router = Router();

router.get("/", getAppointments);
router.get("/:id", getAppointment);
router.post("/", validateAppointment, createAppointment);
router.patch("/:id", validateAppointmentUpdate, updateAppointment);
router.delete("/:id", deleteAppointment);

export default router;