import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { IUser } from '../../@types/index';
import { getJwtSecret } from '../config/security';
import { hasPermission, type Permission } from '../config/rbac';

const JWT_SECRET = getJwtSecret();

interface JwtPayload {
  id:    number;
  nivel: IUser['nivel'];
}

const extractToken = (req: Request): string | null => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return null;
  return auth.split(' ')[1];
};

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const token = extractToken(req);
  if (!token) {
    res.status(401).json({ success: false, message: 'Token não fornecido.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    if (!Number.isInteger(decoded.id) || decoded.id <= 0 || !['medico', 'paciente', 'admin'].includes(decoded.nivel)) {
      throw new Error('Token sem identidade válida.');
    }
    req.user = { id: decoded.id, nivel: decoded.nivel };
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Token inválido ou expirado.' });
  }
};

export const adminMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user?.nivel !== 'admin') {
    res.status(403).json({ success: false, message: 'Acesso exclusivo do administrador.' });
    return;
  }
  next();
};

export const requirePermission = (permission: Permission) => (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user || !hasPermission(req.user.nivel, permission)) {
    res.status(403).json({ success: false, message: 'Seu perfil não possui permissão para esta ação.' });
    return;
  }
  next();
};
