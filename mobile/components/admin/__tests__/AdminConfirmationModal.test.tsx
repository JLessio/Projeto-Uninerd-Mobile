import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { AdminConfirmationModal } from '@/components/admin/AdminConfirmationModal';
import { confirmAdminPassword } from '@/services/adminService';

jest.mock('@/contexts/SessionContext', () => ({ useSession: () => ({ token: 'token-admin' }) }));
jest.mock('@/services/adminService', () => ({ confirmAdminPassword: jest.fn() }));

const mockedConfirmAdminPassword = jest.mocked(confirmAdminPassword);

describe('interação da dupla confirmação administrativa', () => {
  beforeEach(() => jest.clearAllMocks());

  it('não avança sem a senha do administrador', async () => {
    const view = await render(<AdminConfirmationModal visible action="delete-user" targetId={7} description="excluir este usuário" onClose={jest.fn()} onConfirmed={jest.fn()} />);

    await fireEvent.press(view.getByRole('button', { name: 'Validar senha' }));
    expect(view.getByText('Informe a senha do administrador.')).toBeTruthy();
    expect(mockedConfirmAdminPassword).not.toHaveBeenCalled();
  });

  it('valida a senha e exige uma segunda confirmação antes da exclusão', async () => {
    mockedConfirmAdminPassword.mockResolvedValue({ success: true, confirmationToken: 'confirmacao-temporaria' });
    const onConfirmed = jest.fn().mockResolvedValue(undefined);
    const view = await render(<AdminConfirmationModal visible action="delete-user" targetId={7} description="excluir este usuário" onClose={jest.fn()} onConfirmed={onConfirmed} />);

    await fireEvent.changeText(view.getByLabelText('Senha do administrador'), 'senha-segura');
    await fireEvent.press(view.getByRole('button', { name: 'Validar senha' }));

    await waitFor(() => expect(mockedConfirmAdminPassword).toHaveBeenCalledWith('token-admin', 'senha-segura', 'delete-user', 7));
    expect(await view.findByText('2ª confirmação — ação final')).toBeTruthy();
    expect(onConfirmed).not.toHaveBeenCalled();

    await fireEvent.press(view.getByRole('button', { name: 'Sim, confirmar ação' }));
    await waitFor(() => expect(onConfirmed).toHaveBeenCalledWith('confirmacao-temporaria'));
  });

  it('cancela sem executar a ação', async () => {
    const onClose = jest.fn();
    const onConfirmed = jest.fn();
    const view = await render(<AdminConfirmationModal visible action="update-user" targetId={8} description="editar este usuário" onClose={onClose} onConfirmed={onConfirmed} />);

    await fireEvent.press(view.getByRole('button', { name: 'Cancelar' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onConfirmed).not.toHaveBeenCalled();
  });
});
