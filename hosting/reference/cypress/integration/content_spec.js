describe('Content', function() {

  beforeEach(() => {
    cy.visit('http://localhost:8002?ref=test')
  })

  it('Does not contain undefined', function() {
    cy.contains('undefined').should('not.exist');
  })

  it('Does not contain null', function() {
    cy.contains('null').should('not.exist');
  })

})
