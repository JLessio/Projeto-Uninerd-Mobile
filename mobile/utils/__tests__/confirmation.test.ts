import { Alert, Platform } from 'react-native';

import { confirmDestructiveAction } from '@/utils/confirmation';

describe('confirmação de ação destrutiva', () => {
  const originalPlatform = Platform.OS;
  const setPlatform = (os: typeof Platform.OS) => Object.defineProperty(Platform, 'OS', { configurable: true, value: os });

  afterEach(() => {
    setPlatform(originalPlatform);
    Reflect.deleteProperty(window, 'confirm');
    jest.restoreAllMocks();
  });

  it('executa a ação confirmada na web', () => {
    setPlatform('web');
    const confirm = jest.fn().mockReturnValue(true);
    Object.defineProperty(window, 'confirm', { configurable: true, value: confirm });
    const onConfirm = jest.fn();

    confirmDestructiveAction({ title: 'Cancelar', message: 'Deseja cancelar?', cancelLabel: 'Não', confirmLabel: 'Sim', onConfirm });

    expect(confirm).toHaveBeenCalled();
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('não executa a ação recusada na web', () => {
    setPlatform('web');
    Object.defineProperty(window, 'confirm', { configurable: true, value: jest.fn().mockReturnValue(false) });
    const onConfirm = jest.fn();

    confirmDestructiveAction({ title: 'Cancelar', message: 'Deseja cancelar?', cancelLabel: 'Não', confirmLabel: 'Sim', onConfirm });

    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('executa a confirmação pelo alerta nativo', () => {
    setPlatform('android');
    const onConfirm = jest.fn();
    jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
      buttons?.find((button) => button.style === 'destructive')?.onPress?.();
    });

    confirmDestructiveAction({ title: 'Cancelar', message: 'Deseja cancelar?', cancelLabel: 'Voltar', confirmLabel: 'Cancelar', onConfirm });

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
