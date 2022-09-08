import $ from '@selectors/index'
import cryptoPayoutCurrencyInfo from '@fixtures/crypto-payout-settings.json'
import { cryptoCurrencySymbol } from '@fixtures/crypto-currency-info.json'
import { fiatCurrencyCode, fiatMaxAmount } from '@fixtures/fiat-currency-info.json'
import { generateBusinessForAPI, generateTrader } from '@entity/entity-helper-functions'
import { getSelectorWithoutLastTwoSymbols } from '@support/helper-functions'
import { getStartDateInISO } from '@support/merchant/billing/billing-helper-functions'

describe('Merchant - Withdrawals - Crypto', () => {
  const { email, password, countryCode } = generateTrader()

  const business = generateBusinessForAPI()

  const receiveCurrency = cryptoPayoutCurrencyInfo.BTC
  const { payoutAddress, platform, payoutSettingTitle } = receiveCurrency

  const PAYOUT_SETTING_SELECTOR_START = getSelectorWithoutLastTwoSymbols($.MERCHANT.WITHDRAWALS.DROPDOWN.PAYOUT_SETTING)
  const WITHDRAW_BUTTON_SELECTOR_START = getSelectorWithoutLastTwoSymbols($.MERCHANT.WITHDRAWALS.BTN.WITHDRAW)

  // '[data-test="select-payout-setting-BTC"]'
  const PAYOUT_SETTING_DROPDOWN_SELECTOR = `${PAYOUT_SETTING_SELECTOR_START}-${cryptoCurrencySymbol}"]`

  // '[data-test="button-withdraw-BTC"]'
  const WITHDRAW_BUTTON_SELECTOR = `${WITHDRAW_BUTTON_SELECTOR_START}-${cryptoCurrencySymbol}"]`

  before(() => {
    cy.clearCookies()
    cy.setUpVerifiedPersonalAccount(email, password, countryCode)

    cy.visit('/account/dashboard')
    cy.setUpVerifiedBusinessAccount(business)

    cy.addAndConfirmCryptoPayoutSettingViaAPI(receiveCurrency)
  })

  beforeEach(() => {
    cy.loginViaAPI(email, password)

    cy.visit('/account/dashboard')

    cy.createApiAppViaAPI()
      .then((response) => {
        const AUTH_TOKEN = response.body.api_app.auth_token

        cy.createOrderViaApiApp(AUTH_TOKEN, fiatMaxAmount, fiatCurrencyCode, cryptoCurrencySymbol)
          .visitApiAppPaymentURL()
      })

    cy.markOrderAsPaidInInvoice(cryptoCurrencySymbol)
  })

  it('Withdraw crypto currency', () => {
    cy.visit('/account/withdrawals#payout-balances')

    cy.breadcrumbContains('/Account/Merchant/Withdrawals')

    cy.get(WITHDRAW_BUTTON_SELECTOR)
      .should('be.visible')
      .click()

    cy.getExplainMessageUnderInputField(PAYOUT_SETTING_DROPDOWN_SELECTOR)
      .should('contain', 'Payout setting is required')

    cy.get(PAYOUT_SETTING_DROPDOWN_SELECTOR)
      .should('be.visible')
      .click()

    cy.contains($.GENERAL.DROPDOWN.SELECT_DROPDOWN_MENU_ITEM, `${payoutSettingTitle}, ${platform.title}, ${payoutAddress}`)
      .should('be.visible')
      .click()

    cy.get(WITHDRAW_BUTTON_SELECTOR)
      .should('be.visible')
      .click()

    cy.getMerchantPayoutBalancesViaAPI()
      .then((response) => {
        const cryptoBalanceAmount = response.body.payout_balances.find((balance) => balance.currency.iso_symbol === cryptoCurrencySymbol).payout_sum

        cy.get($.GENERAL.MODAL.MODAL)
          .within(() => {
            cy.get($.GENERAL.MODAL.CONFIRM_TITLE)
              .should('be.visible')
              .and('contain', 'Withdrawal Confirmation')

            cy.get($.GENERAL.MODAL.CONFIRM_CONTENT)
              .should('be.visible')
              .and('contain', cryptoBalanceAmount)
              .and('contain', payoutSettingTitle)
              .and('contain', platform.title)
              .and('contain', payoutAddress)

            cy.getButtonWithText('OK')
              .should('be.visible')
              .click()
          })

        cy.get($.GENERAL.DESCRIPTIONS.DESCRIPTIONS)
          .should('be.visible')

        cy.getMerchantWithdrawalsViaAPI()
          .then((response) => {
            const withdrawalID = response.body.data[0].id

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
                const { outgoingFee, totalFeeAmount, amountAfterFee } = response.body
                const withdrawalFee = response.body.feeAmount

                cy.getTableRow(3)
                  .within(() => {
                    cy.assertTableDataCellContains(0, `${withdrawalFee} ${cryptoCurrencySymbol}`)
                    cy.assertTableDataCellContains(1, `${outgoingFee} ${cryptoCurrencySymbol}`)
                    cy.assertTableDataCellContains(2, `${totalFeeAmount} ${cryptoCurrencySymbol}`)
                  })

                cy.getTableRow(4)
                  .within(() => {
                    cy.assertTableHeaderCellContains(0, 'Amount (before fee)')
                    cy.assertTableHeaderCellContains(1, 'Amount (after fee)')
                    cy.assertTableHeaderCellContains(2, 'Payout to')
                  })

                cy.getTableRow(5)
                  .within(() => {
                    cy.assertTableDataCellContains(0, `${cryptoBalanceAmount} ${cryptoCurrencySymbol}`)
                    cy.assertTableDataCellContains(1, `${amountAfterFee} ${cryptoCurrencySymbol}`)
                    cy.assertTableDataCellContains(2, `${payoutSettingTitle}, ${platform.title}, ${payoutAddress}`)
                  })
              })
          })
      })


    cy.assertTicketFormIsDisplayed()
  })

  after(() => {
    cy.deleteAllApiApps()
  })
})
