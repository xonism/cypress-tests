import $ from '@selectors/index'
import { fiatTargetAmount } from '@fixtures/fiat-currency-info.json'
import { ICurrency } from '../interfaces'
import { traderCountry, traderCurrencyCode, traderCurrencySymbol } from '@fixtures/trader-currency-and-country.json'

declare global {
  namespace Cypress {
    interface Chainable {
      selectTraderCurrency(fiatDropdownSelector: string, fiatCurrencyCode: string): Chainable<Element>
      selectTraderCountry(country: string): Chainable<Element>
      assertReceiveAmountInInputAndOrderDetailsMatch(receiveInputSelector: string, currencySymbol: string): Chainable<Element>
      selectCryptoCurrency(dropdownSelector: string, currency: ICurrency): Chainable<Element>
      assertOrderDetailsReceiveAmount(amount: string | number | string[], currencySymbol: string): Chainable<Element>
      assertOrderDetailsTotalAmount(amount: string | number, currencySymbol: string): Chainable<Element>
      getOrderIdAndConfirmPaymentReceived(): Chainable<Element>
      acceptTermsAndConditions(): Chainable<Element>
      assertRedirectToVerification(): Chainable<Element>
      assertCorrectPayoutSettingIsSelected(payoutAddress: string): Chainable<Element>
      assertCopyFieldContains(copyFieldSelector: string, value: string): Chainable<Element>
      createBuyOrder(receiveCurrency: ICurrency): Chainable<Element>
    }
  }
}

Cypress.Commands.add('selectTraderCurrency', (fiatDropdownSelector, fiatCurrencyCode) => {
  // '[data-test="buy-sell-currency"]' => '[data-test="buy-sell-currency'
  const SELECTOR_START = fiatDropdownSelector.slice(0, -2)

  // '[data-test="buy-sell-currency-EUR"]'
  const CURRENCY_OPTION_SELECTOR = `${SELECTOR_START}-${fiatCurrencyCode}"]`

  cy.get(fiatDropdownSelector)
    .should('be.visible')
    .click()

  cy.get(CURRENCY_OPTION_SELECTOR)
    .should('be.visible')
    .click()

  cy.get(fiatDropdownSelector)
    .should('be.visible')
    .and('contain', fiatCurrencyCode)
})

Cypress.Commands.add('selectTraderCountry', (country) => {
  cy.get($.TRADER.DROPDOWN.COUNTRY)
    .should('be.visible')
    .click()

  cy.get($.GENERAL.DROPDOWN.SELECT_DROPDOWN_MENU)
    .should('be.visible')
    .contains(country)
    .click()

  cy.get($.TRADER.DROPDOWN.COUNTRY)
    .should('be.visible')
    .and('contain', country)
})

Cypress.Commands.add('assertReceiveAmountInInputAndOrderDetailsMatch', (receiveInputSelector, currencySymbol) => {
  cy.get(receiveInputSelector)
    .should('be.visible')
    .invoke('val')
    .then((receiveInputValue) => {
      cy.assertOrderDetailsReceiveAmount(receiveInputValue, currencySymbol)
    })
})

Cypress.Commands.add('selectCryptoCurrency', (dropdownSelector, { currencySymbol, platform }) => {
  // '[data-test="mobile-buy-receive-currency"]' => '[data-test="mobile-buy-receive-currency'
  const SELECTOR_START = dropdownSelector.slice(0, -2)

  // '[data-test="mobile-buy-receive-currency-BTC:1"]'
  const CURRENCY_OPTION_SELECTOR = `${SELECTOR_START}-${currencySymbol}:${platform.id}"]`

  cy.get(dropdownSelector)
    .should('be.visible')
    .click()

  cy.get(CURRENCY_OPTION_SELECTOR)
    .should('be.visible')
    .click()

  cy.get(dropdownSelector)
    .should('be.visible')
    .and('contain', currencySymbol)
    .and('contain', platform.title)
})

Cypress.Commands.add('assertOrderDetailsReceiveAmount', (amount, currencySymbol) => {
  cy.contains('p', 'You will receive after fee')
    .siblings($.TRADER.BOLD)
    .should('be.visible')
    .and('not.contain', '-')
    .and('contain', `${amount} ${currencySymbol}`)
})

Cypress.Commands.add('assertOrderDetailsTotalAmount', (amount, currencySymbol) => {
  cy.get(`${$.TRADER.TOTAL_PAY} ${$.TRADER.BOLD}`)
    .should('be.visible')
    .and('not.contain', '-')
    .and('contain', `${amount} ${currencySymbol}`)
})

Cypress.Commands.add('getOrderIdAndConfirmPaymentReceived', () => {
  cy.get('tbody tr td')
    .first()
    .should('be.visible')
    .invoke('text')
    .then((orderID) => {
      cy.confirmTraderOrderPaymentReceivedViaAPI(orderID)
    })
})

Cypress.Commands.add('acceptTermsAndConditions', () => {
  cy.get($.GENERAL.MODAL.MODAL)
    .should('be.visible')
    .within(() => {
      cy.contains('.ant-btn', 'I agree')
        .click()
    })
})

Cypress.Commands.add('assertRedirectToVerification', () => {
  cy.urlContains('/account/settings/verification/tier1')

  cy.headerContains('Get verified')

  cy.get($.GENERAL.TEXT)
    .should('be.visible')

  cy.getButtonWithText('Start Verification')
    .should('be.visible')
})

Cypress.Commands.add('assertCorrectPayoutSettingIsSelected', (payoutAddress) => {
  cy.get($.TRADER.SELL.DROPDOWN.PAYOUT_SETTING)
    .click()

  cy.get($.GENERAL.DROPDOWN.SELECT_DROPDOWN_MENU_ITEM_SELECTED)
    .should('contain', payoutAddress)

  cy.get($.TRADER.SELL.DROPDOWN.PAYOUT_SETTING)
    .click()
})

Cypress.Commands.add('assertCopyFieldContains', (copyFieldSelector, value) => {
  cy.get(copyFieldSelector)
    .find('input')
    .invoke('val')
    .should('contain', value)
})

Cypress.Commands.add('getTraderOrdersViaAPI', () => {
  cy.logStep('API: Get trader orders')

  cy.internalRequest({
    url: '/account/trader/orders.json'
  }).then((response) => {
    expect(response.status).to.be.eq(200)
  })
})

Cypress.Commands.add('createBuyOrder', (receiveCurrency) => {
  cy.get($.TRADER.BUY.BTN.SEPA)
    .should('be.visible')

  cy.selectTraderCountry(traderCountry)

  cy.selectTraderCurrency($.TRADER.BUY.DROPDOWN.SELL_CURRENCY, traderCurrencyCode)

  cy.selectCryptoCurrency($.TRADER.BUY.DROPDOWN.RECEIVE_CURRENCY, receiveCurrency)

  cy.get($.TRADER.BUY.BTN.SUBMIT_BUY)
    .should('be.visible')
    .click()

  cy.assertNumberOfExplainMessages(3)

  cy.get($.TRADER.BUY.BTN.SEPA)
    .should('be.visible')
    .click()

  cy.get($.TRADER.BUY.INPUT.PAY_AMOUNT)
    .typeAndAssertValueWithPulseCheck(fiatTargetAmount)

  cy.assertInputIsNotEmpty($.TRADER.BUY.INPUT.RECEIVE_AMOUNT)

  cy.assertOrderDetailsTotalAmount(fiatTargetAmount, traderCurrencySymbol)

  cy.assertReceiveAmountInInputAndOrderDetailsMatch($.TRADER.BUY.INPUT.RECEIVE_AMOUNT, receiveCurrency.currencySymbol)

  cy.intercept('/account/trader/trade/buy')
    .as('submitBuyOrder')

  cy.get($.TRADER.BUY.BTN.SUBMIT_BUY)
    .should('be.visible')
    .click()

  cy.wait('@submitBuyOrder')

  cy.get($.TRADER.BUY.BTN.REPEAT_ORDER)
    .should('be.visible')

  cy.getButtonWithText('Cancel Order') // TODO: add selector
    .should('be.visible')
})
