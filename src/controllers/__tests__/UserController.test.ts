import type { Request, Response } from 'express';

import { UserController } from '../UserController';
import type { UserService } from '../../services/UserService';

type UserServiceContract = Pick<UserService, 'register' | 'update' | 'getById' | 'login' | 'delete'>;

function createService(): jest.Mocked<UserServiceContract> {
  return {
    register: jest.fn(),
    update: jest.fn(),
    getById: jest.fn(),
    login: jest.fn(),
    delete: jest.fn(),
  };
}

function createResponse(): jest.Mocked<Pick<Response, 'status' | 'json'>> {
  const response = {
    status: jest.fn(),
    json: jest.fn(),
  };
  response.status.mockReturnValue(response as unknown as Response);
  return response;
}

describe('UserController — acesso à própria conta', () => {
  it.each([
    ['visualizar', 'getUser'],
    ['editar', 'updateUser'],
    ['excluir', 'deleteUser'],
  ] as const)('bloqueia %s outro usuário', async (_operation, method) => {
    const service = createService();
    const controller = new UserController(service);
    const request = {
      params: { id: '99' },
      body: {},
      user: { id: 7, nivel: 'paciente' },
    } as unknown as Request;
    const response = createResponse();

    await controller[method](request, response as unknown as Response);

    expect(response.status).toHaveBeenCalledWith(403);
    expect(service.getById).not.toHaveBeenCalled();
    expect(service.update).not.toHaveBeenCalled();
    expect(service.delete).not.toHaveBeenCalled();
  });
});
