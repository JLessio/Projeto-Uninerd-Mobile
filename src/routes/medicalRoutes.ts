import { Router } from 'express';
import { MedicalController } from '../controllers/MedicalController';
import db from '../database/connection';
import { authMiddleware, requirePermission } from '../middlewares/authMiddleware';
import { Permissions } from '../config/rbac';

const router = Router();
const controller = new MedicalController(db);

/**
 * CRUD DE ESPECIALIDADES E MÉDICOS
 */
router.get('/doctors', authMiddleware, requirePermission(Permissions.DOCTOR_LIST), controller.getDoctors);
router.post('/doctors', authMiddleware, requirePermission(Permissions.DOCTOR_MANAGE), controller.createDoctor);
router.get('/doctors/me/schedule', authMiddleware, requirePermission(Permissions.SCHEDULE_MANAGE_SELF), controller.getMySchedule);
router.put('/doctors/me/schedule', authMiddleware, requirePermission(Permissions.SCHEDULE_MANAGE_SELF), controller.updateMySchedule);
router.get('/doctors/:id/availability', authMiddleware, requirePermission(Permissions.AVAILABILITY_READ), controller.getDoctorAvailability);
router.get('/doctors/:id', authMiddleware, requirePermission(Permissions.DOCTOR_READ), controller.getDoctorById);
router.put('/doctors/:id', authMiddleware, requirePermission(Permissions.DOCTOR_MANAGE), controller.updateDoctor);
router.delete('/doctors/:id', authMiddleware, requirePermission(Permissions.DOCTOR_MANAGE), controller.deleteDoctor);

// Read: Agora também autenticada para bater a rubrica
router.get("/specialties", controller.getSpecialties);

router.post("/specialties", authMiddleware, requirePermission(Permissions.SPECIALTY_MANAGE), controller.createSpecialty);
router.put("/specialties/:id", authMiddleware, requirePermission(Permissions.SPECIALTY_MANAGE), controller.updateSpecialty);
router.delete("/specialties/:id", authMiddleware, requirePermission(Permissions.SPECIALTY_MANAGE), controller.deleteSpecialty);

/**
 * CRUD DE AGENDAMENTOS
 */
router.get('/appointments', authMiddleware, requirePermission(Permissions.APPOINTMENT_LIST_SELF), controller.getAppointments);
router.post('/appointments', authMiddleware, requirePermission(Permissions.APPOINTMENT_CREATE), controller.createAppointment);
router.get('/appointments/:id', authMiddleware, requirePermission(Permissions.APPOINTMENT_READ_SELF), controller.getAppointmentById);
router.put('/appointments/:id', authMiddleware, requirePermission(Permissions.APPOINTMENT_UPDATE_SELF), controller.updateAppointment);
router.delete('/appointments/:id', authMiddleware, requirePermission(Permissions.APPOINTMENT_CANCEL_SELF), controller.deleteAppointment);

export default router;
