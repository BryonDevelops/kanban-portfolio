/// <reference types="cypress" />
describe('Smoke Test', () => {
  it('loads the home page and shows hero content', () => {
    cy.visit('/')
    cy.contains('Welcome to My Portfolio').should('exist')
  })
})
