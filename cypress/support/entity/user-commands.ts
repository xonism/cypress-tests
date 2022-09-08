import $ from '@selectors/index'
import { getStage, getTestingApiURL } from '../helper-functions'

declare global {
  namespace Cypress {
    interface Chainable {
      loginViaAPI(email: string, password: string): Chainable<Element>
      logoutViaAPI(): Chainable<Element>
      registerViaAPI(
        email: string,
        password: string,
        registrationCountry: string,
        entityType?: string
      ): Chainable<Element>
      confirmUserEmailViaAPI(email: string): Chainable<Element>
      registerAndConfirmEmailViaAPI(email: string, password: string, countryCode: string): Chainable<Element>
      verifyUserViaAPI(email: string): Chainable<Element>
      simplyVerifyUserViaAPI(email: string): Chainable<Element>
      setUpVerifiedPersonalAccount(email: string, password: string, countryCode: string): Chainable<Element>
      getPersonalEmailVerificationTokenViaAPI(email: string): Promise<any>
      visitPersonalEmailConfirmationLink(email: string): Chainable<Element>
      selectPersonalRegistrationCountry(personalRegistrationCountry: string): Chainable<Element>
      typePasswordAndSubmitRegistration(password: string): Chainable<Element>
      typeEmailAndPasswordAndSubmitLogin(email: string, password: string): Chainable<Element>
      selectPersonalAccount(email: string): Chainable<Element>
      getPersonalRegistrationCountriesViaAPI(): Promise<any>
      assertStateIsEnabledInDropdown(stateNameRegex: RegExp): Chainable<Element>
      assertStateIsDisabledInDropdown(stateNameRegex: RegExp): Chainable<Element>
    }
  }
}

const testingApiURL = getTestingApiURL()

Cypress.Commands.add('loginViaAPI', (email, password) => {
  cy.logStep('API: Login')

  cy.session(
    [ email, password ],
    () => {
      cy.internalRequest({
        method: 'POST',
        url: '/users/sign_in.json',
        body: {
          user: {
            email,
            password,
          },
        },
      })
        .then((response) => {
          expect(response.status).to.eq(200)
        })
    },
    {
      validate() {
        cy.visit('/account/dashboard')
      }
    })
})

Cypress.Commands.add('logoutViaAPI', () => {
  cy.logStep('API: Logout')

  cy.internalRequest({
    method: 'DELETE',
    url: '/users/sign_out',
  }).then((response) => {
    expect(response.status).to.be.within(200, 210)
  })
})

Cypress.Commands.add('registerViaAPI', (email, password, registrationCountry, entityType = 'person') => {
  cy.logStep('API: Register')

  cy.internalRequest({
    method: 'POST',
    url: '/users',
    body: {
      user: {
        email,
        entity_type: entityType,
        password,
        password_confirmation: password,
        registration_country: registrationCountry
      },
    },
  })
    .then((response) => {
      expect(response.status).to.be.eq(200)
    })
})

Cypress.Commands.add('confirmUserEmailViaAPI', (email) => {
  cy.logStep('API: Confirm user email')

  cy.internalRequest({
    method: 'POST',
    url: `${testingApiURL}/users/confirm_email`,
    body: {
      email,
    },
  }).then((response) => {
    expect(response.status).to.eq(204)
  })
})

Cypress.Commands.add('registerAndConfirmEmailViaAPI', (email, password, countryCode) => {
  cy.registerViaAPI(email, password, countryCode)
  cy.confirmUserEmailViaAPI(email)
})

Cypress.Commands.add('verifyUserViaAPI', (email) => {
  cy.logStep('API: Verify user')

  cy.internalRequest({
    method: 'POST',
    url: `${testingApiURL}/users/verify`,
    body: {
      email
    }
  }).then((response) => {
    expect(response.status).to.eq(204)
  })
})

Cypress.Commands.add('simplyVerifyUserViaAPI', (email) => {
  cy.logStep('API: Simply verify user')

  cy.internalRequest({
    method: 'POST',
    url: `${testingApiURL}/users/simply_verify`,
    body: {
      email
    }
  }).then((response) => {
    expect(response.status).to.eq(204)
  })
})

Cypress.Commands.add('setUpVerifiedPersonalAccount', (email, password, countryCode) => {
  cy.registerViaAPI(email, password, countryCode)
  cy.confirmUserEmailViaAPI(email)
  cy.loginViaAPI(email, password)
  cy.verifyUserViaAPI(email)
})

Cypress.Commands.add('getPersonalEmailVerificationTokenViaAPI', (email) => {
  cy.logStep('API: Get personal email verification token')

  cy.internalRequest({
    url: `${testingApiURL}/users/confirmation_token`,
    body: {
      email
    }
  }).then((response) => {
    expect(response.status).to.eq(200)
  })
})

Cypress.Commands.add('visitPersonalEmailConfirmationLink', (email) => {
  cy.getPersonalEmailVerificationTokenViaAPI(email)
    .then((response) => {
      const confirmationToken = response.body.token

      cy.visit('')
    })
})

Cypress.Commands.add('selectPersonalRegistrationCountry', (personalRegistrationCountry) => {
  cy.get($.REGISTRATION.DROPDOWN.PERSONAL_COUNTRY)
    .should('be.visible')
    .click()

  cy.contains($.GENERAL.DROPDOWN.SELECT_DROPDOWN_MENU_ITEM, personalRegistrationCountry)
    .click()

  cy.get($.REGISTRATION.DROPDOWN.PERSONAL_COUNTRY)
    .should('contain', personalRegistrationCountry)
})

Cypress.Commands.add('typePasswordAndSubmitRegistration', (password) => {
  cy.get($.REGISTRATION.INPUT.PASSWORD)
    .typeAndAssertValue(password)

  cy.get($.REGISTRATION.INPUT.PASSWORD_CONFIRMATION)
    .typeAndAssertValue(password)

  cy.get($.REGISTRATION.BTN.REGISTER)
    .should('be.visible')
    .click()
})

Cypress.Commands.add('typeEmailAndPasswordAndSubmitLogin', (email, password) => {
  cy.get($.LOGIN.INPUT.EMAIL)
    .typeAndAssertValue(email)

  cy.get($.LOGIN.INPUT.PASSWORD)
    .typeAndAssertValue(password)

  cy.get($.LOGIN.BTN.SUBMIT)
    .should('be.visible')
    .click()
})

Cypress.Commands.add('selectPersonalAccount', (email) => {
  cy.get($.ACCOUNT.HEADER_MENU)
    .should('be.visible')
    .click()

  cy.contains($.ACCOUNT.DIV.ACCOUNT_ITEM, email)
    .click()

  cy.get($.ACCOUNT.TYPE)
    .should('be.visible')
    .and('contain', 'personal')

  cy.get($.ACCOUNT.HEADER_MENU)
    .should('be.visible')
    .and('contain', email)
})

Cypress.Commands.add('getPersonalRegistrationCountriesViaAPI', () => {
  cy.logStep('API: Get personal registration countries')

  cy.internalRequest({
    url: 'https://dashboard.coingate.com/users/sign_up.json'
  }).then((response) => {
    expect(response.status).to.be.eq(200)
  })
})

Cypress.Commands.add('assertStateIsEnabledInDropdown', (stateNameRegex) => {
  cy.contains($.GENERAL.DROPDOWN.SELECT_DROPDOWN_MENU_ITEM, stateNameRegex)
    .invoke('attr', 'aria-disabled')
    .should('equal', 'false')
})

Cypress.Commands.add('assertStateIsDisabledInDropdown', (stateNameRegex) => {
  cy.contains($.GENERAL.DROPDOWN.SELECT_DROPDOWN_MENU_ITEM, stateNameRegex)
    .invoke('attr', 'aria-disabled')
    .should('equal', 'true')

  cy.contains($.GENERAL.DROPDOWN.SELECT_DROPDOWN_MENU_ITEM, stateNameRegex)
    .click()

  cy.contains($.GENERAL.DROPDOWN.SELECT_DROPDOWN_MENU_ITEM, stateNameRegex)
    .invoke('attr', 'aria-selected')
    .should('equal', 'false')
})
