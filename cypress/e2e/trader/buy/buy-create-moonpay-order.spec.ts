import $ from '@selectors/index'
import cryptoPayoutCurrencyInfo from '@fixtures/crypto-payout-settings.json'
import { generateTrader } from '@entity/entity-helper-functions'
import { traderCountry, traderCurrencyCode, traderCurrencySymbol } from '@fixtures/trader-currency-and-country.json'

describe('Trader - Buy - Moonpay', () => {
  const { email, password, countryCode } = generateTrader()

  const orderPayAmount = '100.0'

  before(() => {
    cy.clearCookies()
    cy.registerAndConfirmEmailViaAPI(email, password, countryCode)
    cy.loginViaAPI(email, password)
  })

  for (const currency in cryptoPayoutCurrencyInfo) {
    const { currencySymbol, payoutAddress } = cryptoPayoutCurrencyInfo[currency]

    it(`Create buy ${currencySymbol} order with Moonpay`, { defaultCommandTimeout: 15000 }, () => {
      cy.loginViaAPI(email, password)

      cy.visit('/account/dashboard')

      cy.addAndConfirmCryptoPayoutSettingViaAPI(cryptoPayoutCurrencyInfo[currency])

      cy.visit('/account/trader/trade#buy')

      cy.get($.TRADER.DIV.PAYMENT_METHODS)
        .should('be.visible')

      cy.breadcrumbContains('/Account/Trader/Buy & Sell')

      cy.selectTraderCurrency($.TRADER.BUY.DROPDOWN.SELL_CURRENCY, traderCurrencyCode)

      cy.selectTraderCountry(traderCountry)

      cy.selectCryptoCurrency($.TRADER.BUY.DROPDOWN.RECEIVE_CURRENCY, cryptoPayoutCurrencyInfo[currency])

      cy.get($.TRADER.DIV.UNVERIFIED_DISCLAIMER)
        .should('be.visible')

      cy.get($.TRADER.BUY.BTN.SUBMIT_BUY)
        .should('contain', 'Continue to verification')

      cy.get($.TRADER.BUY.BTN.MOONPAY)
        .click()

      cy.get($.TRADER.DIV.UNVERIFIED_DISCLAIMER)
        .should('not.exist')

      cy.get($.TRADER.BUY.BTN.SUBMIT_BUY)
        .should('contain', 'Continue')

      cy.get($.TRADER.BUY.INPUT.PAY_AMOUNT)
        .typeAndAssertValueWithPulseCheck(orderPayAmount)

      cy.get($.TRADER.CHECKBOX.AUTO_REDEEM)
        .should('have.class', 'ant-switch-checked')
        .click()
        .should('have.class', 'ant-switch-checked')

      cy.assertCorrectPayoutSettingIsSelected(payoutAddress)

      cy.assertOrderDetailsTotalAmount(orderPayAmount, traderCurrencySymbol)

      cy.assertReceiveAmountInInputAndOrderDetailsMatch($.TRADER.BUY.INPUT.RECEIVE_AMOUNT, currencySymbol)

      cy.get($.TRADER.BUY.BTN.SUBMIT_BUY)
        .click()

      if (currencySymbol === Object.keys(cryptoPayoutCurrencyInfo)[0]) {
        cy.acceptTermsAndConditions()
      }

      cy.urlContains('moonpay')

      cy.get('h1', { timeout: 20000 })
        .should('be.visible')

      cy.get('input')
        .should('be.visible')

      cy.get('button[type="submit"]')
        .should('be.visible')
    })
  }
})
