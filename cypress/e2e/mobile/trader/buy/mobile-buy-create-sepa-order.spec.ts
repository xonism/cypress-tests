import $ from '@selectors/index'
import cryptoPayoutCurrencyInfo from '@fixtures/crypto-payout-settings.json'
import { bankCode, bankName, companyName, IBAN } from '@fixtures/sepa-payment-details.json'
import { fiatTargetAmount } from '@fixtures/fiat-currency-info.json'
import { generateTrader } from '@entity/entity-helper-functions'
import { getStartDateInISO } from '@support/merchant/billing/billing-helper-functions'
import { traderCountry, traderCurrencyCode, traderCurrencySymbol } from '@fixtures/trader-currency-and-country.json'

describe('Mobile - Trader - Buy - SEPA', () => {
  const receiveCurrency = cryptoPayoutCurrencyInfo.BTC
  const { currencySymbol } = receiveCurrency

  beforeEach(() => {
    const { email, password, countryCode } = generateTrader()

    cy.clearCookies()
    cy.setUpVerifiedPersonalAccount(email, password, countryCode)

    cy.visit('/account/dashboard')
    cy.addAndConfirmCryptoPayoutSettingViaAPI(receiveCurrency)

    cy.setMobileResolution()

    cy.loginViaAPI(email, password)
  })

  it(`[Mobile] Create buy ${currencySymbol} order with SEPA`, () => {
    cy.visit('/account/trader/trade#buy')

    cy.breadcrumbContains('/Account/Trader/Buy & Sell')

    cy.get($.TRADER.MOBILE.BUY.DROPDOWN.PAYMENT_METHOD)
      .should('be.visible')

    cy.selectTraderCountry(traderCountry)

    cy.selectTraderCurrency($.TRADER.MOBILE.BUY.DROPDOWN.SELL_CURRENCY, traderCurrencyCode)

    cy.selectCryptoCurrency($.TRADER.MOBILE.BUY.DROPDOWN.RECEIVE_CURRENCY, receiveCurrency)

    cy.get($.TRADER.BUY.BTN.SUBMIT_BUY)
      .should('be.visible')
      .click()

    cy.mobileAssertOrderPreviewIsVisible()

    cy.get($.TRADER.BUY.BTN.SUBMIT_BUY)
      .should('be.visible')
      .click()

    cy.assertNumberOfExplainMessages(3)

    cy.get($.TRADER.BUY.INPUT.PAY_AMOUNT)
      .typeAndAssertValue(fiatTargetAmount)

    cy.assertInputIsNotEmpty($.TRADER.BUY.INPUT.RECEIVE_AMOUNT)

    cy.intercept('/account/trader/trade/order_details?*')
      .as('getOrderDetails')

    cy.mobileSelectPaymentMethod($.TRADER.BUY.BTN.SEPA)

    cy.wait('@getOrderDetails')

    cy.assertOrderDetailsTotalAmount(fiatTargetAmount, traderCurrencySymbol)

    cy.mobileAssertReceiveAmountInInputAndOrderDetailsMatch($.TRADER.BUY.INPUT.RECEIVE_AMOUNT, currencySymbol)

    cy.get($.TRADER.BUY.BTN.SUBMIT_BUY)
      .should('be.visible')
      .click()

    cy.mobileAssertOrderPreviewIsVisible()

    cy.get($.TRADER.BUY.BTN.SUBMIT_BUY)
      .should('be.visible')
      .click()

    cy.get($.TRADER.BUY.BTN.REPEAT_ORDER)
      .should('be.visible')

    cy.getButtonWithText('Cancel Order') // TODO: add selector
      .should('be.visible')

    cy.getTraderOrdersViaAPI()
      .then((response) => {
        const traderOrder = response.body.data[0]
        const traderOrderID = traderOrder.id
        const traderOrderReceiveAmount = traderOrder.receive_amount

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

        cy.get('table') // TODO: add selector
          .should('be.visible')
          .within(() => {
            cy.get('tr')
              .should('have.length', 20)

            cy.getTableRow(0)
              .within(() => {
                cy.assertTableHeaderCellContains(0, 'Order ID')
              })

            cy.getTableRow(1)
              .within(() => {
                cy.assertTableDataCellContains(0, traderOrderID)
              })

            cy.getTableRow(2)
              .within(() => {
                cy.assertTableHeaderCellContains(0, 'Category')
              })

            cy.getTableRow(3)
              .within(() => {
                cy.assertTableDataCellContains(0, 'buy')
              })

            cy.getTableRow(4)
              .within(() => {
                cy.assertTableHeaderCellContains(0, 'Status')
              })

            cy.getTableRow(5)
              .within(() => {
                cy.get('td')
                  .eq(0)
                  .find($.GENERAL.TAG)
                  .should('contain', 'Waiting for payment')
              })

            cy.getTraderOrderViaAPI(traderOrderID)
              .then((response) => {
                const traderOrderFeeAmount = Number(response.body.fee_amount)
                const traderOrderOutgoingFeeAmount = Number(response.body.outgoing_fee)

                cy.getTableRow(6)
                  .within(() => {
                    cy.assertTableHeaderCellContains(0, 'CoinGate Fee')
                  })

                cy.getTableRow(7)
                  .within(() => {
                    cy.assertTableDataCellContains(0, `${traderOrderFeeAmount} ${currencySymbol}`)
                  })

                cy.getTableRow(8)
                  .within(() => {
                    cy.assertTableHeaderCellContains(0, 'Outgoing Fee')
                  })

                cy.getTableRow(9)
                  .within(() => {
                    cy.assertTableDataCellContains(0, `${traderOrderOutgoingFeeAmount} ${currencySymbol}`)
                  })

                cy.getTableRow(10)
                  .within(() => {
                    cy.assertTableHeaderCellContains(0, 'Total Fee')
                  })

                cy.getTableRow(11)
                  .within(() => {
                    cy.assertTableDataCellContains(0, `${traderOrderFeeAmount + traderOrderOutgoingFeeAmount} ${currencySymbol}`)
                  })
              })

            cy.getTableRow(12)
              .within(() => {
                cy.assertTableHeaderCellContains(0, 'Receive Amount')
              })

            cy.getTableRow(13)
              .within(() => {
                cy.assertTableDataCellContains(0, `${traderOrderReceiveAmount} ${currencySymbol}`)
              })

            cy.getTableRow(14)
              .within(() => {
                cy.assertTableHeaderCellContains(0, 'Pay amount')
              })

            cy.getTableRow(15)
              .within(() => {
                cy.assertTableDataCellContains(0, `${fiatTargetAmount} ${traderCurrencyCode}`)
              })

            cy.getTableRow(16)
              .within(() => {
                cy.assertTableHeaderCellContains(0, 'Created at')
              })

            cy.getTableRow(17)
              .within(() => {
                cy.assertTableDataCellContains(0, getStartDateInISO().split('T')[0])
              })

            cy.getTableRow(18)
              .within(() => {
                cy.assertTableHeaderCellContains(0, 'Payout to')
              })

            cy.getTableRow(19)
              .within(() => {
                cy.assertTableDataCellContains(0, '-')
              })
          })

        cy.assertTicketFormIsDisplayed()

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
        cy.getTableRow(5)
          .within(() => {
            cy.get('td')
              .eq(0)
              .find($.GENERAL.TAG)
              .should('contain', 'Canceled')
          })
      })
  })
})
