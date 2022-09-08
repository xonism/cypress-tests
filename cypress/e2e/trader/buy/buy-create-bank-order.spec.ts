import $ from '@selectors/index'
import cryptoPayoutCurrencyInfo from '@fixtures/crypto-payout-settings.json'
import { fiatTargetAmount } from '@fixtures/fiat-currency-info.json'
import { generateTrader } from '@entity/entity-helper-functions'
import { traderCurrencyCode, traderCurrencySymbol } from '@fixtures/trader-currency-and-country.json'

describe('Trader - Buy - Easy Bank Transfer', () => {
  const { email, password, countryCode } = generateTrader()

  const traderCountry = 'Lithuania'
  const bankName = 'Swedbank'

  before(() => {
    cy.clearCookies()
    cy.setUpVerifiedPersonalAccount(email, password, countryCode)
  })

  for (const currency in cryptoPayoutCurrencyInfo) {
    const receiveCurrency = cryptoPayoutCurrencyInfo[currency]

    it(`Create buy ${receiveCurrency.currencySymbol} order with easy bank transfer`, () => {
      cy.loginViaAPI(email, password)

      cy.visit('/account/dashboard')

      cy.addAndConfirmCryptoPayoutSettingViaAPI(receiveCurrency)

      cy.visit('/account/trader/trade#buy')

      cy.get($.TRADER.BUY.BTN.EASY_BANK_TRANSFER)
        .should('be.visible')

      cy.breadcrumbContains('/Account/Trader/Buy & Sell')

      cy.selectTraderCountry(traderCountry)

      cy.selectTraderCurrency($.TRADER.BUY.DROPDOWN.SELL_CURRENCY, traderCurrencyCode)

      cy.selectCryptoCurrency($.TRADER.BUY.DROPDOWN.RECEIVE_CURRENCY, receiveCurrency)

      cy.get($.TRADER.BUY.BTN.SUBMIT_BUY)
        .should('be.visible')
        .click()

      cy.assertNumberOfExplainMessages(3)

      cy.get($.TRADER.BUY.BTN.EASY_BANK_TRANSFER)
        .should('be.visible')
        .click()

      cy.get($.TRADER.BUY.INPUT.PAY_AMOUNT)
        .typeAndAssertValueWithPulseCheck(fiatTargetAmount)

      cy.assertInputIsNotEmpty($.TRADER.BUY.INPUT.RECEIVE_AMOUNT)

      cy.assertOrderDetailsTotalAmount(fiatTargetAmount, traderCurrencySymbol)

      cy.assertReceiveAmountInInputAndOrderDetailsMatch($.TRADER.BUY.INPUT.RECEIVE_AMOUNT, receiveCurrency.currencySymbol)

      cy.get($.TRADER.BUY.BTN.SUBMIT_BUY)
        .should('be.visible')
        .click()

      cy.intercept('')
        .as('tokenRequest')

      cy.wait('@tokenRequest')
        .then(({ response }) => {
          const receiveAmount: string = response.body.tokenRequest.requestPayload.transferBody.lifetimeAmount

          cy.url()
            .should('contain', 'token.io', { timeout: 20000 })

          cy.get('.BankSelector-country', { timeout: 20000 })
            .should('be.visible')
            .click()

          cy.get('.BankSelector-country-dropdown')
            .contains(traderCountry)
            .click()
            .click()

          cy.get('.TopBanks-item')
            .contains(bankName)
            .click()

          cy.get('.Consent-data')
            .should('be.visible')
            .and('contain', `€${receiveAmount}`)
            .and('contain', 'sarunas@coingate.com')
            .and('contain', bankName)
        })
    })
  }
})
