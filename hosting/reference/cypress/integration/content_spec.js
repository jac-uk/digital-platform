/* eslint-disable */
describe('Content', () => {

  beforeEach(() => {
    cy.visit('http://localhost:8002?ref=test');
  });

  it('Does not contain undefined', () => {
    cy.wait(1000).get('body').should('not.contain', 'undefined');
  });

  it('Does not contain null', () => {
    cy.wait(1000).get('body').should('not.contain', 'null');
  });

});
