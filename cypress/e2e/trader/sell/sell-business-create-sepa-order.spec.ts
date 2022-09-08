import $ from '@selectors/index'
import cryptoPayoutCurrencyInfo from '@fixtures/crypto-payout-settings.json'
import fiatPayoutCurrencyInfo from '@fixtures/fiat-payout-settings.json'
import { generateBusinessForAPI, generateTrader } from '@entity/entity-helper-functions'
import { traderCountry, traderCurrencyCode, traderCurrencySymbol } from '@fixtures/trader-currency-and-country.json'

describe('Trader - As A Business - Sell - SEPA', () => {
  const { email, password, countryCode } = generateTrader()

  const business = generateBusinessForAPI()

  const sellCurrency = cryptoPayoutCurrencyInfo.BTC
  const { currencySymbol, amount, platform } = sellCurrency

  before(() => {
    cy.clearCookies()
    cy.setUpVerifiedPersonalAccount(email, password, countryCode)

    cy.visit('/account/dashboard')
    cy.setUpVerifiedBusinessAccount(business)

    cy.addAndConfirmFiatPayoutSettingViaAPI()
  })

  beforeEach(() => {
    cy.loginViaAPI(email, password)

    cy.intercept('/account/trader/trade/order_details?*')
      .as('getOrderDetails')
  })

  it(`[Mark as Paid] Create sell ${currencySymbol} order with SEPA`, () => {
    cy.visit('/account/trader/trade#sell')

    cy.wait('@getOrderDetails')

    cy.breadcrumbContains('/Account/Trader/Buy & Sell')

    cy.assertBusinessAccount(business.businessTitle)

    cy.get($.TRADER.SELL.BTN.SUBMIT_SELL)
      .click()

    cy.assertNumberOfExplainMessages(2)

    cy.selectTraderCurrency($.TRADER.SELL.DROPDOWN.RECEIVE_CURRENCY, traderCurrencyCode)

    cy.selectTraderCountry(traderCountry)

    cy.selectCryptoCurrency($.TRADER.SELL.DROPDOWN.SELL_CURRENCY, sellCurrency)

    cy.assertCorrectPayoutSettingIsSelected(fiatPayoutCurrencyInfo.IBAN)

    cy.get($.TRADER.SELL.INPUT.SELL_AMOUNT)
      .typeAndAssertValueWithPulseCheck(amount)

    cy.wait('@getOrderDetails')

    cy.assertOrderDetailsTotalAmount(amount, currencySymbol)

    cy.assertReceiveAmountInInputAndOrderDetailsMatch($.TRADER.SELL.INPUT.RECEIVE_AMOUNT, traderCurrencySymbol)

    cy.get($.TRADER.SELL.BTN.SUBMIT_SELL)
      .click()

    cy.urlContains('/invoice')

    cy.validateInvoice({ currency: currencySymbol })

    cy.get('.invoice-header')// FIXME: fix these steps after new invoice launch
      .should('contain', `${amount} ${currencySymbol}`)
      .and('contain', platform.title)

    cy.get('.ant-input-prefix')
      .first()
      .should('contain', currencySymbol)

    cy.get('[data-test="invoice-amount-input"]')
      .should('have.value', amount)

    cy.get('[data-test="button-mark-as-paid"]')
      .click()

    cy.get('#invoice-paid h2')
      .should('contain', 'Paid and Confirmed')

    cy.get('.invoice-header')
      .should('contain', `${amount} ${currencySymbol}`)
      .and('contain', platform.title)

    cy.getButtonWithText('Back')
      .click()

    cy.urlContains('/success')

    cy.breadcrumbContains('/Account/Trader/Success')

    cy.contains($.GENERAL.TITLE.TITLE, 'Payment Received')
      .should('be.visible')

    cy.contains('.point', 'Withdrawal Created')
      .should('contain', new Date().getFullYear())

    cy.getButtonWithText('Go to Dashboard')
      .click()

    cy.urlContains('/account/dashboard')

    cy.breadcrumbContains('/Account/Dashboard')

    cy.visit('/account/trader/orders')

    cy.get('tbody tr')
      .first()
      .should('contain', 'Completed')
      .and('contain', 'Sell')
      .and('contain', `${amount} ${currencySymbol}`)
  })
})
