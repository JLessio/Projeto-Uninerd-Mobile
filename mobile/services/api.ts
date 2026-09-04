import { assertApiConfigured } from '@/constants/config';
import type { ApiErrorResponse } from '@/types/api';

export class ApiError extends Error {
  public constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  token?: string;
  body?: object;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, body, headers, ...requestOptions } = options;

  try {
    const response = await fetch(`${assertApiConfigured()}${path}`, {
      ...requestOptions,
      headers: {
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const responseBody = (await response.json().catch(() => ({}))) as T & ApiErrorResponse;
    if (!response.ok) {
      throw new ApiError(responseBody.message ?? 'Não foi possível concluir a operação.', response.status);
    }

    return responseBody;
  } catch (error) {
    if (error instanceof ApiError || (error instanceof Error && error.message.startsWith('Configure '))) {
      throw error;
    }

    console.error('Falha técnica na comunicação com a API:', error);
    throw new ApiError('Não foi possível conectar ao servidor.', 0);
  }
}
