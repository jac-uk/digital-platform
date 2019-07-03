describe('Accessibility', function() {

  it('input field has an associated label', function() {
    cy.visit('http://localhost:8002?ref=test');

    cy.get('input[type=file] + label').should('have.attr', 'for');
  });
  
});
