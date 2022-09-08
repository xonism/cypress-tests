import $ from '@selectors/index'
import cryptoPayoutCurrencyInfo from '@fixtures/crypto-payout-settings.json'
import { generateTrader } from '@entity/entity-helper-functions'

describe('Mobile - Payout Settings - Create Crypto Payout Setting', () => {
  const { email, password, countryCode } = generateTrader()

  const currency = cryptoPayoutCurrencyInfo.BTC
  const { currencyTitle, currencySymbol, payoutAddress, platform, payoutSettingTitle } = currency

  before(() => {
    cy.clearCookies()
    cy.setUpVerifiedPersonalAccount(email, password, countryCode)
  })

  beforeEach(() => {
    cy.setMobileResolution()

    cy.loginViaAPI(email, password)
  })

  it(`[Mobile] Create ${currencySymbol} payout setting`, () => {
    cy.visit(`/account/payout_settings/new/${currencySymbol}`)

    cy.breadcrumbContains(`/Account/Payout Settings/${currencyTitle}`)

    cy.headerContains(currencyTitle)

    cy.get($.PAYOUT_SETTINGS.CRYPTO.DROPDOWN.CURRENCY_NETWORK)
      .click()

    cy.contains(`${$.GENERAL.DROPDOWN.SELECT_DROPDOWN_MENU_ITEM}:visible`, platform.title)
      .should('be.visible')
      .click()

    cy.get($.PAYOUT_SETTINGS.CRYPTO.INPUT.TITLE)
      .typeAndAssertValue(payoutSettingTitle)

    cy.get($.PAYOUT_SETTINGS.CRYPTO.INPUT.ADDRESS)
      .typeAndAssertValue(payoutAddress)

    cy.intercept('/account/payout_settings')
      .as('postPayoutSetting')

    cy.get($.PAYOUT_SETTINGS.BTN.SUBMIT)
      .click()

    cy.wait('@postPayoutSetting')

    cy.getCurrencyPayoutSettingsViaAPI(currencySymbol)
      .then((response) => {
        const payoutSettingID = response.body[0].id

        cy.urlContains(`/account/payout_settings/${payoutSettingID}`)

        cy.breadcrumbContains(`/Account/Payout Settings/#${payoutSettingID}`)
      })

    cy.headerContains(payoutSettingTitle)

    cy.get($.PAYOUT_SETTINGS.CONFIRMATION.INPUT.TITLE)
      .should('have.value', payoutSettingTitle)

    cy.get($.PAYOUT_SETTINGS.CONFIRMATION.INPUT.ADDRESS)
      .should('have.value', payoutAddress)

    cy.get($.PAYOUT_SETTINGS.CONFIRMATION.INPUT.NETWORK)
      .should('have.value', platform.title)

    cy.get($.PAYOUT_SETTINGS.CONFIRMATION.INPUT.CONFIRMATION_CODE)
      .should('be.visible')

    cy.visit('/account/payout_settings')

    cy.breadcrumbContains('/Account/Payout Settings')

    cy.get('tbody tr')
      .first()
      .within(() => {
        cy.assertTableDataCellContains(1, payoutSettingTitle)
        cy.assertTableDataCellContains(2, 'Unconfirmed')
        cy.assertTableDataCellContains(3, `${currencySymbol} (${platform.title})`)
        cy.assertTableDataCellContains(4, 'No')
      })

    cy.confirmPayoutSettingViaAPI(currencySymbol)

    cy.reload()

    cy.urlContains('/account/payout_settings')

    cy.breadcrumbContains('/Account/Payout Settings')

    cy.get('tbody tr')
      .first()
      .within(() => {
        cy.assertTableDataCellContains(1, payoutSettingTitle)
        cy.assertTableDataCellContains(2, 'Confirmed')
        cy.assertTableDataCellContains(3, `${currencySymbol} (${platform.title})`)
        cy.assertTableDataCellContains(4, 'No')
      })
  })
})
