import $ from '@selectors/index'
import { generateBusinessForAPI, generateTrader } from '@entity/entity-helper-functions'

describe('Business - Registration', () => {
  const personalRegistrationCountry = 'Germany'
  // const personalRegistrationState = 'Alaska'

  const { businessTitle, businessWebsite } = generateBusinessForAPI()

  const businessRegistrationCountry = 'Lithuania'

  before(() => {
    cy.clearCookies()
  })

  it(`Register as a business in ${businessRegistrationCountry}`, () => {
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

    cy.formHeaderContains('First let’s create your personal account')

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

    cy.get($.REGISTRATION.DIV.CREATE_PERSONAL_ACCOUNT)
      .should('be.visible')
      .and('have.class', 'active')
      .and('contain', 'Create a personal account')

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

    cy.selectBusinessRegistrationCountry(businessRegistrationCountry)

    cy.linkHrefContains(
      $.REGISTRATION.LINK.MERCHANT_TERMS,
      'coingate.com/merchant-terms-and-conditions'
    )

    cy.get($.REGISTRATION.DIV.SET_UP_BUSINESS_ACCOUNT)
      .should('be.visible')
      .and('have.class', 'active')
      .and('contain', 'Set up your business account')

    cy.get($.REGISTRATION.BTN.SET_UP_BUSINESS_CONTINUE)
      .should('be.visible')
      .click()

    cy.urlContains('/account/welcome')

    cy.formHeaderContains('Set up your business account')

    // firstly checking whether terms link changes for US merchants
    cy.selectBusinessRegistrationCountry('United States of America')

    cy.linkHrefContains(
      $.REGISTRATION.LINK.MERCHANT_TERMS,
      'coingate.com/us-merchant-terms-and-conditions'
    )

    cy.selectBusinessRegistrationCountry(businessRegistrationCountry)

    cy.get($.REGISTRATION.INPUT.BUSINESS_NAME)
      .typeAndAssertValue(businessTitle)

    cy.get($.REGISTRATION.INPUT.BUSINESS_WEBSITE)
      .typeAndAssertValue(businessWebsite)

    cy.get($.GENERAL.FORM.EXPLAIN)
      .should('not.exist')

    cy.get($.REGISTRATION.BTN.SET_UP_BUSINESS_CONTINUE)
      .should('be.visible')
      .click()

    cy.urlContains('/account/welcome')

    cy.get($.REGISTRATION.DIV.GET_VERIFIED)
      .should('be.visible')
      .and('have.class', 'active')
      .and('contain', 'Get Verified')
      .click()

    cy.urlContains('/account/welcome')

    cy.get($.REGISTRATION.TITLE)
      .should('be.visible')
      .and('contain', 'Get Verified')

    cy.get($.REGISTRATION.BTN.STEP_BY_STEP_GUIDE)
      .should('be.visible')
      .and('contain', 'STEP-BY-STEP guide')
      .invoke('attr', 'href')
      .should('contain', 'coingate.com/blog/post/verify-merchant-account-faq')

    cy.get($.REGISTRATION.BTN.PAYMENT_INTEGRATIONS)
      .should('be.visible')
      .and('contain', 'Payment integrations')
      .invoke('attr', 'href')
      .should('contain', 'coingate.com/integration')

    cy.get($.REGISTRATION.BTN.MANAGE_USER_PERMISSIONS)
      .should('be.visible')
      .and('contain', 'Manage user permissions')
      .invoke('attr', 'href')
      .should('contain', 'coingate.com/blog/post/business-user-permissions')

    cy.linkHrefContains(
      $.REGISTRATION.LINK.FAQ,
      'https://support.coingate.com/hc/en-us'
    )

    cy.contains('a', 'support@coingate.com')
      .should('be.visible')

    cy.get($.REGISTRATION.BTN.LOOK_AROUND_FIRST)
      .should('be.visible')
      .and('contain', 'Take a look around first')

    cy.get($.REGISTRATION.BTN.VERIFY_BUSINESS)
      .should('be.visible')
      .and('contain', 'Verify your business')
      .click()

    cy.breadcrumbContains('/Account/Verification')

    cy.urlContains('/account/settings/verification')

    cy.go('back')

    cy.get($.REGISTRATION.TITLE)
      .should('be.visible')
      .and('contain', 'Get Verified')

    cy.urlContains('/account/welcome')

    cy.get($.REGISTRATION.BTN.LOOK_AROUND_FIRST)
      .should('be.visible')
      .and('contain', 'Take a look around first')
      .click()

    cy.breadcrumbContains('/Account/Dashboard')

    cy.urlContains('/account/dashboard')
  })
})
