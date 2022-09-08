import $ from '@selectors/index'
import { fiatCurrencyCode } from '@fixtures/fiat-currency-info.json'
import { getStage } from '@support/helper-functions'
import { ICurrency } from '../interfaces'

declare global {
  namespace Cypress {
    interface Chainable {
      approveMerchantRefundViaAPI(refundID: number): Promise<any>
      getMerchantOrderRefundDataViaAPI(orderID: number): Promise<any>
      getMerchantOrderRefundViaAPI(refundID: number): Promise<any>
      selectRefundBalance(orderID: number, currency: ICurrency): Chainable<Element>
      selectRefundCurrency(currency: ICurrency): Chainable<Element>
      selectRefundNetwork(currency: ICurrency): Chainable<Element>
      assertOriginalPriceCurrencyIsCorrect(currencyCode: string): Chainable<Element>
    }
  }
}

Cypress.Commands.add('approveMerchantRefundViaAPI', (refundID) => {
  cy.logStep('API: Approve merchant refund')

  cy.internalRequest({
    method: 'POST',
    url: ''
  }).then((response) => {
    expect(response.status).to.be.eq(204)
  })
})

Cypress.Commands.add('getMerchantOrderRefundDataViaAPI', (orderID) => {
  cy.logStep('API: Get merchant order refund data')

  cy.internalRequest({
    url: `/account/orders/${orderID}/refund-data`
  }).then((response) => {
    expect(response.status).to.be.eq(200)
  })
})

Cypress.Commands.add('getMerchantOrderRefundViaAPI', (refundID) => {
  cy.logStep('API: Get merchant order refund')

  cy.internalRequest({
    url: `/account/refunds/${refundID}.json`
  }).then((response) => {
    expect(response.status).to.be.eq(200)
  })
})

Cypress.Commands.add('selectRefundBalance', (orderID, currency) => {
  const { currencyTitle, currencySymbol } = currency

  cy.getMerchantOrderRefundDataViaAPI(orderID)
    .then((response) => {
      const refundCurrencyBalance = response.body.refund_info.form.balances[0]
      const currencyAmount = refundCurrencyBalance.amount
      const currencyAmountInEUR = refundCurrencyBalance.amount_eur

      const refundCurrencyText =
        `${currencyTitle} (${currencySymbol}) ${currencyAmount} ${currencySymbol} / ${currencyAmountInEUR} ${fiatCurrencyCode} remaining`

      cy.get($.MERCHANT.REFUNDS.SELECT.BALANCE)
        .should('be.visible')
        .click()

      cy.contains(`${$.GENERAL.DROPDOWN.SELECT_DROPDOWN_MENU_ITEM}:visible`, refundCurrencyText)
        .click()

      cy.get($.MERCHANT.REFUNDS.SELECT.BALANCE)
        .should('be.visible')
        .and('contain', refundCurrencyText)
    })
})

Cypress.Commands.add('selectRefundCurrency', (currency) => {
  const { currencyTitle, currencySymbol } = currency

  cy.get($.MERCHANT.REFUNDS.SELECT.CURRENCY)
    .should('be.visible')
    .click()

  cy.contains(`${$.GENERAL.DROPDOWN.SELECT_DROPDOWN_MENU_ITEM}:visible`, `${currencyTitle} (${currencySymbol})`)
    .click()

  cy.get($.MERCHANT.REFUNDS.SELECT.CURRENCY)
    .should('be.visible')
    .and('contain', `${currencyTitle} (${currencySymbol})`)
})

Cypress.Commands.add('selectRefundNetwork', (currency) => {
  const { platform } = currency

  cy.get($.MERCHANT.REFUNDS.SELECT.NETWORK)
    .should('be.visible')
    .click()

  cy.contains(`${$.GENERAL.DROPDOWN.SELECT_DROPDOWN_MENU_ITEM}:visible`, platform.title)
    .click()

  cy.get($.MERCHANT.REFUNDS.SELECT.CURRENCY)
    .should('be.visible')
    .and('contain', platform.title)
})

Cypress.Commands.add('assertOriginalPriceCurrencyIsCorrect', (currencyCode) => {
  cy.get($.MERCHANT.REFUNDS.SPAN.ORIGINAL_PRICE_CURRENCY)
    .should('be.visible')
    .and('contain', currencyCode.toUpperCase())
})
