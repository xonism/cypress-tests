import $ from '@selectors/index'
import cryptoPayoutCurrencyInfo from '@fixtures/crypto-payout-settings.json'
import { generateTrader } from '@entity/entity-helper-functions'
import { traderCountry, traderCurrencyCode, traderCurrencySymbol } from '@fixtures/trader-currency-and-country.json'

describe('Mobile - Trader - Buy - Moonpay', () => {
  const { email, password, countryCode } = generateTrader()

  const receiveCurrency = cryptoPayoutCurrencyInfo.BTC
  const { currencySymbol } = receiveCurrency

  const orderPayAmount = '100.0'

  before(() => {
    cy.clearCookies()
    cy.registerAndConfirmEmailViaAPI(email, password, countryCode)
    cy.loginViaAPI(email, password)

    cy.visit('/account/dashboard')
    cy.addAndConfirmCryptoPayoutSettingViaAPI(receiveCurrency)

    cy.setMobileResolution()
  })

  beforeEach(() => {
    cy.setMobileResolution()

    cy.loginViaAPI(email, password)
  })

  it(`[Mobile] Create buy ${currencySymbol} order with Moonpay`, { defaultCommandTimeout: 15000 }, () => {
    cy.visit('/account/trader/trade#buy')

    cy.get($.TRADER.MOBILE.BUY.DROPDOWN.PAYMENT_METHOD)
      .should('be.visible')

    cy.breadcrumbContains('/Account/Trader/Buy & Sell')

    cy.selectTraderCountry(traderCountry)

    cy.selectTraderCurrency($.TRADER.MOBILE.BUY.DROPDOWN.SELL_CURRENCY, traderCurrencyCode)

    cy.selectCryptoCurrency($.TRADER.MOBILE.BUY.DROPDOWN.RECEIVE_CURRENCY, receiveCurrency)

    cy.get($.TRADER.DIV.UNVERIFIED_DISCLAIMER)
      .should('be.visible')

    cy.get($.TRADER.BUY.BTN.SUBMIT_BUY)
      .should('contain', 'Continue to verification')

    cy.mobileSelectPaymentMethod($.TRADER.BUY.BTN.MOONPAY)

    cy.get($.TRADER.DIV.UNVERIFIED_DISCLAIMER)
      .should('not.exist')

    cy.get($.TRADER.BUY.BTN.SUBMIT_BUY)
      .should('contain', 'Preview Buy')

    cy.get($.TRADER.BUY.INPUT.PAY_AMOUNT)
      .typeAndAssertValue(orderPayAmount)

    cy.mobileClickReceiveAmountLabelToShowOrderDetails()

    cy.assertOrderDetailsTotalAmount(orderPayAmount, traderCurrencySymbol)

    cy.mobileAssertReceiveAmountInInputAndOrderDetailsMatch($.TRADER.BUY.INPUT.RECEIVE_AMOUNT, currencySymbol)

    cy.get($.TRADER.BUY.BTN.SUBMIT_BUY)
      .click()

    cy.get($.GENERAL.CHECKBOX_INPUT)
      .click()
      .should('be.checked')

    cy.get($.TRADER.BUY.BTN.SUBMIT_BUY)
      .click()

    cy.urlContains('moonpay')

    cy.get('h1')
      .should('be.visible')

    cy.get('input')
      .should('be.visible')

    cy.get('button[type="submit"]')
      .should('be.visible')
  })
})
