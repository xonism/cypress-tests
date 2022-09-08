import $ from '@selectors/index'
import cryptoPayoutCurrencyInfo from '@fixtures/crypto-payout-settings.json'
import { bankCode, bankName, companyName, IBAN } from '@fixtures/sepa-payment-details.json'
import { fiatTargetAmount } from '@fixtures/fiat-currency-info.json'
import { generateBusinessForAPI, generateTrader } from '@entity/entity-helper-functions'
import { traderCountry, traderCurrencyCode, traderCurrencySymbol } from '@fixtures/trader-currency-and-country.json'

describe('Mobile - Trader - Buy - SEPA - As A Business', () => {
  const business = generateBusinessForAPI()

  const receiveCurrency = cryptoPayoutCurrencyInfo.BTC
  const { currencySymbol } = receiveCurrency

  beforeEach(() => {
    const { email, password, countryCode } = generateTrader()

    cy.clearCookies()
    cy.setUpVerifiedPersonalAccount(email, password, countryCode)

    cy.visit('/account/dashboard')
    cy.setUpVerifiedBusinessAccount(business)

    cy.setMobileResolution()

    cy.loginViaAPI(email, password)

    cy.intercept('/account/trader/trade/order_details?*')
      .as('getOrderDetails')
  })

  it(`[Mobile] Create buy ${currencySymbol} order with SEPA as a business`, () => {
    cy.visit('/account/dashboard')

    cy.addAndConfirmCryptoPayoutSettingViaAPI(receiveCurrency)

    cy.visit('/account/trader/trade#buy')

    cy.get($.TRADER.MOBILE.BUY.DROPDOWN.PAYMENT_METHOD)
      .should('be.visible')

    cy.breadcrumbContains('/Account/Trader/Buy & Sell')

    cy.mobileAssertBusinessAccount(business.businessTitle)

    cy.selectTraderCountry(traderCountry)

    cy.selectTraderCurrency($.TRADER.MOBILE.BUY.DROPDOWN.SELL_CURRENCY, traderCurrencyCode)

    cy.selectCryptoCurrency($.TRADER.MOBILE.BUY.DROPDOWN.RECEIVE_CURRENCY, receiveCurrency)

    cy.get($.TRADER.BUY.BTN.SUBMIT_BUY)
      .click()

    cy.mobileAssertOrderPreviewIsVisible()

    cy.get($.TRADER.BUY.BTN.SUBMIT_BUY)
      .click()

    cy.assertNumberOfExplainMessages(3)

    cy.get($.TRADER.BUY.INPUT.PAY_AMOUNT)
      .typeAndAssertValue(fiatTargetAmount)

    cy.assertInputIsNotEmpty($.TRADER.BUY.INPUT.RECEIVE_AMOUNT)

    cy.mobileSelectPaymentMethod($.TRADER.BUY.BTN.SEPA)

    cy.wait('@getOrderDetails')

    cy.assertOrderDetailsTotalAmount(fiatTargetAmount, traderCurrencySymbol)

    cy.mobileAssertReceiveAmountInInputAndOrderDetailsMatch($.TRADER.BUY.INPUT.RECEIVE_AMOUNT, currencySymbol)

    cy.get($.TRADER.BUY.BTN.SUBMIT_BUY)
      .click()

    cy.mobileAssertOrderPreviewIsVisible()

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
          .and('contain', `${fiatTargetAmount} ${traderCurrencyCode}`)
          .and('contain', `CoinGate Trader Order ${traderOrderID}`)

        cy.contains($.GENERAL.TITLE.ROW, 'Waiting for Payment') // TODO: add selector
          .should('be.visible')

        cy.assertCopyFieldContains($.TRADER.BUY.INPUT.COPY.COMPANY_NAME, companyName)

        cy.assertCopyFieldContains($.TRADER.BUY.INPUT.COPY.BANK_NAME, bankName)

        cy.assertCopyFieldContains($.TRADER.BUY.INPUT.COPY.BANK_CODE, bankCode)

        cy.assertCopyFieldContains($.TRADER.BUY.INPUT.COPY.IBAN, IBAN)

        cy.assertCopyFieldContains($.TRADER.BUY.INPUT.COPY.AMOUNT, `${fiatTargetAmount} ${traderCurrencyCode}`)

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
        cy.assertTableDataCellContains(2, 'Canceled')
      })
  })
})
