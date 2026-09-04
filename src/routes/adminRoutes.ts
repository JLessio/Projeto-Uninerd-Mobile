import { Router } from 'express';
import db from '../database/connection';
import { AdminController } from '../controllers/AdminController';
import { authMiddleware, requirePermission } from '../middlewares/authMiddleware';
import { Permissions } from '../config/rbac';

const router = Router();
const controller = new AdminController(db);
router.use('/admin', authMiddleware);
router.get('/admin/users', requirePermission(Permissions.ADMIN_USERS_READ), controller.listUsers);
router.get('/admin/users/:id', requirePermission(Permissions.ADMIN_USERS_READ), controller.getUserDetails);
router.post('/admin/confirm-password', requirePermission(Permissions.ADMIN_CONFIRM_ACTION), controller.confirmPassword);
router.put('/admin/users/:id', requirePermission(Permissions.ADMIN_USERS_MANAGE), controller.updateUser);
router.delete('/admin/users/:id', requirePermission(Permissions.ADMIN_USERS_MANAGE), controller.deleteUser);
router.put('/admin/appointments/:id', requirePermission(Permissions.ADMIN_APPOINTMENTS_MANAGE), controller.updateAppointment);
router.delete('/admin/appointments/:id', requirePermission(Permissions.ADMIN_APPOINTMENTS_MANAGE), controller.deleteAppointment);
export default router;
