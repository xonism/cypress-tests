import $ from '@selectors/index'

describe('User - Registration - Unsupported Country', () => {
  const personalRegistrationCountry = 'Afghanistan'

  before(() => {
    cy.clearCookies()
  })

  it(`Register as a person in unsupported country (${personalRegistrationCountry})`, () => {
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

    cy.get($.REGISTRATION.BTN.COUNTRY_SELECT_CONTINUE)
      .should('be.visible')
      .click()

    cy.getExplainMessageUnderInputField($.REGISTRATION.DROPDOWN.PERSONAL_COUNTRY)
      .should('contain', 'Country is not supported')

    cy.urlContains('/register')

    cy.formHeaderContains('What is your registration country?')
  })
})
