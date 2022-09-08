import $ from '@selectors/index'
import { generateTrader } from '@entity/entity-helper-functions'

describe('User - Log in & Log out', () => {
  const { email, password, countryCode } = generateTrader()

  before(() => {
    cy.clearCookies()
    cy.registerAndConfirmEmailViaAPI(email, password, countryCode)
  })

  it('Log in to account', () => {
    cy.visit('/login')

    cy.formHeaderContains('Login to your account')

    cy.get($.LOGIN.BTN.EMAIL_OPTION)
      .should('be.visible')
      .click()

    cy.get($.LOGIN.BTN.SUBMIT)
      .should('be.visible')
      .click()

    cy.assertNumberOfExplainMessages(2)

    cy.get($.LOGIN.INPUT.EMAIL)
      .should('be.visible')
      .type(email)

    cy.get($.LOGIN.INPUT.PASSWORD)
      .should('be.visible')
      .type(password)

    cy.get($.LOGIN.CHECKBOX.REMEMBER_ME)
      .check()
      .should('be.checked')

    cy.get($.LOGIN.BTN.SUBMIT)
      .click()

    cy.urlContains('/account/dashboard')

    cy.breadcrumbContains('/Account/Dashboard')

    cy.assertMenuItemIsSelected($.MENU.DASHBOARD)
      .should('contain', 'Dashboard')
  })

  it('Log out from account', () => {
    cy.loginViaAPI(email, password)

    cy.visit('/account/dashboard')

    cy.breadcrumbContains('/Account/Dashboard')

    cy.get($.ACCOUNT.HEADER_MENU)
      .should('be.visible')
      .click()

    cy.get($.ACCOUNT.BTN.SIGN_OUT)
      .should('be.visible')
      .click()

    cy.urlContains('/login')

    cy.formHeaderContains('Login to your account')
  })
})
