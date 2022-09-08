import $ from '@selectors/index'
import { accountHolderName, bankName, IBAN, SWIFT } from '@fixtures/fiat-payout-settings.json'
import { cryptoCurrencySymbol } from '@fixtures/crypto-currency-info.json'
import { fiatCurrencyCode, fiatMaxAmount } from '@fixtures/fiat-currency-info.json'
import { generateBusinessForAPI, generateTrader } from '@entity/entity-helper-functions'
import { getSelectorWithoutLastTwoSymbols } from '@support/helper-functions'
import { getStartDateInISO } from '@support/merchant/billing/billing-helper-functions'

describe('Merchant - Withdrawals - Fiat', () => {
  const { email, password, countryCode } = generateTrader()

  const business = generateBusinessForAPI()

  const PAYOUT_SETTING_SELECTOR_START = getSelectorWithoutLastTwoSymbols($.MERCHANT.WITHDRAWALS.DROPDOWN.PAYOUT_SETTING)
  const WITHDRAW_BUTTON_SELECTOR_START = getSelectorWithoutLastTwoSymbols($.MERCHANT.WITHDRAWALS.BTN.WITHDRAW)

  // '[data-test="select-payout-setting-BTC"]'
  const PAYOUT_SETTING_DROPDOWN_SELECTOR = `${PAYOUT_SETTING_SELECTOR_START}-${fiatCurrencyCode}"]`

  // '[data-test="button-withdraw-BTC"]'
  const WITHDRAW_BUTTON_SELECTOR = `${WITHDRAW_BUTTON_SELECTOR_START}-${fiatCurrencyCode}"]`

  before(() => {
    cy.clearCookies()
    cy.setUpVerifiedPersonalAccount(email, password, countryCode)

    cy.visit('/account/dashboard')
    cy.setUpVerifiedBusinessAccount(business)

    cy.addAndConfirmFiatPayoutSettingViaAPI()
  })

  beforeEach(() => {
    cy.loginViaAPI(email, password)

    cy.visit('/account/dashboard')

    cy.createApiAppViaAPI()
      .then((response) => {
        const AUTH_TOKEN = response.body.api_app.auth_token

        cy.createOrderViaApiApp(AUTH_TOKEN, fiatMaxAmount, fiatCurrencyCode, fiatCurrencyCode)
          .visitApiAppPaymentURL()
      })

    cy.markOrderAsPaidInInvoice(cryptoCurrencySymbol)
  })

  it('Withdraw fiat currency', () => {
    cy.visit('/account/withdrawals#payout-balances')

    cy.breadcrumbContains('/Account/Merchant/Withdrawals')

    cy.getMerchantPayoutBalancesViaAPI()
      .then((response) => {
        const fiatBalanceAmount = response.body.payout_balances.find((balance) => balance.currency.iso_symbol === fiatCurrencyCode).payout_sum

        cy.get(WITHDRAW_BUTTON_SELECTOR)
          .should('be.visible')
          .and('contain', `Withdraw ${fiatBalanceAmount} ${fiatCurrencyCode}`)
          .click()

        cy.getExplainMessageUnderInputField(PAYOUT_SETTING_DROPDOWN_SELECTOR)
          .should('contain', 'Payout setting is required')

        cy.get(PAYOUT_SETTING_DROPDOWN_SELECTOR)
          .should('be.visible')
          .click()

        cy.contains($.GENERAL.DROPDOWN.SELECT_DROPDOWN_MENU_ITEM, `${bankName}, ${IBAN}`)
          .should('be.visible')
          .click()

        cy.get(WITHDRAW_BUTTON_SELECTOR)
          .should('be.visible')
          .click()

        cy.get($.GENERAL.MODAL.MODAL)
          .within(() => {
            cy.get($.GENERAL.MODAL.CONFIRM_TITLE)
              .should('be.visible')
              .and('contain', 'Withdrawal Confirmation')

            cy.get($.GENERAL.MODAL.CONFIRM_CONTENT)
              .should('be.visible')
              .and('contain', fiatBalanceAmount)
              .and('contain', fiatCurrencyCode)
              .and('contain', bankName)
              .and('contain', IBAN)

            cy.getButtonWithText('OK')
              .should('be.visible')
              .click()
          })
      })

    cy.get($.GENERAL.DESCRIPTIONS.DESCRIPTIONS)
      .should('be.visible')

    cy.getMerchantWithdrawalsViaAPI()
      .then((response) => {
        const latestWithdrawal = response.body.data[0]
        const withdrawalID = latestWithdrawal.id
        const withdrawalAmount = latestWithdrawal.amount

        cy.urlContains(`/account/withdrawals/${withdrawalID}`)

        cy.breadcrumbContains(`/Account/Merchant/Withdrawals/Withdrawal #${withdrawalID}`)

        cy.headerContains(`Withdrawal #${withdrawalID}`)

        cy.getTableRow(0)
          .within(() => {
            cy.assertTableHeaderCellContains(0, 'Withdrawal ID')
            cy.assertTableHeaderCellContains(1, 'Status')
            cy.assertTableHeaderCellContains(2, 'Created')
          })

        cy.getTableRow(1)
          .within(() => {
            cy.assertTableDataCellContains(0, `${withdrawalID}`)
            cy.assertTableDataCellContains(1, 'pending')
            cy.assertTableDataCellContains(2, getStartDateInISO().split('T')[0])
          })

        cy.getTableRow(2)
          .within(() => {
            cy.assertTableHeaderCellContains(0, 'CoinGate Withdrawal Fee')
            cy.assertTableHeaderCellContains(1, 'Outgoing Fee')
            cy.assertTableHeaderCellContains(2, 'Total Fee')
          })

        cy.getMerchantWithdrawalViaAPI(withdrawalID)
          .then((response) => {
            const withdrawalFee = response.body.feeAmount
            const outgoingFee = response.body.outgoingFee
            const totalFee = response.body.totalFeeAmount
            const amountAfterFee = response.body.amountAfterFee

            cy.getTableRow(3)
              .within(() => {
                cy.assertTableDataCellContains(0, `${withdrawalFee} ${fiatCurrencyCode}`)
                cy.assertTableDataCellContains(1, `${outgoingFee} ${fiatCurrencyCode}`)
                cy.assertTableDataCellContains(2, `${totalFee} ${fiatCurrencyCode}`)
              })

            cy.getTableRow(4)
              .within(() => {
                cy.assertTableHeaderCellContains(0, 'Amount (before fee)')
                cy.assertTableHeaderCellContains(1, 'Amount (after fee)')
                cy.assertTableHeaderCellContains(2, 'Payout to')
              })

            cy.getTableRow(5)
              .within(() => {
                cy.assertTableDataCellContains(0, `${withdrawalAmount} ${fiatCurrencyCode}`)
                cy.assertTableDataCellContains(1, `${amountAfterFee} ${fiatCurrencyCode}`)
                cy.assertTableDataCellContains(2, `${bankName}, ${SWIFT}, ${IBAN}, ${accountHolderName}`)
              })
          })
      })

    cy.assertTicketFormIsDisplayed()
  })

  after(() => {
    cy.deleteAllApiApps()
  })
})
