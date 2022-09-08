import $ from '@selectors/index'
import cryptoPayoutCurrencyInfo from '@fixtures/crypto-payout-settings.json'
import { generateTrader } from '@entity/entity-helper-functions'

describe('Mobile - Trader - Exchange - Repeat Order', () => {
  const { email, password, countryCode } = generateTrader()

  const sellCurrency = cryptoPayoutCurrencyInfo.BTC
  const receiveCurrency = cryptoPayoutCurrencyInfo.LTC

  const exchangeOrderInfo = {
    receiveCurrencyPlatformId: receiveCurrency.platform.id,
    receiveCurrencySymbol: receiveCurrency.currencySymbol,
    sellAmount: sellCurrency.amount,
    sellCurrencyPlatformId: sellCurrency.platform.id,
    sellCurrencySymbol: sellCurrency.currencySymbol
  }

  before(() => {
    cy.clearCookies()
    cy.setUpVerifiedPersonalAccount(email, password, countryCode)

    cy.visit('/account/dashboard')
    cy.addAndConfirmCryptoPayoutSettingViaAPI(receiveCurrency)

    cy.createExchangeTraderOrderViaAPI(exchangeOrderInfo)
  })

  beforeEach(() => {
    cy.setMobileResolution()

    cy.loginViaAPI(email, password)
  })

  it('[Mobile] Check "Repeat Exchange Order" functionality', () => {
    cy.visit('/account/trader/orders')

    cy.get('tbody tr')
      .first()
      .within(() => {
        cy.contains('td', 'Swap')

        cy.get($.TRADER.BTN.REDO_ORDER)
          .click()
      })

    cy.urlContains('/account/trader/trade')

    cy.breadcrumbContains('/Account/Trader/Buy & Sell')

    cy.get($.TRADER.BTN.EXCHANGE)
      .should('have.class', 'active')

    cy.get($.TRADER.MOBILE.EXCHANGE.DROPDOWN.SELL_CURRENCY)
      .should('contain', exchangeOrderInfo.sellCurrencySymbol)
      .and('contain', sellCurrency.platform.title)

    cy.get($.TRADER.MOBILE.EXCHANGE.DROPDOWN.RECEIVE_CURRENCY)
      .should('contain', exchangeOrderInfo.receiveCurrencySymbol)
      .and('contain', receiveCurrency.platform.title)

    cy.assertInputContains($.TRADER.EXCHANGE.INPUT.SELL_AMOUNT, exchangeOrderInfo.sellAmount)

    cy.assertInputIsNotEmpty($.TRADER.EXCHANGE.INPUT.RECEIVE_AMOUNT)

    cy.assertOrderDetailsTotalAmount(exchangeOrderInfo.sellAmount, exchangeOrderInfo.sellCurrencySymbol)

    cy.mobileAssertReceiveAmountInInputAndOrderDetailsMatch($.TRADER.EXCHANGE.INPUT.RECEIVE_AMOUNT, exchangeOrderInfo.receiveCurrencySymbol)
  })
})
