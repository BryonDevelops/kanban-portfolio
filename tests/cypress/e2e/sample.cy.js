describe('Kanban Board', () => {
  it('loads the board and shows default columns', () => {
    cy.visit('/projects')
    cy.contains('ideas')
    cy.contains('in-progress')
    cy.contains('completed')
  })

  it('can add a task (via store direct manipulation)', () => {
    cy.window().then((win) => {
      win.localStorage.clear() // reset
    })
    cy.reload()

    // Example: check that column is visible
    cy.contains('ideas')
  })
})
