import {
  formatAppointmentDate,
  getAppointmentDisplayStatus,
  isAppointmentActionable,
  toAppointmentPayload,
  toFormDate,
  validateAppointment,
} from '@/utils/appointment';

describe('validação de agendamentos no mobile', () => {
  it('exige a seleção de um médico', () => {
    expect(validateAppointment({ doctorId: null, date: '2099-01-10 10:00', type: 'consulta' }))
      .toBe('Selecione um médico.');
  });

  it('exige que um horário disponível seja selecionado', () => {
    expect(validateAppointment({ doctorId: 1, date: '', type: 'consulta' }))
      .toBe('Informe data e horário no formato AAAA-MM-DD HH:mm.');
  });

  it('rejeita valores digitados em formato incompatível', () => {
    expect(validateAppointment({ doctorId: 1, date: '10/01/2099 10:00', type: 'consulta' }))
      .toBe('Informe data e horário no formato AAAA-MM-DD HH:mm.');
  });

  it('rejeita horários que já passaram', () => {
    expect(validateAppointment({ doctorId: 1, date: '2020-01-01 10:00', type: 'consulta' }))
      .toBe('Escolha uma data e horário futuros.');
  });

  it('aceita médico, dia e horário futuro selecionados', () => {
    expect(validateAppointment({ doctorId: 7, date: '2099-01-10 10:00', type: 'consulta' }))
      .toBeNull();
  });

  it('monta o payload da API com segundos uma única vez', () => {
    expect(toAppointmentPayload({ doctorId: 7, date: '2099-01-10 10:00', type: 'exame' })).toEqual({
      doctorId: 7,
      date: '2099-01-10 10:00:00',
      type: 'exame',
    });
  });

  it('converte a data da API para o valor usado na edição', () => {
    expect(toFormDate('2099-01-10T10:00:00.000Z')).toBe('2099-01-10 10:00');
  });

  it('preserva o texto original quando a data não pode ser formatada', () => {
    expect(formatAppointmentDate('data-inválida')).toBe('data-inválida');
  });

  it('mostra como expirado um agendamento passado não concluído', () => {
    const now = new Date('2026-09-07T15:00:00');
    expect(getAppointmentDisplayStatus('AGENDADO', '2026-09-07 14:00:00', now)).toBe('EXPIRADO');
    expect(isAppointmentActionable('AGENDADO', '2026-09-07 14:00:00', now)).toBe(false);
  });

  it('preserva como concluído um atendimento passado concluído', () => {
    const now = new Date('2026-09-07T15:00:00');
    expect(getAppointmentDisplayStatus('CONCLUIDO', '2026-09-07 14:00:00', now)).toBe('CONCLUÍDO');
  });

  it('mantém como agendado um atendimento futuro', () => {
    const now = new Date('2026-09-07T13:00:00');
    expect(getAppointmentDisplayStatus('AGENDADO', '2026-09-07 14:00:00', now)).toBe('AGENDADO');
    expect(isAppointmentActionable('AGENDADO', '2026-09-07 14:00:00', now)).toBe(true);
  });
});
