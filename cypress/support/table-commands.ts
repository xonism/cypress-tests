import $ from '@selectors/index'

declare global {
  namespace Cypress {
    interface Chainable {
      assertTableDataCellIsEmpty(cellNumber: number): Chainable<Element>
      assertTableDataCellIsNotEmpty(cellNumber: number): Chainable<Element>
      assertTableDataCellContains(cellNumber: number, cellValue: string | number): Chainable<Element>
      assertTableHeaderCellContains(cellNumber: number, cellValue: string | number): Chainable<Element>
      assertTableHeaderCellIsEmpty(cellNumber: number): Chainable<Element>
      assertEmptyTableState(description?: string): Chainable<Element>
      getTableRow(rowNumber: number): Chainable<Element>
    }
  }
}

Cypress.Commands.add('assertTableDataCellIsEmpty', (cellNumber) => {
  cy.get('td')
    .eq(cellNumber)
    .should('be.empty')
})

Cypress.Commands.add('assertTableDataCellIsNotEmpty', (cellNumber) => {
  cy.get('td')
    .eq(cellNumber)
    .should('not.be.empty')
})

Cypress.Commands.add('assertTableDataCellContains', (cellNumber, cellValue) => {
  cy.get('td')
    .eq(cellNumber)
    .should('contain', cellValue)
})

Cypress.Commands.add('assertTableHeaderCellContains', (cellNumber, cellValue) => {
  cy.get('th')
    .eq(cellNumber)
    .should('contain', cellValue)
})

Cypress.Commands.add('assertTableHeaderCellIsEmpty', (cellNumber) => {
  cy.get('th')
    .eq(cellNumber)
    .should('be.empty')
})

Cypress.Commands.add('assertEmptyTableState', (description = 'No Data') => {
  cy.get($.GENERAL.SPIN_DOT)
    .should('not.exist')

  cy.get($.GENERAL.EMPTY.IMAGE)
    .should('be.visible')

  cy.get($.GENERAL.EMPTY.DESCRIPTION)
    .should('be.visible')
    .and('contain', description)
})

Cypress.Commands.add('getTableRow', (rowNumber) => {
  cy.get('tbody tr')
    .should('be.visible')
    .eq(rowNumber)
})
