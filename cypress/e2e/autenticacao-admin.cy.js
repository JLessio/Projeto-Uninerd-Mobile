describe('Fluxos administrativos do Uninerd', () => {
  const clickButton = (label) => cy.contains('[role="button"]', label).click({ force: true });
  const openLogin = () => {
    cy.clearAllLocalStorage();
    cy.visit('/login');
    cy.contains('Acesso ao Uninerd').should('be.visible');
    cy.get('[aria-label="E-mail"]').should(($input) => {
      expect(Object.keys($input[0]).some((key) => key.startsWith('__react'))).to.equal(true);
    });
  };

  const loginAsAdmin = () => {
    openLogin();
    cy.env(['adminEmail', 'adminPassword']).then(({ adminEmail, adminPassword }) => {
      cy.get('[aria-label="E-mail"]').type(adminEmail, { force: true });
      cy.get('[aria-label="Senha"]').type(adminPassword, { force: true, log: false });
    });
    clickButton('Entrar');
    cy.contains('Pacientes').should('be.visible');
    cy.contains('Selecione um perfil para ver dados e agendamentos.').should('be.visible');
  };

  it('valida os campos obrigatórios do login', () => {
    openLogin();
    clickButton('Entrar');
    cy.contains('Informe e-mail e senha.').should('be.visible');
  });

  it('direciona o administrador para Pacientes e permite alternar para Médicos', () => {
    loginAsAdmin();
    cy.location('pathname').should('include', 'admin-pacientes');
    cy.contains('[role="tab"]', 'Médicos').click({ force: true });
    cy.contains('Selecione um perfil para ver dados e agendamentos.').should('be.visible');
    cy.location('pathname').should('include', 'admin-medicos');
  });

  it('abre um perfil e exige duas confirmações para uma ação sensível', () => {
    loginAsAdmin();
    cy.contains('Ver perfil').first().click();
    cy.contains('Perfil administrativo').should('be.visible');
    clickButton('Editar usuário');
    cy.contains('1ª confirmação — identidade').should('be.visible');
    cy.env(['adminPassword']).then(({ adminPassword }) => {
      cy.get('[aria-label="Senha do administrador"]').type(adminPassword, { force: true, log: false });
    });
    clickButton('Validar senha');
    cy.contains('2ª confirmação — ação final').should('be.visible');
    clickButton('Cancelar');
    cy.contains('2ª confirmação — ação final').should('not.exist');
  });
});
