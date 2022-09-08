import $ from '@selectors/index'
import cryptoPayoutCurrencyInfo from '@fixtures/crypto-payout-settings.json'
import { fiatCurrencyCode, fiatMinAmount, fiatTargetAmount } from '@fixtures/fiat-currency-info.json'
import { generateBusinessForAPI, generateEmail, generateTrader } from '@entity/entity-helper-functions'

describe('Merchant - Refunds - Partial Refund', () => {
  const { email, password, countryCode } = generateTrader()

  const business = generateBusinessForAPI()

  const receiveCurrency = cryptoPayoutCurrencyInfo.BTC
  const { currencyTitle, currencySymbol, payoutAddress } = receiveCurrency

  const refundReason = 'Testing partial refund'

  before(() => {
    cy.clearCookies()
    cy.setUpVerifiedPersonalAccount(email, password, countryCode)

    cy.visit('/account/dashboard')
    cy.setUpVerifiedBusinessAccount(business)

    cy.addAndConfirmCryptoPayoutSettingViaAPI(receiveCurrency)

    cy.enableLedgerForMerchantViaAPI()

    cy.createApiAppViaAPI()
      .then((response) => {
        const AUTH_TOKEN = response.body.api_app.auth_token

        cy.createOrderViaApiApp(AUTH_TOKEN, fiatTargetAmount, fiatCurrencyCode, currencySymbol)
          .markApiAppOrderAsPaid(currencySymbol)
      })
  })

  beforeEach(() => {
    cy.loginViaAPI(email, password)
  })

  it('Create partial refund', () => {
    cy.visit('/account/orders')
    cy.breadcrumbContains('/Account/Merchant/Orders')
    cy.headerContains('Merchant Orders')

    cy.get('tbody tr')
      .should('have.length', 1)
      .click()

    cy.getMerchantOrdersViaAPI()
      .then((response) => {
        const orderID = response.body.data[0].id

        cy.urlContains(`/account/orders/${orderID}`)
        cy.breadcrumbContains(`/Account/Merchant/Orders/Order #${orderID}`)
        cy.headerContains(`Order #${orderID}`)

        cy.get($.MERCHANT.REFUNDS.DIV.REFUNDS)
          .should('be.visible')
          .within(() => {
            cy.headerContains('Refunds')
          })

        cy.selectRefundBalance(orderID, receiveCurrency)

        cy.get($.MERCHANT.REFUNDS.INPUT.AMOUNT)
          .typeAndAssertValue(fiatMinAmount)

        cy.assertOriginalPriceCurrencyIsCorrect(fiatCurrencyCode)

        cy.get($.MERCHANT.REFUNDS.INPUT.EMAIL)
          .typeAndAssertValue(generateEmail())

        cy.selectRefundCurrency(receiveCurrency)

        cy.selectRefundNetwork(receiveCurrency)

        cy.get($.MERCHANT.REFUNDS.INPUT.ADDRESS)
          .typeAndAssertValue(payoutAddress)

        cy.get($.MERCHANT.REFUNDS.INPUT.REASON)
          .typeAndAssertValue(refundReason)

        cy.get($.MERCHANT.REFUNDS.BTN.SUBMIT)
          .should('be.visible')
          .click()

        cy.get($.GENERAL.MESSAGE_NOTICE_CONTENT)
          .should('be.visible')
          .and('contain', 'Refund submitted successfully')

        cy.urlContains(`/account/orders/${orderID}`)
        cy.breadcrumbContains(`/Account/Merchant/Orders/Order #${orderID}`)
        cy.headerContains(`Order #${orderID}`)

        cy.getMerchantOrderRefundDataViaAPI(orderID)
          .then((response) => {
            const refund = response.body.refund_info.merchant_refunds[0]
            const refundID = refund.id
            const refundAmount = refund.refund_amount
            const refundDebit = refund.balance_debit
            const refundRequestedBy = refund.requested_by

            cy.get($.MERCHANT.REFUNDS.TABLE.SUBMITTED)
              .should('be.visible')
              .within(() => {
                cy.get('thead')
                  .should('be.visible')
                  .within(() => {
                    cy.get('th')
                      .should('have.length', 10)

                    cy.assertTableHeaderCellContains(0, 'ID')
                    cy.assertTableHeaderCellContains(1, 'Created')
                    cy.assertTableHeaderCellContains(2, 'Status')
                    cy.assertTableHeaderCellContains(3, 'Crypto Address')
                    cy.assertTableHeaderCellContains(4, 'Refund Amount')
                    cy.assertTableHeaderCellContains(5, 'Refund Currency')
                    cy.assertTableHeaderCellContains(6, 'Requested Amount')
                    cy.assertTableHeaderCellContains(7, 'Balance Debit')
                    cy.assertTableHeaderCellContains(8, 'Created By')
                  })

                cy.get('tbody tr')
                  .should('have.length', 1)
                  .and('be.visible')
                  .within(() => {
                    cy.assertTableDataCellContains(0, refundID)

                    cy.assertTableDataCellIsNotEmpty(1)

                    cy.assertTableDataCellContains(2, 'Pending')
                    cy.assertTableDataCellContains(3, payoutAddress)
                    cy.assertTableDataCellContains(4, refundAmount)
                    cy.assertTableDataCellContains(5, `${currencyTitle} (${currencySymbol})`)
                    cy.assertTableDataCellContains(6, `${fiatMinAmount} ${fiatCurrencyCode.toUpperCase()}`)
                    cy.assertTableDataCellContains(7, refundDebit)
                    cy.assertTableDataCellContains(8, refundRequestedBy)
                  })
              })

            cy.visit('/account/refunds')
            cy.breadcrumbContains('/Account/Merchant/Refunds')
            cy.headerContains('Merchant Refunds')

            cy.get($.MERCHANT.REFUNDS.TABLE.MERCHANT_REFUNDS)
              .should('be.visible')
              .within(() => {
                cy.get('tbody tr')
                  .should('be.visible')
                  .and('have.length', 1)
                  .within(() => {
                    cy.assertTableDataCellContains(0, refundID)
                    cy.assertTableDataCellContains(1, orderID)
                    cy.assertTableDataCellContains(2, `${fiatMinAmount} ${fiatCurrencyCode.toUpperCase()}`)
                    cy.assertTableDataCellContains(3, `${refundAmount} ${currencySymbol}`)
                    cy.assertTableDataCellContains(4, refundDebit)
                    cy.assertTableDataCellContains(5, 'Pending')

                    cy.assertTableDataCellIsNotEmpty(6)

                    cy.assertTableDataCellContains(7, 'Details')
                  })

                cy.getTableRow(0)
                  .click()
              })

            cy.urlContains(`/account/refunds/${refundID}`)
            cy.breadcrumbContains(`/Account/Merchant/Refunds/Refund #${refundID}`)
            cy.headerContains(`Refund #${refundID}`)

            cy.contains($.GENERAL.CONTENT_BLOCK, `Refund #${refundID}`)// TODO: add selector
              .should('be.visible')
              .within(() => {
                cy.getMerchantOrderRefundViaAPI(refundID)
                  .then((response) => {
                    const refund = response.body.refund
                    const refundRate = refund.request_refund_rate
                    const refundDebitAmount = refund.balance_debit_amount
                    const refundDebitCurrency = refund.balance_debit_currency
                    const refundDebitRate = refund.refund_balance_debit_rate
                    const ledgerAccountID = refund.ledger_account_id

                    cy.getTableRow(0)
                      .within(() => {
                        cy.assertTableHeaderCellContains(0, 'Order ID')
                        cy.assertTableHeaderCellContains(1, 'Requested Amount')
                        cy.assertTableHeaderCellContains(2, 'Refund Amount')
                      })

                    cy.getTableRow(1)
                      .within(() => {
                        cy.assertTableDataCellContains(0, orderID)
                        cy.assertTableDataCellContains(1, `${fiatMinAmount} ${fiatCurrencyCode.toUpperCase()}`)
                        cy.assertTableDataCellContains(2, `${refundAmount} ${currencySymbol}`)
                      })

                    cy.getTableRow(2)
                      .within(() => {
                        cy.assertTableHeaderCellContains(0, 'Refund Rate')
                        cy.assertTableHeaderCellContains(1, 'Balance Debit')
                        cy.assertTableHeaderCellContains(2, 'Balance Debit Rate')
                      })

                    cy.getTableRow(3)
                      .within(() => {
                        cy.assertTableDataCellContains(0, refundRate)
                        cy.assertTableDataCellContains(1, `${refundDebitAmount} ${refundDebitCurrency}`)
                        cy.assertTableDataCellContains(2, refundDebitRate)
                      })


                    cy.getTableRow(4)
                      .within(() => {
                        cy.assertTableHeaderCellContains(0, 'Address')
                        cy.assertTableHeaderCellContains(1, 'Memo')
                        cy.assertTableHeaderCellContains(2, 'Reason')
                      })

                    cy.getTableRow(5)
                      .within(() => {
                        cy.assertTableDataCellContains(0, payoutAddress)

                        cy.assertTableDataCellIsEmpty(1)

                        cy.assertTableDataCellContains(2, refundReason)
                      })

                    cy.getTableRow(6)
                      .within(() => {
                        cy.assertTableHeaderCellContains(0, 'Balance Account ID')
                        cy.assertTableHeaderCellContains(1, 'Status')
                        cy.assertTableHeaderCellContains(2, 'Created at')
                      })

                    cy.getTableRow(7)
                      .within(() => {
                        cy.assertTableDataCellContains(0, ledgerAccountID)
                        cy.assertTableDataCellContains(1, 'Pending')

                        cy.assertTableDataCellIsNotEmpty(2)
                      })
                  })

                cy.assertTicketFormIsDisplayed()
              })

            cy.contains($.GENERAL.CONTENT_BLOCK, 'Transactions')// TODO: add selector
              .should('be.visible')
              .within(() => {
                cy.get('thead')
                  .within(() => {
                    cy.get('th')
                      .should('have.length', 4)

                    cy.assertTableHeaderCellContains(0, 'TXID')
                    cy.assertTableHeaderCellContains(1, 'Amount')
                    cy.assertTableHeaderCellContains(2, 'Platform')
                    cy.assertTableHeaderCellContains(3, 'Created at')
                  })

                cy.assertEmptyTableState()
              })
          })
      })
  })

  after(() => {
    cy.deleteAllApiApps()
  })
})
