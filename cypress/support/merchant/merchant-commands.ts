import $ from '@selectors/index'
import { getTestingApiURL } from '@support/helper-functions'

declare global {
  namespace Cypress {
    interface Chainable {
      visitFirstLinkInTable(): Chainable<Element>
      moveSliderHandleToValue(minValue: string, targetValue: number, stepValue: string): Chainable<Element>
      assertSliderHandleHasValue(value: string | number): Chainable<Element>
      getMerchantOrdersViaAPI(): Promise<any>
      getMerchantOrderViaAPI(orderID: number): Promise<any>
      enableLedgerForMerchantViaAPI(): Promise<any>
    }
  }
}

const testingApiURL = getTestingApiURL()

Cypress.Commands.add('visitFirstLinkInTable', () => {
  cy.getTableRow(0)
    .find('td a')
    .eq(0)
    .should('have.attr', 'href')
    .then((href) => {
      cy.visit(href.toString())
    })
})

Cypress.Commands.add('moveSliderHandleToValue', (minValue, targetValue, stepValue) => {
  const steps = (targetValue - Number(minValue)) / Number(stepValue)
  const rightArrowPresses = '{rightarrow}'.repeat(steps)

  cy.get($.GENERAL.SLIDER.HANDLE)
    .type(rightArrowPresses)
})

Cypress.Commands.add('assertSliderHandleHasValue', (value) => {
  cy.get($.GENERAL.SLIDER.HANDLE)
    .invoke('attr', 'aria-valuenow')
    .should('equal', value.toString())
})

Cypress.Commands.add('getMerchantOrdersViaAPI', () => {
  cy.logStep('API: Get merchant orders')

  cy.internalRequest({
    url: '/account/orders.json?filters%5Border%5D=DESC' // sorts orders from most recent
  }).then((response) => {
    expect(response.status).to.be.eq(200)
  })
})

Cypress.Commands.add('getMerchantOrderViaAPI', (orderID) => {
  cy.logStep('API: Get merchant order')

  cy.internalRequest({
    url: `/account/orders/${orderID}`
  }).then((response) => {
    expect(response.status).to.be.eq(200)
  })
})

Cypress.Commands.add('enableLedgerForMerchantViaAPI', () => {
  cy.logStep('API: Enable ledger for merchant')

  cy.getBusinessAccountsViaAPI()
    .then((response) => {
      const businessID = response.body[0].business_id

      cy.internalRequest({
        method: 'POST',
        url: `${testingApiURL}/businesses/${businessID}/enable_ledger`
      }).then((response) => {
        expect(response.status).to.be.eq(204)
      })
    })
})
