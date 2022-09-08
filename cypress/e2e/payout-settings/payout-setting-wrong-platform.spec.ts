import $ from '@selectors/index'
import { generateTrader } from '@entity/entity-helper-functions'

describe('Payout Settings - Wrong Platform', () => {
  const { email, password, countryCode } = generateTrader()

  const currencySymbol = 'BUSD'
  const currencyTitle = 'Binance USD'
  const payoutSettingTitle = `${currencySymbol} Address`
  const wrongPlatformName = 'Binance Chain (BEP2)'
  const payoutAddress = '0xe0e92035077c39594793e61802a350347c320cf2' // for Ethereum platform

  before(() => {
    cy.clearCookies()
    cy.setUpVerifiedPersonalAccount(email, password, countryCode)
  })

  beforeEach(() => {
    cy.loginViaAPI(email, password)
  })

  it(`Check if user is able to create ${currencySymbol} payout setting with wrong platform`, () => {
    cy.visit(`/account/payout_settings/new/${currencySymbol}`)

    cy.breadcrumbContains(`/Account/Payout Settings/${currencyTitle}`)

    cy.headerContains(currencyTitle)

    cy.get($.PAYOUT_SETTINGS.CRYPTO.DROPDOWN.CURRENCY_NETWORK)
      .click()

    cy.contains(`${$.GENERAL.DROPDOWN.SELECT_DROPDOWN_MENU_ITEM}:visible`, wrongPlatformName)
      .should('be.visible')
      .click()

    cy.get($.PAYOUT_SETTINGS.CRYPTO.DROPDOWN.CURRENCY_NETWORK)
      .should('contain', wrongPlatformName)

    cy.get($.PAYOUT_SETTINGS.CRYPTO.INPUT.TITLE)
      .typeAndAssertValue(payoutSettingTitle)

    cy.get($.PAYOUT_SETTINGS.CRYPTO.INPUT.ADDRESS)
      .typeAndAssertValue(payoutAddress)

    cy.get($.PAYOUT_SETTINGS.BTN.SUBMIT)
      .click()

    cy.urlContains(`/account/payout_settings/new/${currencySymbol}`)

    cy.breadcrumbContains(`/Account/Payout Settings/${currencyTitle}`)

    cy.getExplainMessageUnderInputField($.PAYOUT_SETTINGS.CRYPTO.INPUT.ADDRESS)
      .should('contain', 'is not valid. Entered a Ethereum network address')
  })
})
