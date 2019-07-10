describe('Accessibility', () => {

  it('input field has an associated label', () => {
    cy.visit('http://localhost:8002?ref=test');

    cy.get('input[type=file] + label').should('have.attr', 'for');
  });
  
});
