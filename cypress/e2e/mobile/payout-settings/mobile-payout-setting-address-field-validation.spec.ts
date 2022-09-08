import $ from '@selectors/index'
import cryptoPayoutCurrencyInfo from '@fixtures/crypto-payout-settings.json'
import { generateTrader } from '@entity/entity-helper-functions'

describe('Mobile - Payout Settings - Crypto Address Field Validation', () => {
  const { email, password, countryCode } = generateTrader()

  const { BTC, LTC, USDT } = cryptoPayoutCurrencyInfo

  before(() => {
    cy.clearCookies()
    cy.setUpVerifiedPersonalAccount(email, password, countryCode)
  })

  beforeEach(() => {
    cy.setMobileResolution()
  })

  it('[Mobile] Enter invalid payout address', () => {
    cy.loginViaAPI(email, password)

    cy.visit(`/account/payout_settings/new/${BTC.currencySymbol}`)

    cy.get($.PAYOUT_SETTINGS.CRYPTO.DROPDOWN.CURRENCY_NETWORK)
      .click()

    cy.contains(`${$.GENERAL.DROPDOWN.SELECT_DROPDOWN_MENU_ITEM}:visible`, BTC.platform.title)
      .should('be.visible')
      .click()

    cy.get($.PAYOUT_SETTINGS.CRYPTO.INPUT.TITLE)
      .typeAndAssertValue(BTC.payoutSettingTitle)

    cy.get($.PAYOUT_SETTINGS.CRYPTO.INPUT.ADDRESS)
      .typeAndAssertValue('invalid')

    cy.get($.PAYOUT_SETTINGS.BTN.SUBMIT)
      .click()

    cy.get($.PAYOUT_SETTINGS.CRYPTO.INPUT.ADDRESS)
      .parent()
      .siblings('.ant-form-explain')
      .should('contain', 'is not valid')
  })

  it('[Mobile] Check address field whitespace validation', () => {
    cy.loginViaAPI(email, password)

    cy.visit(`/account/payout_settings/new/${BTC.currencySymbol}`)

    cy.get($.PAYOUT_SETTINGS.CRYPTO.DROPDOWN.CURRENCY_NETWORK)
      .click()

    cy.contains(`${$.GENERAL.DROPDOWN.SELECT_DROPDOWN_MENU_ITEM}:visible`, BTC.platform.title)
      .should('be.visible')
      .click()

    cy.get($.PAYOUT_SETTINGS.CRYPTO.INPUT.TITLE)
      .typeAndAssertValue(BTC.payoutSettingTitle)

    cy.get($.PAYOUT_SETTINGS.CRYPTO.INPUT.ADDRESS)
      .typeAndAssertValue('   ')

    cy.get($.PAYOUT_SETTINGS.BTN.SUBMIT)
      .click()

    cy.get($.PAYOUT_SETTINGS.CRYPTO.INPUT.ADDRESS)
      .parent()
      .siblings('.ant-form-explain')
      .should('contain', 'can\'t be blank')
  })

  const enterAddressOfAnotherCurrency = (firstCurrency, secondCurrency) => {
    it(`[Mobile] Enter ${secondCurrency.currencySymbol} address into ${firstCurrency.currencySymbol} payout setting`, () => {
      cy.loginViaAPI(email, password)

      cy.visit(`/account/payout_settings/new/${firstCurrency.currencySymbol}`)

      cy.get($.PAYOUT_SETTINGS.CRYPTO.DROPDOWN.CURRENCY_NETWORK)
        .click()

      cy.contains(`${$.GENERAL.DROPDOWN.SELECT_DROPDOWN_MENU_ITEM}:visible`, firstCurrency.platform.title)
        .should('be.visible')
        .click()

      cy.get($.PAYOUT_SETTINGS.CRYPTO.INPUT.TITLE)
        .typeAndAssertValue(firstCurrency.payoutSettingTitle)

      cy.get($.PAYOUT_SETTINGS.CRYPTO.INPUT.ADDRESS)
        .typeAndAssertValue(secondCurrency.payoutAddress)

      cy.get($.PAYOUT_SETTINGS.BTN.SUBMIT)
        .click()

      cy.get($.PAYOUT_SETTINGS.CRYPTO.INPUT.ADDRESS)
        .parent()
        .siblings('.ant-form-explain')
        .should('contain', 'is not valid')

      cy.get($.PAYOUT_SETTINGS.BTN.SUBMIT)
        .should('be.disabled')
    })
  }

  enterAddressOfAnotherCurrency(BTC, LTC)
  enterAddressOfAnotherCurrency(LTC, USDT)
  enterAddressOfAnotherCurrency(USDT, BTC)
})
