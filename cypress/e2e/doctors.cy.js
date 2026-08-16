const makeUniqueEmail = (prefix = 'doctor-crud') =>
  `${prefix}+${Date.now()}${Math.floor(Math.random() * 100000)}@example.com`;

describe('CRUD de Medicos', () => {
  const runId = Date.now();
  const password = 'SenhaForte@123';
  const ownerEmail = makeUniqueEmail('doctor-owner');
  const ownerName = `Dr Admin Cypress ${runId}`;
  const doctorName = `Dr CRUD Cypress ${runId}`;
  const doctorEditedName = `Dr CRUD Editado ${runId}`;
  const doctorCrm = String(runId).slice(-6);
  const doctorEditedCrm = String(runId + 1).slice(-6);
  const doctorAddress = `Clinica Cypress ${runId}`;
  const doctorEditedAddress = `Clinica Editada ${runId}`;

  let authToken = '';
  let authUser = null;
  let specialtyName = '';

  before(() => {
    cy.clearLocalStorage();

    cy.request('/api/specialties')
      .its('body')
      .then((specialties) => {
        const specialty = specialties.find((item) => item.id && item.name);
        expect(specialty, 'especialidade disponivel').to.exist;
        specialtyName = specialty.name;

        cy.request('POST', '/api/users/register', {
          nome: ownerName,
          email: ownerEmail,
          senha: password,
          nivel: 'medico',
          crm_numero: String(runId).slice(-6),
          crm_uf: 'SP',
          id_especialidade: specialty.id,
        });
      })
      .then(() => {
        cy.request('POST', '/api/users/login', {
          email: ownerEmail,
          senha: password,
        }).then((response) => {
          authToken = response.body.token;
          authUser = response.body.user;

          expect(authToken, 'token do medico').to.be.a('string').and.not.be.empty;
          expect(authUser?.nivel, 'usuario medico').to.eq('medico');
        });
      });
  });

  it('nao cadastra medico sem campos obrigatorios', () => {
    cy.visit('/doctors/new', {
      onBeforeLoad(win) {
        win.localStorage.setItem('@MedicalBooking:token', authToken);
        win.localStorage.setItem('@MedicalBooking:user', JSON.stringify(authUser));
      },
    });

    cy.contains('button', /Salvar M.dico/).click();
    cy.url().should('include', '/doctors/new');
    cy.contains('Cadastrar Novo').should('be.visible');
  });

  it('cadastra, lista, edita e exclui um medico', () => {
    cy.visit('/doctors/new', {
      onBeforeLoad(win) {
        win.localStorage.setItem('@MedicalBooking:token', authToken);
        win.localStorage.setItem('@MedicalBooking:user', JSON.stringify(authUser));
        cy.stub(win, 'alert').as('alert');
      },
    });

    cy.contains('label', 'Nome Completo').parent().find('input').type(doctorName);
    cy.contains('label', 'CRM').parent().find('input').type(doctorCrm);
    cy.contains('label', 'Especialidade').parent().find('select').select(specialtyName);
    cy.contains('label', /Endere.o/).parent().find('input').type(doctorAddress);

    cy.contains('button', /Salvar M.dico/).click();
    cy.get('@alert').should('have.been.calledWithMatch', /M.dico cadastrado com sucesso/);

    cy.url().should('include', '/doctors');
    cy.contains('tr', doctorName).within(() => {
      cy.contains(doctorAddress).should('be.visible');
      cy.contains(specialtyName).should('be.visible');
      cy.contains('button', 'Editar').click({ force: true });
    });

    cy.url().should('include', '/doctors/edit/');
    cy.contains('label', 'Nome Completo').parent().find('input').clear().type(doctorEditedName);
    cy.contains('label', 'CRM').parent().find('input').clear().type(doctorEditedCrm);
    cy.contains('label', 'Especialidade').parent().find('select').select(specialtyName);
    cy.contains('label', /Endere.o/).parent().find('input').clear().type(doctorEditedAddress);

    cy.contains('button', /Salvar Altera/).click();
    cy.get('@alert').should('have.been.calledWithMatch', /M.dico atualizado com sucesso/);

    cy.url().should('include', '/doctors');
    cy.contains('tr', doctorEditedName).within(() => {
      cy.contains(doctorEditedAddress).should('be.visible');
      cy.contains(specialtyName).should('be.visible');
      cy.contains('button', 'Excluir').click({ force: true });
    });

    cy.contains('button', 'Sim, Excluir').click();
    cy.get('@alert').should('have.been.calledWithMatch', /M.dico removido com sucesso/);

    cy.contains(doctorEditedName).should('not.exist');
  });
});
