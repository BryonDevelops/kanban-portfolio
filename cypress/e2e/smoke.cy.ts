describe('Smoke Test', () => {
  it('loads the home page and shows hero content', () => {
    cy.visit('/')
    cy.contains('Kanban').should('exist')
    cy.contains('Get Started').should('exist')
  })
})
