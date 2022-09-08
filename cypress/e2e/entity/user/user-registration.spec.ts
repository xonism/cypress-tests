import $ from '@selectors/index'
import { generateTrader } from '@entity/entity-helper-functions'

describe('User - Registration', () => {
  const personalRegistrationCountry = 'Lithuania'
  const personalRegistrationState = 'Alaska'

  before(() => {
    cy.clearCookies()
  })

  it(`Register as a person in ${personalRegistrationCountry}`, () => {
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

    cy.get($.REGISTRATION.BTN.AS_A_PERSON)
      .click()

    cy.urlContains('/register')

    cy.formHeaderContains('What is your registration country?')

    cy.get($.REGISTRATION.LINK.LOG_IN)
      .should('be.visible')

    cy.selectPersonalRegistrationCountry(personalRegistrationCountry)

    // if (personalRegistrationCountry === 'United States of America') {
    //   cy.get($.REGISTRATION.BTN.COUNTRY_SELECT_CONTINUE)
    //     .should('be.visible')
    //     .click()

    //   cy.formHeaderContains('What is your registration country?')

    //   cy.get($.REGISTRATION.DROPDOWN.PERSONAL_STATE)
    //     .should('be.visible')
    //     .click()

    //   cy.contains($.GENERAL.DROPDOWN.SELECT_DROPDOWN_MENU_ITEM, personalRegistrationState)
    //     .click()

    //   cy.get($.REGISTRATION.DROPDOWN.PERSONAL_STATE)
    //     .should('contain', personalRegistrationState)
    // }

    cy.get($.REGISTRATION.BTN.COUNTRY_SELECT_CONTINUE)
      .click()

    cy.urlContains('/register')

    cy.formHeaderContains('Create New Account')

    cy.get($.REGISTRATION.LINK.LOG_IN)
      .should('be.visible')

    cy.linkHrefContains(
      $.REGISTRATION.LINK.USER_TERMS,
      'coingate.com/user-terms-and-conditions'
    )

    cy.linkHrefContains(
      $.REGISTRATION.LINK.PURCHASER_TERMS,
      'coingate.com/purchaser-terms-and-conditions'
    )

    cy.get($.REGISTRATION.BTN.GOOGLE_OPTION)
      .should('be.visible')

    cy.get($.REGISTRATION.BTN.FACEBOOK_OPTION)
      .should('be.visible')

    cy.get($.REGISTRATION.BTN.EMAIL_OPTION)
      .should('be.visible')
      .click()

    cy.get($.REGISTRATION.BTN.SUBMIT_SIGN_UP)
      .should('be.visible')
      .click()

    cy.formHeaderContains('Create New Account')

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

    cy.get($.GENERAL.MODAL.CONTENT)
      .should('be.visible')
      .and('contain', 'Email Confirmation')
      .within(() => {
        cy.get($.REGISTRATION.BTN.GO_TO_SIGN_IN)
          .should('be.visible')
          .click()
      })

    cy.formHeaderContains('Login to your account')

    cy.urlContains('/login')

    cy.visitPersonalEmailConfirmationLink(email)

    cy.breadcrumbContains('/Account/Dashboard')

    cy.urlContains('/account/dashboard')
  })
})
