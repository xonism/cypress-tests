import $ from '@selectors/index'
import cryptoPayoutCurrencyInfo from '@fixtures/crypto-payout-settings.json'
import fiatPayoutCurrencyInfo from '@fixtures/fiat-payout-settings.json'
import { generateTrader } from '@entity/entity-helper-functions'
import { traderCountry, traderCurrencyCode, traderCurrencySymbol } from '@fixtures/trader-currency-and-country.json'

describe('Mobile - Trader - Sell - SEPA', () => {
  const { email, password, countryCode } = generateTrader()

  const sellCurrency = cryptoPayoutCurrencyInfo.BTC
  const { currencySymbol, amount, platform } = sellCurrency

  before(() => {
    cy.clearCookies()
    cy.setUpVerifiedPersonalAccount(email, password, countryCode)

    cy.visit('/account/dashboard')
    cy.addAndConfirmFiatPayoutSettingViaAPI()
  })

  beforeEach(() => {
    cy.setMobileResolution()

    cy.loginViaAPI(email, password)

    cy.intercept('/account/trader/trade/order_details?*')
      .as('getOrderDetails')
  })

  it(`[Mobile] [Mark as Paid] Create sell ${currencySymbol} order with SEPA`, () => {
    cy.visit('/account/trader/trade#sell')

    cy.get($.TRADER.MOBILE.SELL.DROPDOWN.PAYOUT_SETTING)
      .should('be.visible')

    cy.breadcrumbContains('/Account/Trader/Buy & Sell')

    cy.selectTraderCountry(traderCountry)

    cy.selectTraderCurrency($.TRADER.MOBILE.SELL.DROPDOWN.RECEIVE_CURRENCY, traderCurrencyCode)

    cy.selectCryptoCurrency($.TRADER.MOBILE.SELL.DROPDOWN.SELL_CURRENCY, sellCurrency)

    cy.get($.TRADER.SELL.BTN.SUBMIT_SELL)
      .click()

    cy.mobileAssertOrderPreviewIsVisible()

    cy.get($.TRADER.SELL.BTN.SUBMIT_SELL)
      .click()

    cy.assertNumberOfExplainMessages(2)

    cy.get($.TRADER.SELL.INPUT.SELL_AMOUNT)
      .typeAndAssertValue(amount)

    cy.wait('@getOrderDetails')

    cy.mobileAssertCorrectPayoutSettingIsSelected(fiatPayoutCurrencyInfo.IBAN)

    cy.assertOrderDetailsTotalAmount(amount, currencySymbol)

    cy.mobileAssertReceiveAmountInInputAndOrderDetailsMatch($.TRADER.SELL.INPUT.RECEIVE_AMOUNT, traderCurrencySymbol)

    cy.get($.TRADER.SELL.BTN.SUBMIT_SELL)
      .click()

    cy.mobileAssertOrderPreviewIsVisible()

    cy.get($.TRADER.SELL.BTN.SUBMIT_SELL)
      .click()

    cy.validateInvoice({ currency: currencySymbol })

    cy.get('.invoice-header')
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

    cy.get('tbody tr')
      .first()
      .should('contain', 'Completed')
      .and('contain', 'Sell')
      .and('contain', `${amount} ${currencySymbol}`)
  })

  it(`[Mobile] [Mark as Invalid] Create sell ${currencySymbol} order with SEPA`, () => {
    cy.visit('/account/trader/trade#sell')

    cy.get($.TRADER.MOBILE.SELL.DROPDOWN.PAYOUT_SETTING)
      .should('be.visible')

    cy.breadcrumbContains('/Account/Trader/Buy & Sell')

    cy.selectTraderCountry(traderCountry)

    cy.selectTraderCurrency($.TRADER.MOBILE.SELL.DROPDOWN.RECEIVE_CURRENCY, traderCurrencyCode)

    cy.selectCryptoCurrency($.TRADER.MOBILE.SELL.DROPDOWN.SELL_CURRENCY, sellCurrency)

    cy.get($.TRADER.SELL.BTN.SUBMIT_SELL)
      .click()

    cy.mobileAssertOrderPreviewIsVisible()

    cy.get($.TRADER.SELL.BTN.SUBMIT_SELL)
      .click()

    cy.assertNumberOfExplainMessages(2)

    cy.get($.TRADER.SELL.INPUT.SELL_AMOUNT)
      .typeAndAssertValue(amount)

    cy.wait('@getOrderDetails')

    cy.mobileAssertCorrectPayoutSettingIsSelected(fiatPayoutCurrencyInfo.IBAN)

    cy.assertOrderDetailsTotalAmount(amount, currencySymbol)

    cy.mobileAssertReceiveAmountInInputAndOrderDetailsMatch($.TRADER.SELL.INPUT.RECEIVE_AMOUNT, traderCurrencySymbol)

    cy.get($.TRADER.SELL.BTN.SUBMIT_SELL)
      .click()

    cy.mobileAssertOrderPreviewIsVisible()

    cy.get($.TRADER.SELL.BTN.SUBMIT_SELL)
      .click()

    cy.validateInvoice({ currency: currencySymbol })

    cy.get('.invoice-header')
      .should('contain', `${amount} ${currencySymbol}`)
      .and('contain', platform.title)

    cy.get('.ant-input-prefix')
      .first()
      .should('contain', currencySymbol)

    cy.get('[data-test="invoice-amount-input"]')
      .should('have.value', amount)

    cy.get('[data-test="button-mark-as-invalid"]')
      .click()

    cy.get('#payment-default h2')
      .should('contain', 'This order is invalid')

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
      .should('not.contain', new Date().getFullYear())

    cy.getButtonWithText('Go to Dashboard')
      .click()

    cy.urlContains('/account/dashboard')

    cy.breadcrumbContains('/Account/Dashboard')

    cy.get('tbody tr')
      .first()
      .should('contain', 'Waiting for payment')
      .and('contain', 'Sell')
      .and('contain', `${amount} ${currencySymbol}`)
  })
})
