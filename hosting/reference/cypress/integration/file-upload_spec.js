describe('File upload', () => {

  // This test will be replaced with upload test when we can set data to firestore before each Cypress test.
  // For now we only test that form is available on page load.

  it('upload form is available', () => {
    cy.visit('http://localhost:8002?ref=test'); 

    cy.get('form').should('be.visible');
  });

});
