import $ from '@selectors/index'
import cryptoPayoutCurrencyInfo from '@fixtures/crypto-payout-settings.json'
import fiatPayoutCurrencyInfo from '@fixtures/fiat-payout-settings.json'
import { extractMonthlyLimit } from '@support/trader/limit-helper-functions'
import { generateTrader } from '@entity/entity-helper-functions'
import { traderCountry } from '@fixtures/trader-currency-and-country.json'

describe('Trader - Sell - Tier Limits', () => {
  const { currencySymbol, platform } = cryptoPayoutCurrencyInfo.BTC

  const traderCurrencyCode = 'EUR'
  const traderCurrencySymbol = '€'

  const payAmount = 100

  let traderEmail = ''

  beforeEach(() => {
    const { email, password, countryCode } = generateTrader()
    traderEmail = email

    cy.clearCookies()
    cy.registerAndConfirmEmailViaAPI(email, password, countryCode)
    cy.loginViaAPI(email, password)

    cy.visit('/account/dashboard')
    cy.addAndConfirmFiatPayoutSettingViaAPI(traderCurrencyCode)

    cy.intercept('/account/trader/trade/order_details?*')
      .as('getOrderDetails')
  })

  it('Check if unverified user can create sell order', () => {
    cy.visit('/account/trader/trade#sell')

    cy.wait('@getOrderDetails')

    cy.breadcrumbContains('/Account/Trader/Buy & Sell')

    cy.selectTraderCurrency($.TRADER.SELL.DROPDOWN.RECEIVE_CURRENCY, traderCurrencyCode)

    cy.selectTraderCountry(traderCountry)

    cy.assertCorrectPayoutSettingIsSelected(fiatPayoutCurrencyInfo.IBAN)

    cy.get($.TRADER.SELL.INPUT.RECEIVE_AMOUNT)
      .typeAndAssertValueWithPulseCheck(payAmount)

    cy.wait('@getOrderDetails')

    cy.assertReceiveAmountInInputAndOrderDetailsMatch($.TRADER.SELL.INPUT.RECEIVE_AMOUNT, traderCurrencySymbol)

    cy.get($.TRADER.DIV.UNVERIFIED_DISCLAIMER)
      .should('be.visible')

    cy.get($.TRADER.SELL.BTN.SUBMIT_SELL)
      .click()

    cy.assertRedirectToVerification()
  })

  it('Check if user can create sell order above the monthly limit', () => {
    cy.simplyVerifyUserViaAPI(traderEmail)

    cy.visit('/account/trader/trade#sell')

    cy.wait('@getOrderDetails')

    cy.breadcrumbContains('/Account/Trader/Buy & Sell')

    cy.selectTraderCurrency($.TRADER.SELL.DROPDOWN.RECEIVE_CURRENCY, traderCurrencyCode)

    cy.selectTraderCountry(traderCountry)

    cy.assertCorrectPayoutSettingIsSelected(fiatPayoutCurrencyInfo.IBAN)

    cy.get($.TRADER.DIV.LIMITS_PANEL)
      .click()

    cy.get($.GENERAL.PROGRESS)
      .should('be.visible')

    cy.get($.TRADER.MOBILE.DIV.TRADER_LIMITS)
      .contains('.limit-text', 'monthly limit')
      .should('be.visible')
      .invoke('text')
      .then((monthlyLimitText) => {
        const monthlyLimit = extractMonthlyLimit(monthlyLimitText)

        cy.get($.TRADER.SELL.INPUT.RECEIVE_AMOUNT)
          .typeAndAssertValueWithPulseCheck(monthlyLimit + 1)

        cy.wait('@getOrderDetails')

        cy.assertReceiveAmountInInputAndOrderDetailsMatch($.TRADER.SELL.INPUT.RECEIVE_AMOUNT, traderCurrencySymbol)
      })

    cy.get($.TRADER.SELL.BTN.SUBMIT_SELL)
      .click()

    cy.urlContains('/account/trader/trade')

    cy.breadcrumbContains('/Account/Trader/Buy & Sell')

    cy.get($.TRADER.BTN.SELL)
      .should('have.class', 'active')

    cy.get($.GENERAL.ALERT.ERROR)
      .should('be.visible')
  })

  it('Check if user can create sell order after passing monthly limit', () => {
    cy.simplyVerifyUserViaAPI(traderEmail)

    cy.visit('/account/trader/trade#sell')

    cy.wait('@getOrderDetails')

    cy.breadcrumbContains('/Account/Trader/Buy & Sell')

    cy.get($.TRADER.DIV.LIMITS_PANEL)
      .click()

    cy.get($.GENERAL.PROGRESS)
      .should('be.visible')

    cy.get($.TRADER.MOBILE.DIV.TRADER_LIMITS)
      .contains('.limit-text', 'monthly limit')
      .should('be.visible')
      .invoke('text')
      .then((monthlyLimitText) => {
        const monthlyLimit = extractMonthlyLimit(monthlyLimitText)

        const sellOrderInfo = {
          receiveCurrencySymbol: traderCurrencyCode,
          receiveAmount: monthlyLimit,
          sellCurrencyPlatformId: platform.id,
          sellCurrencySymbol: currencySymbol
        }

        cy.createSellTraderOrderWithReceiveAmountViaAPI(sellOrderInfo)
      })

    cy.visit('/account/dashboard')

    cy.getOrderIdAndConfirmPaymentReceived()

    cy.visit('/account/trader/trade#sell')

    cy.wait('@getOrderDetails')

    cy.breadcrumbContains('/Account/Trader/Buy & Sell')

    cy.selectTraderCurrency($.TRADER.SELL.DROPDOWN.RECEIVE_CURRENCY, traderCurrencyCode)

    cy.selectTraderCountry(traderCountry)

    cy.assertCorrectPayoutSettingIsSelected(fiatPayoutCurrencyInfo.IBAN)

    cy.get($.TRADER.SELL.INPUT.RECEIVE_AMOUNT)
      .typeAndAssertValueWithPulseCheck(payAmount)

    cy.wait('@getOrderDetails')

    cy.assertReceiveAmountInInputAndOrderDetailsMatch($.TRADER.SELL.INPUT.RECEIVE_AMOUNT, traderCurrencySymbol)

    cy.get($.TRADER.SELL.BTN.SUBMIT_SELL)
      .click()

    cy.urlContains('/account/trader/trade')

    cy.breadcrumbContains('/Account/Trader/Buy & Sell')

    cy.get($.TRADER.BTN.SELL)
      .should('have.class', 'active')

    cy.get($.GENERAL.ALERT.ERROR)
      .should('be.visible')
  })
})
