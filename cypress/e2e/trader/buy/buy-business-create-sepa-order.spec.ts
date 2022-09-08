import $ from '@selectors/index'
import cryptoPayoutCurrencyInfo from '@fixtures/crypto-payout-settings.json'
import { bankCode, bankName, companyName, IBAN } from '@fixtures/sepa-payment-details.json'
import { generateBusinessForAPI, generateTrader } from '@entity/entity-helper-functions'
import { traderCountry, traderCurrencyCode, traderCurrencySymbol } from '@fixtures/trader-currency-and-country.json'

describe('Trader - Buy - SEPA - As A Business', () => {
  const { email, password, countryCode } = generateTrader()

  const business = generateBusinessForAPI()

  const receiveCurrency = cryptoPayoutCurrencyInfo.BTC

  const orderPayAmount = '100.0'

  before(() => {
    cy.clearCookies()
    cy.setUpVerifiedPersonalAccount(email, password, countryCode)

    cy.visit('/account/dashboard')
    cy.setUpVerifiedBusinessAccount(business)

    cy.addAndConfirmCryptoPayoutSettingViaAPI(receiveCurrency)
  })

  it(`Create buy ${receiveCurrency.currencySymbol} order with SEPA as a business`, () => {
    cy.visit('/account/dashboard')

    cy.assertBusinessAccount(business.businessTitle)

    cy.visit('/account/trader/trade#buy')

    cy.get($.TRADER.DIV.PAYMENT_METHODS)
      .should('be.visible')

    cy.breadcrumbContains('/Account/Trader/Buy & Sell')

    cy.selectTraderCurrency($.TRADER.BUY.DROPDOWN.SELL_CURRENCY, traderCurrencyCode)

    cy.selectTraderCountry(traderCountry)

    cy.selectCryptoCurrency($.TRADER.BUY.DROPDOWN.RECEIVE_CURRENCY, receiveCurrency)

    cy.get($.TRADER.BUY.BTN.SUBMIT_BUY)
      .click()

    cy.assertNumberOfExplainMessages(3)

    cy.get($.TRADER.BUY.BTN.SEPA)
      .click()

    cy.get($.TRADER.BUY.INPUT.PAY_AMOUNT)
      .typeAndAssertValueWithPulseCheck(orderPayAmount)

    cy.assertOrderDetailsTotalAmount(orderPayAmount, traderCurrencySymbol)

    cy.assertReceiveAmountInInputAndOrderDetailsMatch($.TRADER.BUY.INPUT.RECEIVE_AMOUNT, receiveCurrency.currencySymbol)

    cy.get($.TRADER.BUY.BTN.SUBMIT_BUY)
      .click()

    cy.get($.TRADER.BUY.BTN.REPEAT_ORDER)
      .should('be.visible')

    cy.getButtonWithText('Cancel Order') // TODO: add selector
      .should('be.visible')

    cy.getTraderOrdersViaAPI()
      .then((response) => {
        const traderOrder = response.body.data[0]
        const traderOrderID = traderOrder.id

        cy.urlContains(`/account/trader/orders/${traderOrderID}`)

        cy.breadcrumbContains(`/Account/Trading/Orders/Order #${traderOrderID}`)

        cy.headerContains(`Order #${traderOrderID}`)

        cy.get($.GENERAL.ALERT.MESSAGE)
          .should('be.visible')
          .and('contain', `${orderPayAmount} ${traderCurrencyCode}`)
          .and('contain', `CoinGate Trader Order ${traderOrderID}`)

        cy.contains($.GENERAL.TITLE.ROW, 'Waiting for Payment') // TODO: add selector
          .should('be.visible')

        cy.assertCopyFieldContains($.TRADER.BUY.INPUT.COPY.COMPANY_NAME, companyName)

        cy.assertCopyFieldContains($.TRADER.BUY.INPUT.COPY.BANK_NAME, bankName)

        cy.assertCopyFieldContains($.TRADER.BUY.INPUT.COPY.BANK_CODE, bankCode)

        cy.assertCopyFieldContains($.TRADER.BUY.INPUT.COPY.IBAN, IBAN)

        cy.assertCopyFieldContains($.TRADER.BUY.INPUT.COPY.AMOUNT, `${orderPayAmount} ${traderCurrencyCode}`)

        cy.assertCopyFieldContains($.TRADER.BUY.INPUT.COPY.REASON, `COINGATE TRADER ORDER ${traderOrderID}`)

        cy.getButtonWithText('Cancel Order') // TODO: add selector
          .should('be.visible')
          .click()

        cy.get($.GENERAL.POPOVER)
          .should('be.visible')
          .within(() => {
            cy.getButtonWithText('Yes') // TODO: add selector
              .click()
          })

        cy.urlContains(`/account/trader/orders/${traderOrderID}`)

        cy.breadcrumbContains(`/Account/Trading/Orders/Order #${traderOrderID}`)

        cy.headerContains(`Order #${traderOrderID}`)
      })

    // shows that page has fully loaded
    cy.intercept('/account/service_tickets/get-by-ticketable.json?*')
      .as('getServiceTickets')

    cy.get($.TRADER.BUY.BTN.REPEAT_ORDER)
      .should('be.visible')

    cy.wait('@getServiceTickets')

    cy.get('table') // TODO: add selector
      .should('be.visible')
      .within(() => {
        cy.getTableRow(1)
          .within(() => {
            cy.get('td')
              .eq(2)
              .find($.GENERAL.TAG)
              .should('contain', 'Canceled')
          })
      })
  })
})
