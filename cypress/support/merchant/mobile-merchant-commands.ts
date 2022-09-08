import $ from '@selectors/index'

declare global {
  namespace Cypress {
    interface Chainable {
      mobileClickOnMoreOptions(): Chainable<Element>
    }
  }
}

Cypress.Commands.add('mobileClickOnMoreOptions', () => {
  cy.get($.GENERAL.DROPDOWN.TRIGGER)
    .should('be.visible')
    .click()
})
