import $ from '@selectors/index'
import { generatePassword, generateTrader } from '@entity/entity-helper-functions'

describe('Settings - Change Password', () => {
  const { email, password, countryCode } = generateTrader()
  const newPassword = generatePassword()

  before(() => {
    cy.clearCookies()
    cy.registerAndConfirmEmailViaAPI(email, password, countryCode)
  })

  beforeEach(() => {
    cy.loginViaAPI(email, password)
  })

  it('Check "Change password" functionality', () => {
    cy.visit('/account/manage#change-password')

    cy.breadcrumbContains('/Account/User/Manage')

    cy.assertTabIsActive('Change Password')

    cy.getButtonWithText('Change password')
      .should('be.disabled')

    cy.get($.SETTINGS.CHANGE_PASSWORD.INPUT.CURRENT_PASSWORD)
      .typeAndAssertValue(password)

    cy.get($.SETTINGS.CHANGE_PASSWORD.INPUT.NEW_PASSWORD)
      .typeAndAssertValue(newPassword)

    cy.get($.SETTINGS.CHANGE_PASSWORD.INPUT.PASSWORD_CONFIRMATION)
      .typeAndAssertValue(newPassword)

    cy.getButtonWithText('Change password')
      .click()

    cy.urlContains('/login')

    cy.get($.LOGIN.BTN.EMAIL_OPTION)
      .click()

    cy.get($.LOGIN.INPUT.EMAIL)
      .typeAndAssertValue(email)

    cy.get($.LOGIN.INPUT.PASSWORD)
      .typeAndAssertValue(password)

    cy.get($.LOGIN.BTN.SUBMIT)
      .click()

    cy.get($.GENERAL.MESSAGE)
      .should('contain', 'Invalid email or password.')

    cy.get($.LOGIN.INPUT.PASSWORD)
      .typeAndAssertValue(newPassword)

    cy.get($.LOGIN.BTN.SUBMIT)
      .click()

    cy.urlContains('/account/dashboard')

    cy.breadcrumbContains('/Account/Dashboard')
  })
})
