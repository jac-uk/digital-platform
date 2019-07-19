context('Window', () => {

  beforeEach(() => {
    cy.visit('http://localhost:8002?ref=test');
  });

  it('title contains the name of the organisation', () => {
    cy.title().should('include', 'Judical Appointments Commission');
  });

});
