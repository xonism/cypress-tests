import $ from '@selectors/index'
import fiatPayoutCurrencyInfo from '@fixtures/fiat-payout-settings.json'
import { generateTrader } from '@entity/entity-helper-functions'
import { traderCurrencyCode } from '@fixtures/trader-currency-and-country.json'

describe('Mobile - Payout Settings - Create Fiat Payout Setting', () => {
  const { email, password, countryCode } = generateTrader()

  const { accountHolderName, bankName, IBAN, SWIFT, payoutSettingTitle } = fiatPayoutCurrencyInfo

  before(() => {
    cy.clearCookies()
    cy.setUpVerifiedPersonalAccount(email, password, countryCode)
  })

  beforeEach(() => {
    cy.setMobileResolution()

    cy.loginViaAPI(email, password)
  })

  it('[Mobile] Create SEPA payout setting', () => {
    cy.visit('/account/payout_settings/sepa')

    cy.breadcrumbContains('/Account/Payout Settings/Bank account')

    cy.headerContains('Bank account')

    cy.get($.PAYOUT_SETTINGS.BTN.SUBMIT)
      .should('be.disabled')

    cy.get($.PAYOUT_SETTINGS.FIAT.INPUT.TITLE)
      .typeAndAssertValue(payoutSettingTitle)

    cy.get($.PAYOUT_SETTINGS.FIAT.INPUT.ACCOUNT_HOLDER)
      .typeAndAssertValue(accountHolderName)

    cy.get($.PAYOUT_SETTINGS.FIAT.INPUT.BANK_NAME)
      .typeAndAssertValue(bankName)

    cy.get($.PAYOUT_SETTINGS.FIAT.INPUT.SWIFT)
      .typeAndAssertValue(SWIFT)

    cy.get($.PAYOUT_SETTINGS.FIAT.INPUT.IBAN)
      .typeAndAssertValue(IBAN)

    cy.intercept('/account/payout_settings')
      .as('postPayoutSetting')

    cy.get($.PAYOUT_SETTINGS.BTN.SUBMIT)
      .should('be.enabled')
      .click()

    cy.wait('@postPayoutSetting')

    cy.getCurrencyPayoutSettingsViaAPI(traderCurrencyCode)
      .then((response) => {
        const payoutSettingID = response.body[0].id

        cy.urlContains(`/account/payout_settings/${payoutSettingID}`)

        cy.breadcrumbContains(`/Account/Payout Settings/#${payoutSettingID}`)
      })

    cy.headerContains(payoutSettingTitle)

    cy.get($.PAYOUT_SETTINGS.CONFIRMATION.INPUT.TITLE)
      .should('have.value', payoutSettingTitle)

    cy.get($.PAYOUT_SETTINGS.CONFIRMATION.INPUT.ACCOUNT_HOLDER)
      .should('have.value', accountHolderName)

    cy.get($.PAYOUT_SETTINGS.CONFIRMATION.INPUT.BANK_NAME)
      .should('have.value', bankName)

    cy.get($.PAYOUT_SETTINGS.CONFIRMATION.INPUT.SWIFT)
      .should('have.value', SWIFT)

    cy.get($.PAYOUT_SETTINGS.CONFIRMATION.INPUT.IBAN)
      .should('have.value', IBAN)

    cy.get($.PAYOUT_SETTINGS.CONFIRMATION.INPUT.CONFIRMATION_CODE)
      .should('be.visible')

    cy.visit('/account/payout_settings')

    cy.breadcrumbContains('/Account/Payout Settings')

    cy.get('tbody tr')
      .first()
      .within(() => {
        cy.assertTableDataCellContains(1, payoutSettingTitle)
        cy.assertTableDataCellContains(2, 'Unconfirmed')
        cy.assertTableDataCellContains(3, 'Sepa')
        cy.assertTableDataCellContains(4, 'No')
      })

    cy.confirmPayoutSettingViaAPI(traderCurrencyCode)

    cy.reload()

    cy.urlContains('/account/payout_settings')

    cy.breadcrumbContains('/Account/Payout Settings')

    cy.get('tbody tr')
      .first()
      .within(() => {
        cy.assertTableDataCellContains(1, payoutSettingTitle)
        cy.assertTableDataCellContains(2, 'Confirmed')
        cy.assertTableDataCellContains(3, 'Sepa')
        cy.assertTableDataCellContains(4, 'No')
      })

    cy.visit('/account/trader/trade#sell')

    cy.breadcrumbContains('/Account/Trader/Buy & Sell')

    cy.get($.TRADER.MOBILE.SELL.DROPDOWN.PAYOUT_SETTING)
      .should('be.visible')
      .and('contain', payoutSettingTitle)
      .and('contain', IBAN)
  })
})
