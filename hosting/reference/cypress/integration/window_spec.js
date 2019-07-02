context('Window', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8002?ref=test')
  })

  it('html charset attribute is equal to UTF-8', () => {
    cy.document().should('have.property', 'charset').and('eq', 'UTF-8')
  })

  it('title contains the name of the organisation', () => {
    cy.title().should('include', 'Judical Appointments Commission')
  })
})