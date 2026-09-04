import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { UserService } from '../services/UserService';
import { UserRepository } from '../repositories/UserRepository';
import db from '../database/connection';
import { authMiddleware, requirePermission } from '../middlewares/authMiddleware';
import { profileUpload } from '../middlewares/profileUpload';
import { Permissions } from '../config/rbac';

const router = Router();
const repository = new UserRepository(db);
const service = new UserService(repository);
const controller = new UserController(service);

/**
 * CRUD DE USUÁRIOS (SaneaTISS)
 */

// Create: Cadastro público
router.post('/users/register', controller.register);

// Login: Acesso público
router.post('/users/login', controller.login);

// Read own profile: Apenas o usuário logado pode acessar
router.get('/users/:id', authMiddleware, requirePermission(Permissions.PROFILE_READ_SELF), controller.getUser);

// Update: Apenas usuários logados
router.put('/users/:id', authMiddleware, requirePermission(Permissions.PROFILE_UPDATE_SELF), controller.updateUser);
router.post('/users/:id/photo', authMiddleware, requirePermission(Permissions.PROFILE_UPLOAD_PHOTO), profileUpload.single('photo'), controller.uploadPhoto);

// Delete: ROTA NOVA para completar o CRUD (Autenticada)
router.delete('/users/:id', authMiddleware, requirePermission(Permissions.PROFILE_DELETE_SELF), controller.deleteUser);

export default router;
