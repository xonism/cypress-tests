import $ from '@selectors/index'
import cryptoPayoutCurrencyInfo from '@fixtures/crypto-payout-settings.json'
import fiatPayoutCurrencyInfo from '@fixtures/fiat-payout-settings.json'
import { generateTrader } from '@entity/entity-helper-functions'

describe('Payout Settings - Limit', () => {
  const { email, password, countryCode } = generateTrader()

  const currency = cryptoPayoutCurrencyInfo.BTC
  const { currencySymbol, currencyTitle, payoutAddress, platform, payoutSettingTitle } = currency

  const IBAN_ARRAY = [
    'LT334783129523155839',
    'LT988852389739117937',
    'LT175816918271727468',
    'LT868868225433717265',
    'LT678362943982688734',
    'LT024176891976869512',
    'LT959625969136212769',
  ]

  beforeEach(() => {
    cy.clearCookies()
    cy.setUpVerifiedPersonalAccount(email, password, countryCode)

    cy.visit('/account/dashboard')
    cy.addCryptoPayoutSettingViaAPI(cryptoPayoutCurrencyInfo.LTC)
    cy.addCryptoPayoutSettingViaAPI(cryptoPayoutCurrencyInfo.USDT)

    cy.addFiatPayoutSettingViaAPI(fiatPayoutCurrencyInfo)

    IBAN_ARRAY.forEach((IBAN) => {
      fiatPayoutCurrencyInfo.IBAN = IBAN
      cy.addFiatPayoutSettingViaAPI(fiatPayoutCurrencyInfo)
    })
  })

  it('Check if only 10 payout settings are allowed', () => {
    cy.visit('/account/payout_settings')
    cy.breadcrumbContains('/Account/Payout Settings')

    cy.get('tbody tr')
      .should('be.visible')
      .and('have.length', 10)

    cy.visit(`/account/payout_settings/new/${currencySymbol}`)
    cy.breadcrumbContains(`/Account/Payout Settings/${currencyTitle}`)
    cy.headerContains(currencyTitle)

    cy.selectPayoutSettingNetwork(platform.title)

    cy.get($.PAYOUT_SETTINGS.CRYPTO.INPUT.TITLE)
      .typeAndAssertValue(payoutSettingTitle)

    cy.get($.PAYOUT_SETTINGS.CRYPTO.INPUT.ADDRESS)
      .typeAndAssertValue(payoutAddress)

    cy.intercept('/account/payout_settings')
      .as('postPayoutSetting')

    cy.get($.PAYOUT_SETTINGS.BTN.SUBMIT)
      .should('be.visible')
      .click()

    cy.get($.GENERAL.ALERT.DESCRIPTION)
      .should('be.visible')
      .and('contain', 'You have reached the maximum limit of added payout options. Please contact support@coingate.com for more information')
  })
})
