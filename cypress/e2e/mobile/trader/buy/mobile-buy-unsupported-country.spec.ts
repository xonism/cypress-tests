import $ from '@selectors/index'
import cryptoPayoutCurrencyInfo from '@fixtures/crypto-payout-settings.json'
import { generateTrader } from '@entity/entity-helper-functions'
import { traderCurrencyCode } from '@fixtures/trader-currency-and-country.json'

describe('Mobile - Trader - Buy - Unsupported Country', () => {
  const { email, password, countryCode } = generateTrader()

  const traderCountry = 'Botswana'

  const receiveCurrency = cryptoPayoutCurrencyInfo.BTC

  before(() => {
    cy.clearCookies()
    cy.setUpVerifiedPersonalAccount(email, password, countryCode)

    cy.visit('/account/dashboard')
    cy.addAndConfirmCryptoPayoutSettingViaAPI(receiveCurrency)
  })

  beforeEach(() => {
    cy.setMobileResolution()

    cy.loginViaAPI(email, password)
  })

  it(`[Mobile] Choose unsupported country (${traderCountry})`, () => {
    cy.visit('/account/trader/trade#buy')

    cy.get($.TRADER.MOBILE.BUY.DROPDOWN.PAYMENT_METHOD)
      .should('be.visible')

    cy.breadcrumbContains('/Account/Trader/Buy & Sell')

    cy.selectTraderCountry(traderCountry)

    cy.selectTraderCurrency($.TRADER.MOBILE.BUY.DROPDOWN.SELL_CURRENCY, traderCurrencyCode)

    cy.selectCryptoCurrency($.TRADER.MOBILE.BUY.DROPDOWN.RECEIVE_CURRENCY, receiveCurrency)

    cy.get($.TRADER.DIV.ALTERNATIVE_METHODS)
      .should('be.visible')

    cy.get($.TRADER.DIV.PAYMENT_METHODS)
      .should('not.exist')

    cy.get($.TRADER.BUY.BTN.SUBMIT_BUY)
      .should('not.exist')
  })
})
