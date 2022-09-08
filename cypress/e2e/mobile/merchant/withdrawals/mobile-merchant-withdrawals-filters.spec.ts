import $ from '@selectors/index'
import cryptoPayoutCurrencyInfo from '@fixtures/crypto-payout-settings.json'
import { cryptoCurrencySymbol, cryptoMaxAmount } from '@fixtures/crypto-currency-info.json'
import { fiatCurrencyCode, fiatMaxAmount } from '@fixtures/fiat-currency-info.json'
import { generateBusinessForAPI, generateTrader } from '@entity/entity-helper-functions'

describe('Mobile - Merchant - Withdrawals - Filters', () => {
  const { email, password, countryCode } = generateTrader()

  const business = generateBusinessForAPI()

  const receiveCryptoCurrency = cryptoPayoutCurrencyInfo.BTC

  before(() => {
    cy.clearCookies()
    cy.setUpVerifiedPersonalAccount(email, password, countryCode)

    cy.visit('/account/dashboard')
    cy.setUpVerifiedBusinessAccount(business)

    cy.addAndConfirmFiatPayoutSettingViaAPI()
    cy.addAndConfirmCryptoPayoutSettingViaAPI(receiveCryptoCurrency)

    cy.createApiAppViaAPI()
      .then((response) => {
        const AUTH_TOKEN = response.body.api_app.auth_token

        cy.createOrderViaApiApp(AUTH_TOKEN, fiatMaxAmount, fiatCurrencyCode, fiatCurrencyCode)
          .markApiAppOrderAsPaid(cryptoCurrencySymbol)

        cy.createOrderViaApiApp(AUTH_TOKEN, cryptoMaxAmount, cryptoCurrencySymbol, cryptoCurrencySymbol)
          .markApiAppOrderAsPaid(cryptoCurrencySymbol)

        cy.visit('/account/dashboard')
        cy.createWithdrawalViaAPI(fiatCurrencyCode)
        cy.createWithdrawalViaAPI(cryptoCurrencySymbol)
      })
  })

  beforeEach(() => {
    cy.setMobileResolution()

    cy.loginViaAPI(email, password)
  })

  it('[Mobile] Check "Withdrawal ID" filter', () => {
    cy.visit('/account/withdrawals')

    cy.get('tbody tr')
      .should('have.length', 2)

    cy.getMerchantWithdrawalsViaAPI()
      .then((response) => {
        const withdrawalID = response.body.data[0].id.toString()

        cy.get($.MERCHANT.WITHDRAWALS.INPUT.WITHDRAWAL_ID)
          .should('be.visible')
          .typeAndAssertValue(withdrawalID)

        cy.get($.MERCHANT.WITHDRAWALS.BTN.APPLY_FILTERS)
          .should('be.visible')
          .click()

        cy.get('tbody tr')
          .should('have.length', 1)
          .find('td')
          .first()
          .invoke('text')
          .should('equal', withdrawalID)
      })

    cy.get($.MERCHANT.WITHDRAWALS.INPUT.WITHDRAWAL_ID)
      .should('be.visible')
      .typeAndAssertValue('0')

    cy.get($.MERCHANT.WITHDRAWALS.BTN.APPLY_FILTERS)
      .should('be.visible')
      .click()

    cy.assertEmptyTableState()
  })

  it('[Mobile] Check "Payout Setting" filter', () => {
    cy.visit('/account/withdrawals')

    cy.get('tbody tr')
      .should('have.length', 2)

    cy.get($.MERCHANT.WITHDRAWALS.INPUT.PAYOUT_SETTING)
      .should('be.visible')
      .typeAndAssertValue(cryptoCurrencySymbol)

    cy.get($.MERCHANT.WITHDRAWALS.BTN.APPLY_FILTERS)
      .should('be.visible')
      .click()

    cy.get('tbody tr')
      .should('have.length', 1)
      .find('td')
      .eq(3)
      .should('contain', cryptoCurrencySymbol)

    cy.get($.MERCHANT.WITHDRAWALS.INPUT.PAYOUT_SETTING)
      .should('be.visible')
      .typeAndAssertValue('null')

    cy.get($.MERCHANT.WITHDRAWALS.BTN.APPLY_FILTERS)
      .should('be.visible')
      .click()

    cy.assertEmptyTableState()
  })

  it('[Mobile] Check "Status" filter', () => {
    cy.visit('/account/withdrawals')

    cy.get('tbody tr')
      .should('have.length', 2)
      .each((tableRow) => {
        cy.wrap(tableRow)
          .find('td')
          .eq(1)
          .should('contain', 'Pending')
      })

    cy.get($.GENERAL.ICON.FILTER)
      .eq(0)
      .click()

    cy.get($.GENERAL.DROPDOWN.DROPDOWN)
      .should('be.visible')
      .within(() => {
        cy.contains($.GENERAL.DROPDOWN.DROPDOWN_MENU_ITEM, 'Canceled')
          .find($.GENERAL.CHECKBOX_INPUT)
          .click()
          .should('be.checked')

        cy.contains('a', 'OK')
          .click()
      })

    cy.assertEmptyTableState()

    cy.get($.GENERAL.ICON.FILTER)
      .should('be.visible')
      .eq(0)
      .click()

    cy.get($.GENERAL.DROPDOWN.DROPDOWN)
      .should('be.visible')
      .within(() => {
        cy.contains($.GENERAL.DROPDOWN.DROPDOWN_MENU_ITEM, 'Canceled')
          .find($.GENERAL.CHECKBOX_INPUT)
          .click()
          .should('not.be.checked')

        cy.contains($.GENERAL.DROPDOWN.DROPDOWN_MENU_ITEM, 'Pending')
          .find($.GENERAL.CHECKBOX_INPUT)
          .click()
          .should('be.checked')

        cy.contains('a', 'OK')
          .click()
      })

    cy.get('tbody tr')
      .should('have.length', 2)

    cy.get($.GENERAL.ICON.FILTER)
      .should('be.visible')
      .eq(0)
      .click()

    cy.get($.GENERAL.DROPDOWN.DROPDOWN)
      .should('be.visible')
      .within(() => {
        cy.contains($.GENERAL.DROPDOWN.DROPDOWN_MENU_ITEM, 'Pending')
          .find($.GENERAL.CHECKBOX_INPUT)
          .click()
          .should('not.be.checked')

        cy.contains($.GENERAL.DROPDOWN.DROPDOWN_MENU_ITEM, 'Completed')
          .find($.GENERAL.CHECKBOX_INPUT)
          .click()
          .should('be.checked')

        cy.contains('a', 'OK')
          .click()
      })

    cy.assertEmptyTableState()

    cy.get($.GENERAL.ICON.FILTER)
      .should('be.visible')
      .eq(0)
      .click()

    cy.get($.GENERAL.DROPDOWN.DROPDOWN)
      .should('be.visible')
      .within(() => {
        cy.contains('a', 'Reset')
          .click()
      })

    cy.get('tbody tr')
      .should('have.length', 2)
  })

  it('[Mobile] Check "Date" filter', () => {
    cy.visit('/account/withdrawals')

    cy.get('tbody tr')
      .should('have.length', 2)

    cy.get($.GENERAL.ICON.FILTER)
      .should('be.visible')
      .eq(1)
      .click()

    cy.get($.GENERAL.CALENDAR.PICKER)
      .should('be.visible')
      .click()

    cy.get($.GENERAL.CALENDAR.PREVIOUS_MONTH)
      .should('be.visible')
      .click()

    // chooses start date
    cy.get($.GENERAL.CALENDAR.TABLE_BODY)
      .should('be.visible')
      .find('td')
      .eq(0)
      .click()

    // chooses end date
    cy.get($.GENERAL.CALENDAR.TABLE_BODY)
      .should('be.visible')
      .find('td')
      .eq(6)
      .click()

    cy.assertEmptyTableState()

    cy.get($.GENERAL.ICON.FILTER)
      .should('be.visible')
      .eq(1)
      .click()

    cy.get($.GENERAL.CALENDAR.PICKER)
      .should('be.visible')
      .click()

    cy.get($.GENERAL.CALENDAR.NEXT_MONTH)
      .should('be.visible')
      .click()

    // chooses start date
    cy.get($.GENERAL.CALENDAR.TODAY)
      .should('be.visible')
      .click()

    // chooses end date
    cy.get($.GENERAL.CALENDAR.TODAY)
      .should('be.visible')
      .click()

    cy.get('tbody tr')
      .should('have.length', 2)
  })

  after(() => {
    cy.deleteAllApiApps()
  })
})
