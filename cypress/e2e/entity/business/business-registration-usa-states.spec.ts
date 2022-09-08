import $ from '@selectors/index'
import { generateBusinessForAPI, generateTrader } from '@entity/entity-helper-functions'
import { getMerchantSupportedStateNameRegex } from '@support/helper-functions'
import { IState, IStates } from '@support/interfaces'

describe('Business - Registration - USA States', () => {
  const personalRegistrationCountry = 'Germany'

  const { businessTitle, businessWebsite } = generateBusinessForAPI()

  const businessRegistrationCountry = 'United States of America'

  before(() => {
    cy.clearCookies()
  })

  it('Check business registration supported & unsupported USA states', () => {
    const { email, password } = generateTrader()

    cy.visit('/login')

    cy.formHeaderContains('Login to your account')

    cy.get($.LOGIN.BTN.SIGN_UP)
      .should('be.visible')
      .click()

    cy.urlContains('/register')
    cy.formHeaderContains('What type of account would you like to setup?')

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

    cy.visitPersonalEmailConfirmationLink(email)

    cy.urlContains('/account/welcome')
    cy.formHeaderContains('Set up your business account')

    cy.get($.REGISTRATION.INPUT.BUSINESS_NAME)
      .typeAndAssertValue(businessTitle)

    cy.selectBusinessRegistrationCountry(businessRegistrationCountry)

    cy.get($.REGISTRATION.DROPDOWN.BUSINESS_STATE)
      .should('be.visible')
      .click()

    cy.contains($.GENERAL.DROPDOWN.SELECT_DROPDOWN, 'New York') // selects the states dropdown instead of country dropdown
      .should('be.visible')
      .within(() => {
        cy.getPersonalRegistrationCountriesViaAPI()
          .then((response) => {
            const states: IStates = response.body.countries.US.states

            for (const state in states) {
              const { label, merchant_supported }: IState = states[state]

              const stateNameRegex = new RegExp('^' + label + '$', 'g')

              if (merchant_supported) {
                cy.assertStateIsEnabledInDropdown(stateNameRegex)
              } else {
                cy.assertStateIsDisabledInDropdown(stateNameRegex)
              }
            }

            cy.contains($.GENERAL.DROPDOWN.SELECT_DROPDOWN_MENU_ITEM, getMerchantSupportedStateNameRegex(states))
              .click()
          })
      })

    cy.get($.REGISTRATION.INPUT.BUSINESS_WEBSITE)
      .typeAndAssertValue(businessWebsite)

    cy.linkHrefContains(
      $.REGISTRATION.LINK.MERCHANT_TERMS,
      'coingate.com/us-merchant-terms-and-conditions'
    )

    cy.get($.REGISTRATION.DIV.SET_UP_BUSINESS_ACCOUNT)
      .should('be.visible')
      .and('have.class', 'active')
      .and('contain', 'Set up your business account')

    cy.get($.REGISTRATION.BTN.SET_UP_BUSINESS_CONTINUE)
      .should('be.visible')
      .click()

    cy.urlContains('/account/welcome')

    cy.get($.REGISTRATION.DIV.GET_VERIFIED)
      .should('be.visible')
      .and('have.class', 'active')
      .and('contain', 'Get Verified')
  })
})
