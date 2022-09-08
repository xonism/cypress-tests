import $ from '@selectors/index'
import { generateBusinessForAPI, generateTrader } from '@entity/entity-helper-functions'

describe('Business - Registration - Unsupported Country', () => {
  const personalRegistrationCountry = 'Lithuania'

  const { businessTitle, businessWebsite } = generateBusinessForAPI()

  const businessRegistrationCountry = 'Afghanistan'

  before(() => {
    cy.clearCookies()
  })

  it(`Register as a business in unsupported country (${businessRegistrationCountry})`, () => {
    const { email, password } = generateTrader()

    cy.visit('/login')

    cy.formHeaderContains('Login to your account')

    cy.get($.LOGIN.BTN.SIGN_UP)
      .should('be.visible')
      .click()

    cy.urlContains('/register')

    cy.formHeaderContains('What type of account would you like to setup?')

    cy.get($.REGISTRATION.LINK.LOG_IN)
      .should('be.visible')

    cy.get($.REGISTRATION.BTN.AS_A_BUSINESS)
      .click()

    cy.urlContains('/register')

    cy.formHeaderContains('What is your registration country?')

    cy.get($.REGISTRATION.LINK.LOG_IN)
      .should('be.visible')

    cy.selectPersonalRegistrationCountry(personalRegistrationCountry)

    cy.get($.REGISTRATION.BTN.COUNTRY_SELECT_CONTINUE)
      .click()

    cy.urlContains('/register')

    cy.formHeaderContains('First let’s create your personal account')

    cy.get($.REGISTRATION.LINK.LOG_IN)
      .should('be.visible')

    cy.get($.REGISTRATION.DIV.CREATE_PERSONAL_ACCOUNT)
      .should('be.visible')
      .and('have.class', 'active')
      .and('contain', 'Create a personal account')

    cy.get($.REGISTRATION.BTN.EMAIL_OPTION)
      .should('be.visible')
      .click()

    cy.get($.REGISTRATION.BTN.SUBMIT_SIGN_UP)
      .should('be.visible')
      .click()

    cy.formHeaderContains('First let’s create your personal account')

    cy.assertNumberOfExplainMessages(3)

    cy.get($.REGISTRATION.INPUT.EMAIL)
      .type(email)

    cy.get($.REGISTRATION.INPUT.PASSWORD)
      .type(password)

    cy.get($.REGISTRATION.INPUT.PASSWORD_CONFIRMATION)
      .type(password)

    cy.get($.REGISTRATION.CHECKBOX.UPDATES)
      .check()
      .should('be.checked')

    cy.get($.REGISTRATION.BTN.SUBMIT_SIGN_UP)
      .click()

    cy.get($.REGISTRATION.DIV.CONFIRM_EMAIL_ADDRESS)
      .should('be.visible')
      .and('have.class', 'active')
      .and('contain', 'Confirm your email address')
      .and('contain', email)
      .within(() => {
        cy.get($.REGISTRATION.LINK.RESEND_EMAIL)
          .should('be.visible')
      })

    cy.visitPersonalEmailConfirmationLink(email)

    cy.urlContains('/account/welcome')

    cy.formHeaderContains('Set up your business account')

    cy.get($.REGISTRATION.DIV.SET_UP_BUSINESS_ACCOUNT)
      .should('be.visible')
      .and('have.class', 'active')
      .and('contain', 'Set up your business account')

    cy.get($.REGISTRATION.INPUT.BUSINESS_NAME)
      .typeAndAssertValue(businessTitle)

    cy.selectBusinessRegistrationCountry(businessRegistrationCountry)

    cy.get($.REGISTRATION.INPUT.BUSINESS_WEBSITE)
      .typeAndAssertValue(businessWebsite)

    cy.getExplainMessageUnderInputField($.REGISTRATION.DROPDOWN.BUSINESS_COUNTRY)
      .should('contain', 'Country is not supported')

    cy.get($.REGISTRATION.BTN.SET_UP_BUSINESS_CONTINUE)
      .should('be.visible')
      .click()

    cy.urlContains('/account/welcome')

    cy.formHeaderContains('Set up your business account')
  })
})
