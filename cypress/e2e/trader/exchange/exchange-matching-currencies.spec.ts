import $ from '@selectors/index'
import cryptoPayoutCurrencyInfo from '@fixtures/crypto-payout-settings.json'
import { generateTrader } from '@entity/entity-helper-functions'
import { traderCountry } from '@fixtures/trader-currency-and-country.json'

describe('Trader - Exchange - Matching currencies', () => {
  const { email, password, countryCode } = generateTrader()

  const currency = cryptoPayoutCurrencyInfo.BTC
  const { currencySymbol, amount } = currency

  before(() => {
    cy.clearCookies()
    cy.setUpVerifiedPersonalAccount(email, password, countryCode)

    cy.visit('/account/dashboard')
    cy.addAndConfirmCryptoPayoutSettingViaAPI(currency)
  })

  beforeEach(() => {
    cy.loginViaAPI(email, password)

    cy.intercept('/account/trader/trade/order_details?*')
      .as('getOrderDetails')
  })

  it(`Select matching ${currencySymbol} sell & receive currencies`, () => {
    cy.visit('/account/trader/trade#swap')

    cy.wait('@getOrderDetails')

    cy.breadcrumbContains('/Account/Trader/Buy & Sell')

    cy.selectTraderCountry(traderCountry)

    cy.get($.TRADER.BTN.EXCHANGE)
      .should('have.class', 'active')

    cy.selectCryptoCurrency($.TRADER.EXCHANGE.DROPDOWN.SELL_CURRENCY, currency)

    cy.selectCryptoCurrency($.TRADER.EXCHANGE.DROPDOWN.RECEIVE_CURRENCY, currency)

    cy.get($.TRADER.EXCHANGE.INPUT.SELL_AMOUNT)
      .typeAndAssertValueWithPulseCheck(amount)

    cy.wait('@getOrderDetails')

    cy.assertOrderDetailsTotalAmount(amount, currencySymbol)

    cy.assertReceiveAmountInInputAndOrderDetailsMatch($.TRADER.EXCHANGE.INPUT.RECEIVE_AMOUNT, currencySymbol)

    cy.get($.TRADER.EXCHANGE.BTN.SUBMIT_EXCHANGE)
      .click()

    cy.get($.TRADER.EXCHANGE.DROPDOWN.RECEIVE_CURRENCY)
      .parent()
      .parent()
      .siblings('.ant-form-explain')
      .should('contain', 'can\'t match sell currency')
  })
})
