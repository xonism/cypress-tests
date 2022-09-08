import $ from '@selectors/index'
import cryptoPayoutCurrencyInfo from '@fixtures/crypto-payout-settings.json'
import { extractMonthlyLimit } from '@support/trader/limit-helper-functions'
import { generateTrader } from '@entity/entity-helper-functions'
import { traderCountry } from '@fixtures/trader-currency-and-country.json'

describe('Trader - Buy - Tier Limits', () => {
  const receiveCurrency = cryptoPayoutCurrencyInfo.BTC
  const { currencySymbol, platform } = receiveCurrency

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

    cy.visit('/account/dashboard')
    cy.addAndConfirmCryptoPayoutSettingViaAPI(receiveCurrency)
  })

  it('Check if unverified user can create buy order', () => {
    cy.visit('/account/trader/trade#buy')

    cy.get($.TRADER.DIV.PAYMENT_METHODS)
      .should('be.visible')

    cy.breadcrumbContains('/Account/Trader/Buy & Sell')

    cy.selectTraderCurrency($.TRADER.BUY.DROPDOWN.SELL_CURRENCY, traderCurrencyCode)

    cy.selectTraderCountry(traderCountry)

    cy.selectCryptoCurrency($.TRADER.BUY.DROPDOWN.RECEIVE_CURRENCY, receiveCurrency)

    cy.get($.TRADER.BUY.BTN.SEPA)
      .click()

    cy.get($.TRADER.BUY.INPUT.PAY_AMOUNT)
      .typeAndAssertValueWithPulseCheck(payAmount)

    cy.assertOrderDetailsTotalAmount(payAmount, traderCurrencySymbol)

    cy.assertReceiveAmountInInputAndOrderDetailsMatch($.TRADER.BUY.INPUT.RECEIVE_AMOUNT, currencySymbol)

    cy.get($.TRADER.DIV.UNVERIFIED_DISCLAIMER)
      .should('be.visible')

    cy.get($.TRADER.BUY.BTN.SUBMIT_BUY)
      .click()

    cy.assertRedirectToVerification()
  })

  it('Check if user can create buy order above the monthly limit', () => {
    cy.simplyVerifyUserViaAPI(traderEmail)

    cy.visit('/account/trader/trade#buy')

    cy.get($.TRADER.DIV.PAYMENT_METHODS)
      .should('be.visible')

    cy.breadcrumbContains('/Account/Trader/Buy & Sell')

    cy.selectTraderCurrency($.TRADER.BUY.DROPDOWN.SELL_CURRENCY, traderCurrencyCode)

    cy.selectTraderCountry(traderCountry)

    cy.selectCryptoCurrency($.TRADER.BUY.DROPDOWN.RECEIVE_CURRENCY, receiveCurrency)

    cy.get($.TRADER.BUY.BTN.SEPA)
      .click()

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

        cy.get($.TRADER.BUY.INPUT.PAY_AMOUNT)
          .typeAndAssertValueWithPulseCheck(monthlyLimit + 1)

        cy.assertOrderDetailsTotalAmount(monthlyLimit + 1, traderCurrencySymbol)
      })

    cy.assertReceiveAmountInInputAndOrderDetailsMatch($.TRADER.BUY.INPUT.RECEIVE_AMOUNT, currencySymbol)

    cy.get($.TRADER.BUY.BTN.SUBMIT_BUY)
      .click()

    cy.urlContains('/account/trader/trade')

    cy.breadcrumbContains('/Account/Trader/Buy & Sell')

    cy.get($.TRADER.BTN.BUY)
      .should('have.class', 'active')

    cy.get($.GENERAL.ALERT.ERROR)
      .should('be.visible')
  })

  it('Check if user can create buy order after passing monthly limit', () => {
    cy.simplyVerifyUserViaAPI(traderEmail)

    cy.visit('/account/trader/trade#buy')

    cy.get($.TRADER.DIV.PAYMENT_METHODS)
      .should('be.visible')

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

        const buyOrderInfo = {
          receiveCurrencyPlatformID: platform.id,
          receiveCurrencySymbol: currencySymbol,
          sellAmount: monthlyLimit,
          sellCurrencySymbol: traderCurrencyCode,
        }

        cy.createBuyTraderOrderViaAPI(buyOrderInfo)
          .then((response) => {
            const orderID = response.body.id

            cy.confirmTraderOrderPaymentReceivedViaAPI(orderID)
          })
      })

    cy.visit('/account/trader/trade#buy')

    cy.breadcrumbContains('/Account/Trader/Buy & Sell')

    cy.selectTraderCurrency($.TRADER.BUY.DROPDOWN.SELL_CURRENCY, traderCurrencyCode)

    cy.selectTraderCountry(traderCountry)

    cy.selectCryptoCurrency($.TRADER.BUY.DROPDOWN.RECEIVE_CURRENCY, receiveCurrency)

    cy.get($.TRADER.BUY.BTN.SEPA)
      .click()

    cy.get($.TRADER.BUY.INPUT.PAY_AMOUNT)
      .typeAndAssertValueWithPulseCheck(payAmount)

    cy.assertOrderDetailsTotalAmount(payAmount, traderCurrencySymbol)

    cy.assertReceiveAmountInInputAndOrderDetailsMatch($.TRADER.BUY.INPUT.RECEIVE_AMOUNT, currencySymbol)

    cy.get($.TRADER.BUY.BTN.SUBMIT_BUY)
      .click()

    cy.urlContains('/account/trader/trade')

    cy.breadcrumbContains('/Account/Trader/Buy & Sell')

    cy.get($.TRADER.BTN.BUY)
      .should('have.class', 'active')

    cy.get($.GENERAL.ALERT.ERROR)
      .should('be.visible')
  })
})
