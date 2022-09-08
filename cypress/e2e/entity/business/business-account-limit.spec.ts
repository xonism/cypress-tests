import $ from '@selectors/index'
import { generateBusinessForAPI, generateBusinessForUiRegistration, generateTrader } from '@entity/entity-helper-functions'

describe('Business - Account Limit', () => {
  const { email, password, countryCode } = generateTrader()

  const business = generateBusinessForAPI()
  const { businessTitle, businessEmail, businessCountry, businessWebsite } = generateBusinessForUiRegistration()

  before(() => {
    cy.clearCookies()
    cy.setUpVerifiedPersonalAccount(email, password, countryCode)

    cy.visit('/account/dashboard')
    cy.setUpVerifiedBusinessAccount(business)
    cy.setUpVerifiedBusinessAccount(business)
    cy.setUpVerifiedBusinessAccount(business)
    cy.setUpVerifiedBusinessAccount(business)
    cy.setUpVerifiedBusinessAccount(business)

    cy.reload()

    cy.selectPersonalAccount(email)
  })

  beforeEach(() => {
    cy.loginViaAPI(email, password)
  })

  it('Check if user can have only 5 business accounts', () => {
    cy.visit('/account/dashboard')
    cy.breadcrumbContains('/Account/Dashboard')

    cy.get($.ACCOUNT.BUSINESS.BTN.CREATE_BUSINESS_ACCOUNT)
      .should('be.visible')
      .click()

    cy.urlContains('/account/new')
    cy.breadcrumbContains('/Account/Add Account')
    cy.headerContains('Create new business account')

    cy.get($.ACCOUNT.BUSINESS.INPUT.TITLE)
      .typeAndAssertValue(businessTitle)

    cy.get($.ACCOUNT.BUSINESS.INPUT.EMAIL)
      .typeAndAssertValue(businessEmail)

    cy.contains($.GENERAL.SELECT.SELECTION, 'Business registration country') // TODO: add selector
      .should('be.visible')
      .click()
      .type(businessCountry)
      .should('contain', businessCountry)

    cy.get(`${$.GENERAL.DROPDOWN.SELECT_DROPDOWN_MENU_ITEM}:visible`) // TODO: add selector
      .contains(businessCountry)
      .click()

    cy.contains('a', 'Terms and Conditions') // TODO: add selector
      .should('be.visible')
      .invoke('attr', 'href')
      .should('contain', 'coingate.com/merchant-terms-and-conditions')

    cy.get($.ACCOUNT.BUSINESS.INPUT.WEBSITE)
      .typeAndAssertValue(businessWebsite)

    cy.get($.ACCOUNT.BUSINESS.CHECKBOX.TERMS)
      .click()

    cy.getButtonWithText('Add account') // TODO: add selector
      .click()

    cy.get($.GENERAL.MESSAGE_NOTICE_CONTENT)
      .should('be.visible')
      .and('contain', 'You have exceeded limit for business creation. Contact support@coingate.com to increase limits')
  })
})
