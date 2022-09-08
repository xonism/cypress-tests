import $ from '@selectors/index'
import cryptoPayoutCurrencyInfo from '@fixtures/crypto-payout-settings.json'
import fiatPayoutCurrencyInfo from '@fixtures/fiat-payout-settings.json'
import { extractMonthlyLimit } from '@support/trader/limit-helper-functions'
import { generateTrader } from '@entity/entity-helper-functions'
import { traderCountry } from '@fixtures/trader-currency-and-country.json'

describe('Mobile - Trader - Sell - Tier Limits', () => {
  const { currencySymbol, platform } = cryptoPayoutCurrencyInfo.BTC

  const traderCurrencyCode = 'EUR'
  const traderCurrencySymbol = '€'

  const payAmount = 50

  let traderEmail = ''

  beforeEach(() => {
    const { email, password, countryCode } = generateTrader()
    traderEmail = email

    cy.clearCookies()
    cy.registerAndConfirmEmailViaAPI(email, password, countryCode)
    cy.loginViaAPI(email, password)

    cy.setMobileResolution()

    cy.visit('/account/dashboard')
    cy.addAndConfirmFiatPayoutSettingViaAPI(traderCurrencyCode)

    cy.intercept('/account/trader/trade/order_details?*')
      .as('getOrderDetails')
  })

  it('[Mobile] Check if unverified user can create sell order', () => {
    cy.visit('/account/trader/trade#sell')

    cy.get($.TRADER.MOBILE.SELL.DROPDOWN.PAYOUT_SETTING)
      .should('be.visible')

    cy.breadcrumbContains('/Account/Trader/Buy & Sell')

    cy.selectTraderCountry(traderCountry)

    cy.selectTraderCurrency($.TRADER.MOBILE.SELL.DROPDOWN.RECEIVE_CURRENCY, traderCurrencyCode)

    cy.get($.TRADER.SELL.INPUT.RECEIVE_AMOUNT)
      .typeAndAssertValue(payAmount)

    cy.wait('@getOrderDetails')

    cy.mobileAssertCorrectPayoutSettingIsSelected(fiatPayoutCurrencyInfo.IBAN)

    cy.get($.TRADER.DIV.UNVERIFIED_DISCLAIMER)
      .should('be.visible')

    cy.get($.TRADER.SELL.BTN.SUBMIT_SELL)
      .click()

    cy.assertRedirectToVerification()
  })

  it('[Mobile] Check if user can create sell order above the monthly limit', () => {
    cy.simplyVerifyUserViaAPI(traderEmail)

    cy.visit('/account/trader/trade#sell')

    cy.get($.TRADER.MOBILE.SELL.DROPDOWN.PAYOUT_SETTING)
      .should('be.visible')

    cy.breadcrumbContains('/Account/Trader/Buy & Sell')

    cy.selectTraderCountry(traderCountry)

    cy.selectTraderCurrency($.TRADER.MOBILE.SELL.DROPDOWN.RECEIVE_CURRENCY, traderCurrencyCode)

    cy.get($.TRADER.MOBILE.BTN.ACCOUNT_LIMITS)
      .click()

    cy.get($.GENERAL.PROGRESS)
      .should('be.visible')

    cy.get($.TRADER.MOBILE.DIV.TRADER_LIMITS)
      .contains('.limit-text', 'monthly limit')
      .should('be.visible')
      .invoke('text')
      .then((monthlyLimitText) => {
        const monthlyLimit = extractMonthlyLimit(monthlyLimitText)

        cy.get($.GENERAL.MODAL.CLOSE)
          .click()

        cy.get($.TRADER.SELL.INPUT.RECEIVE_AMOUNT)
          .typeAndAssertValue(monthlyLimit + 1)

        cy.wait('@getOrderDetails')

        cy.assertInputIsNotEmpty($.TRADER.SELL.INPUT.SELL_AMOUNT)

        cy.wait('@getOrderDetails')

        cy.mobileAssertCorrectPayoutSettingIsSelected(fiatPayoutCurrencyInfo.IBAN)

        cy.mobileAssertReceiveAmountInInputAndOrderDetailsMatch($.TRADER.SELL.INPUT.RECEIVE_AMOUNT, traderCurrencySymbol)
      })

    cy.get($.TRADER.SELL.BTN.SUBMIT_SELL)
      .click()

    cy.mobileAssertOrderPreviewIsVisible()

    cy.get($.TRADER.SELL.BTN.SUBMIT_SELL)
      .click()

    cy.urlContains('/account/trader/trade')

    cy.breadcrumbContains('/Account/Trader/Buy & Sell')

    cy.get($.TRADER.BTN.SELL)
      .should('have.class', 'active')

    cy.get($.GENERAL.ALERT.ERROR)
      .should('be.visible')
  })

  it('[Mobile] Check if user can create sell order after passing monthly limit', () => {
    cy.simplyVerifyUserViaAPI(traderEmail)

    cy.visit('/account/trader/trade')

    cy.get($.TRADER.BTN.SELL)
      .click()

    cy.get($.TRADER.MOBILE.SELL.DROPDOWN.PAYOUT_SETTING)
      .should('be.visible')

    cy.breadcrumbContains('/Account/Trader/Buy & Sell')

    cy.selectTraderCountry(traderCountry)

    cy.selectTraderCurrency($.TRADER.MOBILE.SELL.DROPDOWN.RECEIVE_CURRENCY, traderCurrencyCode)

    cy.get($.TRADER.MOBILE.BTN.ACCOUNT_LIMITS)
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

    cy.visit('/account/trader/trade')

    cy.get($.TRADER.BTN.SELL)
      .click()

    cy.get($.TRADER.MOBILE.SELL.DROPDOWN.PAYOUT_SETTING)
      .should('be.visible')

    cy.breadcrumbContains('/Account/Trader/Buy & Sell')

    cy.selectTraderCountry(traderCountry)

    cy.selectTraderCurrency($.TRADER.MOBILE.SELL.DROPDOWN.RECEIVE_CURRENCY, traderCurrencyCode)

    cy.get($.TRADER.SELL.INPUT.RECEIVE_AMOUNT)
      .typeAndAssertValue(payAmount)

    cy.wait('@getOrderDetails')

    cy.assertInputIsNotEmpty($.TRADER.SELL.INPUT.SELL_AMOUNT)

    cy.wait('@getOrderDetails')

    cy.mobileAssertCorrectPayoutSettingIsSelected(fiatPayoutCurrencyInfo.IBAN)

    cy.mobileAssertReceiveAmountInInputAndOrderDetailsMatch($.TRADER.SELL.INPUT.RECEIVE_AMOUNT, traderCurrencySymbol)

    cy.get($.TRADER.SELL.BTN.SUBMIT_SELL)
      .click()

    cy.mobileAssertOrderPreviewIsVisible()

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
