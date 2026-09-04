import { Request, Response } from 'express';
import { UserService } from '../services/UserService'; // Corrigido: Removido espaço extra
import { IUser, IUserCredentials } from '../../@types/index';
import fs from 'fs/promises';
import path from 'path';

export class UserController {
  public constructor(
    private readonly userService: Pick<UserService, 'register' | 'update' | 'getById' | 'login' | 'delete'>,
  ) {}

  public register = async (req: Request, res: Response): Promise<void> => {
    try {
      const data: IUser = req.body;
      const user = await this.userService.register(data);
      res.status(201).json({ success: true, data: user });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro interno.';
      res.status(400).json({ success: false, message });
    }
  };

  public updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const data: Partial<IUser> = req.body;

      //Verifica se o usuário logado está editando o próprio perfil
      if (req.user?.id !== Number(id)) {
        res.status(403).json({ success: false, message: 'Você não tem permissão para editar este usuário.' });
        return;
      }

      const updatedUser = await this.userService.update(Number(id), data);
      res.status(200).json({ success: true, data: updatedUser });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro interno.';
      res.status(400).json({ success: false, message });
    }
  };

  public getUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (req.user?.id !== Number(id)) {
        res.status(403).json({ success: false, message: 'Você não tem permissão para ver este usuário.' });
        return;
      }

      const user = await this.userService.getById(Number(id));
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro interno.';
      res.status(400).json({ success: false, message });
    }
  };

  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const credentials: IUserCredentials = req.body;
      const { token, user } = await this.userService.login(credentials);
      res.status(200).json({ success: true, token, user });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro interno.';
      res.status(401).json({ success: false, message });
    }
  };

  public deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      // Verifica se o usuário logado está tentando deletar a si mesmo
      if (req.user?.id !== Number(id)) {
        res.status(403).json({ success: false, message: 'Você não tem permissão para excluir este usuário.' });
        return;
      }

      await this.userService.delete(Number(id));
      res.status(200).json({ success: true, message: 'Usuário excluído com sucesso.' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro interno.';
      res.status(400).json({ success: false, message });
    }
  };

  public uploadPhoto = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      if (req.user?.id !== id) { res.status(403).json({ success: false, message: 'Você só pode alterar sua própria foto.' }); return; }
      if (!req.file) { res.status(400).json({ success: false, message: 'Selecione uma imagem.' }); return; }
      const previousUser = await this.userService.getById(id);
      const photoUrl = `/uploads/profiles/${req.file.filename}`;
      const user = await this.userService.update(id, { foto_url: photoUrl });
      const previousPhoto = previousUser.foto_url;
      if (previousPhoto) {
        const pathname = (() => { try { return new URL(previousPhoto).pathname; } catch { return previousPhoto; } })();
        if (pathname.startsWith('/uploads/profiles/')) {
          const oldFilename = path.basename(pathname);
          if (oldFilename !== req.file.filename) {
            await fs.unlink(path.resolve(process.cwd(), 'uploads', 'profiles', oldFilename)).catch(() => undefined);
          }
        }
      }
      res.json({ success: true, data: user });
    } catch (error) {
      if (req.file) await fs.unlink(req.file.path).catch(() => undefined);
      res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Erro ao enviar foto.' });
    }
  };
}
