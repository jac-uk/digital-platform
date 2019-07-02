describe('Home Page', function() {

  describe("Loads", () => {

    it('successfully if the correct reference value is provided in query string', function() {
      cy.visit('http://localhost:8002?ref=1uOa021dKuFiNIx9rA2E');

      cy.get('#screen-upload').should('be.visible');
    })

    it('unsuccessfully if the reference is not provided in query string', function() {
      cy.visit('http://localhost:8002');

      cy.get('#screen-upload').should('not.be.visible');
    })

    it('unsuccessfully if the reference is not valid', function() {
      cy.visit('http://localhost:8002?ref=notvalid');

      cy.get('#screen-upload').should('not.be.visible');
    })
  })

  describe("Displays a message", () => {
    it('"Invalid link" if the reference is not found or incorrect', function() {
      cy.visit('http://localhost:8002?ref=');

      cy.get('#screen-not-found').should('not.be.hidden');
      cy.get('#screen-error').should('be.hidden');
    })

  })

})