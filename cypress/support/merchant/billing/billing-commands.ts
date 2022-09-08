import $ from '@selectors/index'

declare global {
  namespace Cypress {
    interface Chainable {
      passBillingIntroduction(): Chainable<Element>
      assertContentNextToLabelIsEmpty(label: string): Chainable<Element>
      assertContentNextToLabelIsNotEmpty(label: string): Chainable<Element>
      assertContentNextToLabelContains(label: string, content): Chainable<Element>
      assertContentNextToLabelContainsHref(label: string, href: string): Chainable<Element>
    }
  }
}

Cypress.Commands.add('passBillingIntroduction', () => {
  cy.visit('/account/billing/info')

  cy.getButtonWithText('Next')
    .click()

  cy.getButtonWithText('Next')
    .click()

  cy.getButtonWithText('Next')
    .click()

  cy.getButtonWithText('Continue')
    .click()
})

Cypress.Commands.add('assertContentNextToLabelIsEmpty', (label) => {
  cy.contains($.GENERAL.DESCRIPTIONS.ITEM_LABEL, label)
    .siblings($.GENERAL.DESCRIPTIONS.ITEM_CONTENT)
    .should('be.empty')
})

Cypress.Commands.add('assertContentNextToLabelIsNotEmpty', (label) => {
  cy.contains($.GENERAL.DESCRIPTIONS.ITEM_LABEL, label)
    .siblings($.GENERAL.DESCRIPTIONS.ITEM_CONTENT)
    .should('not.be.empty')
})

Cypress.Commands.add('assertContentNextToLabelContains', (label, content) => {
  cy.contains($.GENERAL.DESCRIPTIONS.ITEM_LABEL, label)
    .siblings($.GENERAL.DESCRIPTIONS.ITEM_CONTENT)
    .should('contain', content)
})

Cypress.Commands.add('assertContentNextToLabelContainsHref', (label, href) => {
  cy.contains($.GENERAL.DESCRIPTIONS.ITEM_LABEL, label)
    .siblings($.GENERAL.DESCRIPTIONS.ITEM_CONTENT)
    .find('a')
    .invoke('attr', 'href')
    .should('contain', href)
})
