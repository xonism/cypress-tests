import $ from '@selectors/index'
import cryptoPayoutCurrencyInfo from '@fixtures/crypto-payout-settings.json'
import { generateTrader } from '@entity/entity-helper-functions'

describe('Mobile - Payout Settings - Functionalities', () => {
  const { email, password, countryCode } = generateTrader()

  const currency = cryptoPayoutCurrencyInfo.BTC
  const { currencySymbol, payoutAddress, platform, payoutSettingTitle } = currency

  before(() => {
    cy.clearCookies()
    cy.setUpVerifiedPersonalAccount(email, password, countryCode)

    cy.visit('/account/dashboard')
    cy.addCryptoPayoutSettingViaAPI(currency)
  })

  beforeEach(() => {
    cy.setMobileResolution()
  })

  it('[Mobile] Check "Expand" button functionality', () => {
    cy.loginViaAPI(email, password)

    cy.visit('/account/payout_settings')

    cy.breadcrumbContains('/Account/Payout Settings')

    cy.get('tbody tr')
      .first()
      .find($.GENERAL.TABLE.ROW_EXPAND_ICON)
      .click()

    cy.get($.GENERAL.TABLE.EXPANDED_ROW)
      .first()
      .should('contain', payoutAddress)
      .and('contain', platform.title)
  })

  it('[Mobile] Check "Confirm" button functionality', () => {
    cy.loginViaAPI(email, password)

    cy.visit('/account/payout_settings')

    cy.breadcrumbContains('/Account/Payout Settings')

    cy.get('.status-tag-unconfirmed')
      .siblings('a')
      .click()

    cy.urlContains('/account/payout_settings/')

    cy.breadcrumbContains('/Account/Payout Settings/')

    cy.headerContains(payoutSettingTitle)

    cy.get($.PAYOUT_SETTINGS.CONFIRMATION.INPUT.TITLE)
      .invoke('val')
      .should('contain', payoutSettingTitle)

    cy.get($.PAYOUT_SETTINGS.CONFIRMATION.INPUT.CONFIRMATION_CODE)
      .should('be.enabled')
  })

  it('[Mobile] Check "Delete" button functionality', () => {
    cy.loginViaAPI(email, password)

    cy.visit('/account/payout_settings')

    cy.breadcrumbContains('/Account/Payout Settings')

    cy.get($.GENERAL.ICON.DELETE)
      .parent('button')
      .click()

    cy.get($.GENERAL.POPOVER)
      .contains('button[type="button"]', 'No')
      .click()

    cy.get('tbody tr')
      .first()
      .should('contain', payoutSettingTitle)
      .and('contain', currencySymbol)
      .and('contain', platform.title)

    cy.get($.GENERAL.ICON.DELETE)
      .parent('button')
      .click()

    cy.get($.GENERAL.POPOVER)
      .contains('button[type="button"]', 'Yes')
      .click()

    cy.get('tbody tr')
      .first()
      .should('not.exist')
  })
})
