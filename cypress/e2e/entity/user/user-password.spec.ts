import $ from '@selectors/index'
import { generateEmail, generateTrader } from '@entity/entity-helper-functions'

describe('User - Password', () => {
  const { email, password, countryCode } = generateTrader()

  const registrationCountry = 'Germany'
  const registrationState = 'Alaska'

  before(() => {
    cy.clearCookies()
    cy.registerAndConfirmEmailViaAPI(email, password, countryCode)
  })

  it('Check if wrong email & password combinations show errors', () => {
    const wrongEmail = 'wrong@example.com'
    const wrongPassword = 'wrongA1+'

    cy.visit('/login')

    cy.formHeaderContains('Login to your account')

    cy.get($.LOGIN.BTN.EMAIL_OPTION)
      .should('be.visible')
      .click()

    cy.typeEmailAndPasswordAndSubmitLogin(wrongEmail, wrongPassword)

    cy.contains($.GENERAL.MESSAGE, 'Invalid email or password')
      .should('be.visible')

    cy.urlContains('/login')

    cy.formHeaderContains('Login to your account')

    cy.typeEmailAndPasswordAndSubmitLogin(wrongEmail, password)

    cy.contains($.GENERAL.MESSAGE, 'Invalid email or password')
      .should('be.visible')

    cy.urlContains('/login')

    cy.formHeaderContains('Login to your account')

    cy.typeEmailAndPasswordAndSubmitLogin(email, wrongPassword)

    cy.contains($.GENERAL.MESSAGE, 'Invalid email or password')
      .should('be.visible')

    cy.urlContains('/login')

    cy.formHeaderContains('Login to your account')

    cy.typeEmailAndPasswordAndSubmitLogin(email, password)

    cy.urlContains('/account/dashboard')

    cy.breadcrumbContains('/Account/Dashboard')
  })

  it('Check "Forgot password" functionality', () => {
    cy.visit('/login')

    cy.formHeaderContains('Login to your account')

    cy.get($.LOGIN.BTN.EMAIL_OPTION)
      .should('be.visible')
      .click()

    cy.get($.LOGIN.LINK.FORGOT_PASSWORD)
      .should('be.visible')
      .click()

    cy.urlContains('/reset')

    cy.formHeaderContains('Password Reset')

    cy.get($.LOGIN.INPUT.RESET_PASSWORD_EMAIL)
      .should('be.visible')
      .type(email)
      .invoke('val')
      .should('contain', email)

    cy.getButtonWithText('Reset Password')
      .should('be.visible')
      .click()

    cy.contains($.GENERAL.MODAL.MODAL, 'Reset Information')
      .should('be.visible')
  })

  it('Check registration password validation (8 letters, 1 digit & 1 symbol are required)', () => {
    const newEmail = generateEmail()

    cy.visit('/register')

    cy.formHeaderContains('What type of account would you like to setup?')

    cy.get($.REGISTRATION.BTN.AS_A_PERSON)
      .click()

    cy.urlContains('/register')

    cy.formHeaderContains('What is your registration country?')

    cy.selectPersonalRegistrationCountry(registrationCountry)

    // if (registrationCountry === 'United States of America') {
    //   cy.get($.REGISTRATION.BTN.COUNTRY_SELECT_CONTINUE)
    //     .should('be.visible')
    //     .click()

    //   cy.formHeaderContains('What is your registration country?')

    //   cy.get($.REGISTRATION.DROPDOWN.PERSONAL_STATE)
    //     .should('be.visible')
    //     .click()

    //   cy.contains($.GENERAL.DROPDOWN.SELECT_DROPDOWN_MENU_ITEM, registrationState)
    //     .click()

    //   cy.get($.REGISTRATION.DROPDOWN.PERSONAL_STATE)
    //     .should('contain', registrationState)
    // }

    cy.get($.REGISTRATION.BTN.COUNTRY_SELECT_CONTINUE)
      .click()

    cy.get($.GENERAL.FORM.HEADER)
      .should('contain', 'Create New Account')

    cy.urlContains('/register')

    cy.formHeaderContains('Create New Account')

    cy.get($.REGISTRATION.BTN.EMAIL_OPTION)
      .should('be.visible')
      .click()

    cy.get($.REGISTRATION.INPUT.EMAIL)
      .should('be.visible')
      .type(newEmail)
      .invoke('val')
      .should('contain', newEmail)

    cy.typePasswordAndSubmitRegistration('aaa')

    cy.contains($.GENERAL.FORM.EXPLAIN, 'is too short (minimum is 8 characters)')
      .should('be.visible')

    cy.typePasswordAndSubmitRegistration('aaaaaaaa')

    cy.contains($.GENERAL.FORM.EXPLAIN, 'must contain at least one digit')
      .should('be.visible')

    cy.typePasswordAndSubmitRegistration('aaaaaaaa1')

    cy.contains($.GENERAL.FORM.EXPLAIN, 'must contain at least one special character')
      .should('be.visible')

    cy.typePasswordAndSubmitRegistration(password)

    cy.contains($.GENERAL.MODAL.MODAL, 'Email Confirmation')
      .should('be.visible')

    cy.get($.REGISTRATION.BTN.GO_TO_SIGN_IN)
      .should('be.visible')
      .click()

    cy.urlContains('/login')

    cy.formHeaderContains('Login to your account')
  })
})
