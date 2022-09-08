import $ from '@selectors/index'
import cryptoPayoutCurrencyInfo from '@fixtures/crypto-payout-settings.json'
import { extractMonthlyLimit } from '@support/trader/limit-helper-functions'
import { generateTrader } from '@entity/entity-helper-functions'
import { traderCountry } from '@fixtures/trader-currency-and-country.json'

describe('Mobile - Trader - Buy - Tier Limits', () => {
  const receiveCurrency = cryptoPayoutCurrencyInfo.BTC
  const { currencySymbol, platform } = receiveCurrency

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

    cy.setMobileResolution()

    cy.visit('/account/dashboard')
    cy.addAndConfirmCryptoPayoutSettingViaAPI(receiveCurrency)

    cy.intercept('/account/trader/trade/order_details?*')
      .as('getOrderDetails')
  })

  it('[Mobile] Check if unverified user can create buy order', () => {
    cy.visit('/account/trader/trade#buy')

    cy.get($.TRADER.MOBILE.BUY.DROPDOWN.PAYMENT_METHOD)
      .should('be.visible')

    cy.breadcrumbContains('/Account/Trader/Buy & Sell')

    cy.selectTraderCountry(traderCountry)

    cy.selectTraderCurrency($.TRADER.MOBILE.BUY.DROPDOWN.SELL_CURRENCY, traderCurrencyCode)

    cy.selectCryptoCurrency($.TRADER.MOBILE.BUY.DROPDOWN.RECEIVE_CURRENCY, receiveCurrency)

    cy.get($.TRADER.BUY.INPUT.PAY_AMOUNT)
      .typeAndAssertValue(payAmount)

    cy.mobileSelectPaymentMethod($.TRADER.BUY.BTN.SEPA)

    cy.wait('@getOrderDetails')

    cy.assertOrderDetailsTotalAmount(payAmount, traderCurrencySymbol)

    cy.get($.TRADER.DIV.UNVERIFIED_DISCLAIMER)
      .should('be.visible')

    cy.get($.TRADER.BUY.BTN.SUBMIT_BUY)
      .click()

    cy.assertRedirectToVerification()
  })

  it('[Mobile] Check if user can create buy order above the monthly limit', () => {
    cy.simplyVerifyUserViaAPI(traderEmail)

    cy.visit('/account/trader/trade#buy')

    cy.get($.TRADER.MOBILE.BUY.DROPDOWN.PAYMENT_METHOD)
      .should('be.visible')

    cy.breadcrumbContains('/Account/Trader/Buy & Sell')

    cy.selectTraderCountry(traderCountry)

    cy.selectTraderCurrency($.TRADER.MOBILE.BUY.DROPDOWN.SELL_CURRENCY, traderCurrencyCode)

    cy.selectCryptoCurrency($.TRADER.MOBILE.BUY.DROPDOWN.RECEIVE_CURRENCY, receiveCurrency)

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

        cy.get($.TRADER.BUY.INPUT.PAY_AMOUNT)
          .typeAndAssertValue(monthlyLimit + 1)

        cy.mobileSelectPaymentMethod($.TRADER.BUY.BTN.SEPA)

        cy.wait('@getOrderDetails')

        cy.assertOrderDetailsTotalAmount(monthlyLimit + 1, traderCurrencySymbol)
      })

    cy.mobileAssertReceiveAmountInInputAndOrderDetailsMatch($.TRADER.BUY.INPUT.RECEIVE_AMOUNT, currencySymbol)

    cy.get($.TRADER.BUY.BTN.SUBMIT_BUY)
      .click()

    cy.mobileAssertOrderPreviewIsVisible()

    cy.get($.TRADER.BUY.BTN.SUBMIT_BUY)
      .click()

    cy.urlContains('/account/trader/trade')

    cy.breadcrumbContains('/Account/Trader/Buy & Sell')

    cy.get($.TRADER.BTN.BUY)
      .should('have.class', 'active')

    cy.get($.GENERAL.ALERT.ERROR)
      .should('be.visible')
  })

  it('[Mobile] Check if user can create buy order after passing monthly limit', () => {
    cy.simplyVerifyUserViaAPI(traderEmail)

    cy.visit('/account/trader/trade#buy')

    cy.get($.TRADER.MOBILE.BUY.DROPDOWN.PAYMENT_METHOD)
      .should('be.visible')

    cy.breadcrumbContains('/Account/Trader/Buy & Sell')

    cy.get($.TRADER.MOBILE.BTN.ACCOUNT_LIMITS)
      .click()

    cy.get($.GENERAL.PROGRESS)
      .should('be.visible')

    cy.get($.TRADER.MOBILE.DIV.TRADER_LIMITS)
      .contains($.TRADER.DIV.LIMIT_TEXT, 'monthly limit')
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

    cy.reload()

    cy.get($.TRADER.MOBILE.BUY.DROPDOWN.PAYMENT_METHOD)
      .should('be.visible')

    cy.breadcrumbContains('/Account/Trader/Buy & Sell')

    cy.selectTraderCountry(traderCountry)

    cy.selectTraderCurrency($.TRADER.MOBILE.BUY.DROPDOWN.SELL_CURRENCY, traderCurrencyCode)

    cy.selectCryptoCurrency($.TRADER.MOBILE.BUY.DROPDOWN.RECEIVE_CURRENCY, receiveCurrency)

    cy.get($.TRADER.BUY.INPUT.PAY_AMOUNT)
      .typeAndAssertValue(payAmount)

    cy.mobileSelectPaymentMethod($.TRADER.BUY.BTN.SEPA)

    cy.wait('@getOrderDetails')

    cy.assertOrderDetailsTotalAmount(payAmount, traderCurrencySymbol)

    cy.mobileAssertReceiveAmountInInputAndOrderDetailsMatch($.TRADER.BUY.INPUT.RECEIVE_AMOUNT, currencySymbol)

    cy.get($.TRADER.BUY.BTN.SUBMIT_BUY)
      .click()

    cy.mobileAssertOrderPreviewIsVisible()

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
