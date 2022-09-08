import $ from '@selectors/index'
import cryptoPayoutCurrencyInfo from '@fixtures/crypto-payout-settings.json'
import { generateBusinessForAPI, generateTrader } from '@entity/entity-helper-functions'
import { traderCountry } from '@fixtures/trader-currency-and-country.json'

describe('Mobile - Trader - Exchange - Create Order As Business', () => {
  const { email, password, countryCode } = generateTrader()

  const business = generateBusinessForAPI()

  const sellCurrency = cryptoPayoutCurrencyInfo.BTC
  const receiveCurrency = cryptoPayoutCurrencyInfo.LTC

  before(() => {
    cy.clearCookies()
    cy.setUpVerifiedPersonalAccount(email, password, countryCode)

    cy.visit('/account/dashboard')
    cy.setUpVerifiedBusinessAccount(business)

    cy.addAndConfirmCryptoPayoutSettingViaAPI(receiveCurrency)
  })

  beforeEach(() => {
    cy.setMobileResolution()

    cy.loginViaAPI(email, password)

    cy.intercept('/account/trader/trade/order_details?*')
      .as('getOrderDetails')
  })

  it(`[Mobile] [Mark as Paid] Create ${sellCurrency.currencySymbol} to ${receiveCurrency.currencySymbol} exchange order as a business`, () => {
    cy.visit('/account/trader/trade#swap')

    cy.wait('@getOrderDetails')

    cy.mobileAssertBusinessAccount(business.businessTitle)

    cy.selectTraderCountry(traderCountry)

    cy.get($.TRADER.BTN.EXCHANGE)
      .should('have.class', 'active')

    cy.get($.TRADER.EXCHANGE.BTN.SUBMIT_EXCHANGE)
      .click()

    cy.mobileAssertExchangeOrderPreviewIsVisible()

    cy.get($.TRADER.EXCHANGE.BTN.SUBMIT_EXCHANGE)
      .click()

    cy.assertNumberOfExplainMessages(2)

    cy.selectCryptoCurrency($.TRADER.MOBILE.EXCHANGE.DROPDOWN.SELL_CURRENCY, sellCurrency)

    cy.selectCryptoCurrency($.TRADER.MOBILE.EXCHANGE.DROPDOWN.RECEIVE_CURRENCY, receiveCurrency)

    cy.get($.TRADER.EXCHANGE.INPUT.SELL_AMOUNT)
      .typeAndAssertValue(sellCurrency.amount)

    cy.wait('@getOrderDetails')

    cy.mobileClickReceiveAmountLabelToShowOrderDetails()

    cy.assertOrderDetailsTotalAmount(sellCurrency.amount, sellCurrency.currencySymbol)

    cy.mobileAssertReceiveAmountInInputAndOrderDetailsMatch($.TRADER.EXCHANGE.INPUT.RECEIVE_AMOUNT, receiveCurrency.currencySymbol)

    cy.get($.TRADER.EXCHANGE.BTN.SUBMIT_EXCHANGE)
      .click()

    cy.mobileAssertExchangeOrderPreviewIsVisible()

    cy.get($.TRADER.EXCHANGE.BTN.SUBMIT_EXCHANGE)
      .click()

    cy.urlContains('/invoice')

    cy.validateInvoice({ currency: sellCurrency.currencySymbol })

    cy.get('.invoice-header')
      .should('contain', `${sellCurrency.amount} ${sellCurrency.currencySymbol}`)
      .and('contain', sellCurrency.platform.title)

    cy.get('.ant-input-prefix')
      .first()
      .should('contain', sellCurrency.currencySymbol)

    cy.get('[data-test="invoice-amount-input"]')
      .should('have.value', sellCurrency.amount)

    cy.get('[data-test="button-mark-as-paid"]')
      .click()

    cy.get('#invoice-paid h2')
      .should('contain', 'Paid and Confirmed')

    cy.get('.invoice-header')
      .should('contain', `${sellCurrency.amount} ${sellCurrency.currencySymbol}`)
      .and('contain', sellCurrency.platform.title)

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
      .and('contain', 'Swap')
      .and('contain', `${sellCurrency.amount} ${sellCurrency.currencySymbol}`)
  })
})
