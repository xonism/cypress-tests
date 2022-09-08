import $ from '@selectors/index'
import cryptoPayoutCurrencyInfo from '@fixtures/crypto-payout-settings.json'
import { generateTrader } from '@entity/entity-helper-functions'
import { traderCurrencyCode, traderCurrencySymbol } from '@fixtures/trader-currency-and-country.json'

describe('Mobile - Trader - Buy - Repeat Order', () => {
  const { email, password, countryCode } = generateTrader()

  const receiveCurrency = cryptoPayoutCurrencyInfo.BTC
  const { currencySymbol, platform } = receiveCurrency

  const buyOrderInfo = {
    receiveCurrencyPlatformID: platform.id,
    receiveCurrencySymbol: currencySymbol,
    sellAmount: '100.0',
  }

  before(() => {
    cy.clearCookies()
    cy.setUpVerifiedPersonalAccount(email, password, countryCode)

    cy.visit('/account/dashboard')
    cy.addAndConfirmCryptoPayoutSettingViaAPI(receiveCurrency)

    cy.createBuyTraderOrderViaAPI(buyOrderInfo)
  })

  beforeEach(() => {
    cy.setMobileResolution()

    cy.loginViaAPI(email, password)
  })

  it('[Mobile] Check "Repeat Buy Order" functionality', () => {
    cy.visit('/account/trader/orders')

    cy.breadcrumbContains('/Account/Trading/Orders')

    cy.get('tbody tr')
      .first()
      .within(() => {
        cy.contains('td', 'Buy')

        cy.get($.TRADER.BTN.REDO_ORDER)
          .click()
      })

    cy.urlContains('/account/trader/trade')

    cy.get($.TRADER.MOBILE.BUY.DROPDOWN.PAYMENT_METHOD)
      .should('be.visible')

    cy.breadcrumbContains('/Account/Trader/Buy & Sell')

    cy.get($.TRADER.BTN.BUY)
      .should('have.class', 'active')

    cy.get($.TRADER.MOBILE.BUY.DROPDOWN.SELL_CURRENCY)
      .should('contain', traderCurrencyCode)

    cy.get($.TRADER.MOBILE.BUY.DROPDOWN.RECEIVE_CURRENCY)
      .should('contain', buyOrderInfo.receiveCurrencySymbol)
      .and('contain', platform.title)

    cy.assertInputContains($.TRADER.BUY.INPUT.PAY_AMOUNT, buyOrderInfo.sellAmount)

    cy.assertInputIsNotEmpty($.TRADER.BUY.INPUT.RECEIVE_AMOUNT)

    cy.get($.TRADER.MOBILE.BUY.DROPDOWN.PAYMENT_METHOD)
      .should('contain', 'SEPA')

    cy.assertOrderDetailsTotalAmount(buyOrderInfo.sellAmount, traderCurrencySymbol)

    cy.mobileAssertReceiveAmountInInputAndOrderDetailsMatch($.TRADER.BUY.INPUT.RECEIVE_AMOUNT, buyOrderInfo.receiveCurrencySymbol)
  })
})
