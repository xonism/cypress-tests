import $ from '@selectors/index'

declare global {
  namespace Cypress {
    interface Chainable {
      typeAndAssertValue(typeValue: string | number, assertValue?: string | number): Chainable<Element>
      /** Additionally asserts that pulse animation in order details is not visible */
      typeAndAssertValueWithPulseCheck(typeValue: string | number, assertValue?: string | number): Chainable<Element>
      assertInputIsNotEmpty(inputSelector: string): Chainable<Element>
      assertInputContains(inputSelector: string, value: string | number): Chainable<Element>
      getExplainMessageUnderInputField(inputSelector: string): Chainable<Element>
    }
  }
}

Cypress.Commands.add('typeAndAssertValue', { prevSubject: true }, (subject, typeValue, assertValue) => {
  const valueToHave = assertValue ? assertValue : typeValue

  cy.wrap(subject)
    .should('be.enabled')
    .focus()
    .clear()

  cy.wrap(subject)
    .should('be.empty')
    .wait(1000) // ensures cypress correctly types value
    .type(typeValue.toString())
    .should('have.value', valueToHave)
})

Cypress.Commands.add('typeAndAssertValueWithPulseCheck', { prevSubject: true }, (subject, typeValue, assertValue) => {
  const valueToHave = assertValue ? assertValue : typeValue

  cy.wrap(subject)
    .should('be.enabled')
    .focus()
    .clear()

  cy.wrap(subject)
    .should('be.empty')
    .wait(1000) // ensures cypress correctly types value
    .type(typeValue.toString())
    .should('have.value', valueToHave)

  cy.get($.GENERAL.DOT_PULSE)
    .should('not.be.visible')
})

Cypress.Commands.add('assertInputIsNotEmpty', (inputSelector) => {
  cy.get(inputSelector)
    .should('be.visible')
    .invoke('val')
    .should('not.be.empty')
})

Cypress.Commands.add('assertInputContains', (inputSelector, value) => {
  cy.get(inputSelector)
    .should('be.visible')
    .invoke('val')
    .should('contain', value)
})

Cypress.Commands.add('getExplainMessageUnderInputField', (inputSelector) => {
  cy.get(inputSelector)
    .should('be.visible')
    .parentsUntil('.ant-col')
    .last()
    .find($.GENERAL.FORM.EXPLAIN)
})
