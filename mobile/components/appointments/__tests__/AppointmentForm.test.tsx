import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { AppointmentForm } from '@/components/appointments/AppointmentForm';
import { getDoctorAvailability } from '@/services/doctorService';

jest.mock('@/services/doctorService', () => ({ getDoctorAvailability: jest.fn() }));
const mockedAvailability = jest.mocked(getDoctorAvailability);

const doctors = [{ id: 7, name: 'Dra. Ana', specialty: 'Cardiologia', crm_numero: '123', crm_uf: 'SP', address: null }];

describe('interação do formulário de agendamento', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    mockedAvailability.mockImplementation(async (_doctorId, date) => ({ doctorId: 7, date, slots: date === today ? [] : ['09:00', '10:00'] }));
  });

  it('não envia enquanto médico e horário não forem selecionados', async () => {
    const onSubmit = jest.fn();
    const view = await render(<AppointmentForm doctors={doctors} token="token" submitLabel="Salvar" isSubmitting={false} onSubmit={onSubmit} />);
    expect(view.getByText('Escolha o médico')).toBeTruthy();
    expect(view.queryByRole('button', { name: 'Salvar' })).toBeNull();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('carrega horários livres e envia o horário escolhido', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const view = await render(<AppointmentForm doctors={doctors} token="token" submitLabel="Salvar" isSubmitting={false} onSubmit={onSubmit} />);

    await fireEvent.press(view.getByText('Dra. Ana'));
    expect(view.getByText('CRM 123/SP')).toBeTruthy();
    await waitFor(() => expect(view.queryByLabelText(`Dia ${new Date().getDate()}`)).toBeNull());
    const dayButton = view.getAllByRole('radio').find((element) => String(element.props.accessibilityLabel ?? '').startsWith('Dia '));
    expect(dayButton).toBeTruthy();
    await fireEvent.press(dayButton!);

    await waitFor(() => expect(view.getByLabelText('Horário 10:00')).toBeTruthy());
    await fireEvent.press(view.getByLabelText('Horário 10:00'));
    expect(view.getByLabelText('Horário 10:00').props.accessibilityState.checked).toBe(true);
    await fireEvent.press(view.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ doctorId: 7, type: 'consulta' });
    expect(onSubmit.mock.calls[0][0].date).toMatch(/ 10:00:00$/);
  });

  it('mostra quando o médico não possui horários livres', async () => {
    mockedAvailability.mockResolvedValue({ doctorId: 7, date: '2099-01-10', slots: [] });
    const view = await render(<AppointmentForm doctors={doctors} token="token" submitLabel="Salvar" isSubmitting={false} onSubmit={jest.fn()} />);
    await fireEvent.press(view.getByText('Dra. Ana'));
    await waitFor(() => expect(view.getByText('Não há dias com horários vagos nos próximos 7 dias.')).toBeTruthy());
  });

  it('oculta hoje quando não restam horários futuros disponíveis', async () => {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    mockedAvailability.mockImplementation(async (_doctorId, date) => ({
      doctorId: 7,
      date,
      slots: date === today ? [] : ['09:00'],
    }));
    const view = await render(<AppointmentForm doctors={doctors} token="token" submitLabel="Salvar" isSubmitting={false} onSubmit={jest.fn()} />);

    await fireEvent.press(view.getByText('Dra. Ana'));

    await waitFor(() => expect(view.queryByLabelText(`Dia ${now.getDate()}`)).toBeNull());
  });

  it('atualiza os horários do médico e remove uma seleção que deixou de estar disponível', async () => {
    let refreshed = false;
    mockedAvailability.mockImplementation(async (_doctorId, date) => ({
      doctorId: 7,
      date,
      slots: refreshed ? ['14:00'] : ['09:00'],
    }));
    const onSubmit = jest.fn();
    const view = await render(<AppointmentForm doctors={doctors} token="token" submitLabel="Salvar" isSubmitting={false} onSubmit={onSubmit} />);

    await fireEvent.press(view.getByText('Dra. Ana'));
    const dayButton = await waitFor(() => view.getAllByRole('radio').find((element) => String(element.props.accessibilityLabel ?? '').startsWith('Dia ')));
    expect(dayButton).toBeTruthy();
    await fireEvent.press(dayButton!);
    await waitFor(() => expect(view.getByLabelText('Horário 09:00')).toBeTruthy());
    await fireEvent.press(view.getByLabelText('Horário 09:00'));

    refreshed = true;
    await fireEvent.press(view.getByRole('button', { name: 'Atualizar horários' }));

    await waitFor(() => expect(view.getByLabelText('Horário 14:00')).toBeTruthy());
    expect(view.queryByLabelText('Horário 09:00')).toBeNull();
    await fireEvent.press(view.getByRole('button', { name: 'Salvar' }));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
