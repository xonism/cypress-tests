import $ from '@selectors/index'
import cryptoPayoutCurrencyInfo from '@fixtures/crypto-payout-settings.json'
import { extractMonthlyLimit } from '@support/trader/limit-helper-functions'
import { generateTrader } from '@entity/entity-helper-functions'
import { traderCountry } from '@fixtures/trader-currency-and-country.json'

describe('Mobile - Trader - Exchange - Tier Limits', () => {
  const traderCurrencyCode = 'EUR'

  const sellCurrency = cryptoPayoutCurrencyInfo.BTC
  const receiveCurrency = cryptoPayoutCurrencyInfo.LTC

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

  it('[Mobile] Check if unverified user can create exchange order', () => {
    cy.visit('/account/trader/trade#swap')

    cy.wait('@getOrderDetails')

    cy.breadcrumbContains('/Account/Trader/Buy & Sell')

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

    cy.assertRedirectToVerification()
  })

  it('[Mobile] Check if user can create exchange order above the monthly limit', () => {
    cy.simplyVerifyUserViaAPI(traderEmail)

    cy.visit('/account/trader/trade#swap')

    cy.wait('@getOrderDetails')

    cy.breadcrumbContains('/Account/Trader/Buy & Sell')

    cy.get($.TRADER.MOBILE.BTN.ACCOUNT_LIMITS)
      .click()

    cy.get($.GENERAL.PROGRESS)
      .should('be.visible')

    cy.get($.TRADER.MOBILE.DIV.TRADER_LIMITS)
      .contains('.limit-text', `${traderCurrencyCode} monthly limit used`)
      .should('be.visible')
      .invoke('text')
      .then((swapLimitText) => {
        const swapLimit = extractMonthlyLimit(swapLimitText)
        const higherThanSwapLimit = String(swapLimit + 1)

        cy.get($.GENERAL.MODAL.CLOSE)
          .click()

        cy.get($.TRADER.BTN.BUY)
          .click()

        cy.selectTraderCountry(traderCountry)

        cy.selectTraderCurrency($.TRADER.MOBILE.BUY.DROPDOWN.SELL_CURRENCY, traderCurrencyCode)

        cy.selectCryptoCurrency($.TRADER.MOBILE.BUY.DROPDOWN.RECEIVE_CURRENCY, sellCurrency)

        cy.get($.TRADER.BUY.INPUT.PAY_AMOUNT)
          .typeAndAssertValue(higherThanSwapLimit)

        cy.get($.TRADER.BUY.INPUT.RECEIVE_AMOUNT)
          .should('not.have.value', '')
          .invoke('val')
          .then((limitValue: string) => {
            cy.get($.TRADER.BTN.EXCHANGE)
              .click()

            cy.wait('@getOrderDetails')

            cy.selectCryptoCurrency($.TRADER.MOBILE.EXCHANGE.DROPDOWN.SELL_CURRENCY, sellCurrency)

            cy.selectCryptoCurrency($.TRADER.MOBILE.EXCHANGE.DROPDOWN.RECEIVE_CURRENCY, receiveCurrency)

            cy.get($.TRADER.EXCHANGE.INPUT.SELL_AMOUNT)
              .typeAndAssertValue(limitValue)

            cy.wait('@getOrderDetails')

            cy.mobileClickReceiveAmountLabelToShowOrderDetails()

            cy.assertOrderDetailsTotalAmount(limitValue, sellCurrency.currencySymbol)
          })
      })

    cy.mobileAssertReceiveAmountInInputAndOrderDetailsMatch($.TRADER.EXCHANGE.INPUT.RECEIVE_AMOUNT, receiveCurrency.currencySymbol)

    cy.get($.TRADER.EXCHANGE.BTN.SUBMIT_EXCHANGE)
      .click()

    cy.mobileAssertExchangeOrderPreviewIsVisible()

    cy.get($.TRADER.EXCHANGE.BTN.SUBMIT_EXCHANGE)
      .click()

    cy.urlContains('/account/trader/trade')

    cy.breadcrumbContains('/Account/Trader/Buy & Sell')

    cy.get($.TRADER.BTN.EXCHANGE)
      .should('have.class', 'active')

    cy.get($.GENERAL.ALERT.ERROR)
      .should('be.visible')
  })

  it('[Mobile] Check if user can create exchange order after passing monthly limit', () => {
    cy.simplyVerifyUserViaAPI(traderEmail)

    cy.visit('/account/trader/trade#swap')

    cy.wait('@getOrderDetails')

    cy.breadcrumbContains('/Account/Trader/Buy & Sell')

    cy.get($.TRADER.MOBILE.BTN.ACCOUNT_LIMITS)
      .click()

    cy.get($.GENERAL.PROGRESS)
      .should('be.visible')

    cy.get($.TRADER.MOBILE.DIV.TRADER_LIMITS)
      .contains('.limit-text', `${traderCurrencyCode} monthly limit used`)
      .should('be.visible')
      .invoke('text')
      .then((swapLimitText) => {
        const swapLimit = extractMonthlyLimit(swapLimitText)

        cy.get($.GENERAL.MODAL.CLOSE)
          .click()

        cy.get($.TRADER.BTN.BUY)
          .click()

        cy.selectTraderCountry(traderCountry)

        cy.selectTraderCurrency($.TRADER.MOBILE.BUY.DROPDOWN.SELL_CURRENCY, traderCurrencyCode)

        cy.selectCryptoCurrency($.TRADER.MOBILE.BUY.DROPDOWN.RECEIVE_CURRENCY, sellCurrency)

        cy.mobileSelectPaymentMethod($.TRADER.BUY.BTN.SEPA)

        cy.get($.TRADER.BUY.INPUT.PAY_AMOUNT)
          .typeAndAssertValue(swapLimit)

        cy.wait('@getOrderDetails')

        cy.get($.TRADER.BUY.INPUT.RECEIVE_AMOUNT)
          .should('not.have.value', '')
          .invoke('val')
          .then((limitValue: string) => {
            const exchangeOrderInfo = {
              receiveCurrencyPlatformId: receiveCurrency.platform.id,
              receiveCurrencySymbol: receiveCurrency.currencySymbol,
              sellAmount: limitValue,
              sellCurrencyPlatformId: sellCurrency.platform.id,
              sellCurrencySymbol: sellCurrency.currencySymbol
            }

            cy.createExchangeTraderOrderViaAPI(exchangeOrderInfo)
          })
      })

    cy.get($.TRADER.BTN.EXCHANGE)
      .click()

    cy.wait('@getOrderDetails')

    cy.breadcrumbContains('/Account/Trader/Buy & Sell')

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

    cy.urlContains('/account/trader/trade')

    cy.breadcrumbContains('/Account/Trader/Buy & Sell')

    cy.get($.TRADER.BTN.EXCHANGE)
      .should('have.class', 'active')

    cy.get($.GENERAL.ALERT.ERROR)
      .should('be.visible')
  })
})
