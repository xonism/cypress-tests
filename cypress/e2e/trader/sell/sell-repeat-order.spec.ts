import $ from '@selectors/index'
import cryptoPayoutCurrencyInfo from '@fixtures/crypto-payout-settings.json'
import fiatPayoutCurrencyInfo from '@fixtures/fiat-payout-settings.json'
import { generateTrader } from '@entity/entity-helper-functions'
import { traderCurrencyCode, traderCurrencySymbol } from '@fixtures/trader-currency-and-country.json'

describe('Trader - Sell - Repeat Order', () => {
  const { email, password, countryCode } = generateTrader()

  const sellCurrency = cryptoPayoutCurrencyInfo.BTC
  const { currencySymbol, amount, platform } = sellCurrency

  const sellOrderInfo = {
    receiveCurrencySymbol: traderCurrencyCode,
    sellAmount: amount,
    sellCurrencyPlatformId: platform.id,
    sellCurrencySymbol: currencySymbol
  }

  const { receiveCurrencySymbol, sellAmount, sellCurrencySymbol } = sellOrderInfo

  before(() => {
    cy.clearCookies()
    cy.setUpVerifiedPersonalAccount(email, password, countryCode)

    cy.visit('/account/dashboard')
    cy.addAndConfirmFiatPayoutSettingViaAPI()

    cy.createSellTraderOrderViaAPI(sellOrderInfo)
  })

  beforeEach(() => {
    cy.loginViaAPI(email, password)
  })

  it('Check "Repeat Sell Order" functionality', () => {
    cy.visit('/account/trader/orders')

    cy.get('tbody tr')
      .first()
      .within(() => {
        cy.contains('td', 'Sell')

        cy.get($.TRADER.BTN.REDO_ORDER)
          .click()
      })

    cy.urlContains('/account/trader/trade')

    cy.contains('.ant-form-item-label', 'Receive Address')
      .should('be.visible') // shows that the page is fully loaded

    cy.breadcrumbContains('/Account/Trader/Buy & Sell')

    cy.get($.TRADER.BTN.SELL)
      .should('have.class', 'active')

    cy.get($.TRADER.SELL.DROPDOWN.SELL_CURRENCY)
      .should('contain', sellCurrencySymbol)
      .and('contain', sellCurrency.platform.title)

    cy.get($.TRADER.SELL.DROPDOWN.RECEIVE_CURRENCY)
      .should('contain', receiveCurrencySymbol)

    cy.assertInputContains($.TRADER.SELL.INPUT.SELL_AMOUNT, sellAmount)

    cy.assertInputIsNotEmpty($.TRADER.SELL.INPUT.RECEIVE_AMOUNT)

    cy.get($.TRADER.SELL.DROPDOWN.PAYOUT_SETTING)
      .should('contain', fiatPayoutCurrencyInfo.IBAN)

    cy.assertOrderDetailsTotalAmount(sellAmount, sellCurrencySymbol)

    cy.assertReceiveAmountInInputAndOrderDetailsMatch($.TRADER.SELL.INPUT.RECEIVE_AMOUNT, traderCurrencySymbol)
  })
})
