import $ from '@selectors/index'
import { generateBusinessForUiRegistration, generateTrader } from '@entity/entity-helper-functions'

describe('Business - Create Account', () => {
  const { email, password, countryCode } = generateTrader()

  const { businessTitle, businessEmail, businessCountry, businessWebsite } = generateBusinessForUiRegistration()

  before(() => {
    cy.clearCookies()
    cy.setUpVerifiedPersonalAccount(email, password, countryCode)
  })

  beforeEach(() => {
    cy.loginViaAPI(email, password)
  })

  it(`Create business account in ${businessCountry}`, () => {
    cy.visit('/account/dashboard')

    cy.breadcrumbContains('/Account/Dashboard')

    cy.get($.ACCOUNT.TYPE)
      .should('be.visible')
      .and('contain', 'personal')

    cy.get($.ACCOUNT.HEADER_MENU)
      .should('be.visible')
      .and('contain', email)

    cy.get($.ACCOUNT.BUSINESS.BTN.CREATE_BUSINESS_ACCOUNT)
      .should('be.visible')
      .click()

    cy.urlContains('/account/new')

    cy.breadcrumbContains('/Account/Add Account')

    cy.headerContains('Create new business account')

    cy.getButtonWithText('Add account') // TODO: add selector
      .should('be.visible')
      .click()

    cy.get($.GENERAL.FORM.EXPLAIN)
      .should('have.length', 5)
      .and('be.visible')

    cy.get($.ACCOUNT.BUSINESS.INPUT.TITLE)
      .typeAndAssertValue(businessTitle)

    cy.get($.ACCOUNT.BUSINESS.INPUT.EMAIL)
      .typeAndAssertValue(businessEmail)

    // firstly checking whether terms link changes for US merchants
    cy.contains($.GENERAL.SELECT.SELECTION, 'Business registration country') // TODO: add selector
      .should('be.visible')
      .click()
      .type('United States of America')
      .should('contain', 'United States of America')

    cy.get(`${$.GENERAL.DROPDOWN.SELECT_DROPDOWN_MENU_ITEM}:visible`) // TODO: add selector
      .contains('United States of America')
      .click()

    cy.contains('a', 'Terms and Conditions') // TODO: add selector
      .should('be.visible')
      .invoke('attr', 'href')
      .should('contain', 'coingate.com/us-merchant-terms-and-conditions')

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

    cy.urlContains('/account/business/confirm')

    cy.breadcrumbContains('/Account/Business/Email Confirmation')

    cy.headerContains('Confirm your business email')

    cy.assertBusinessAccount(businessTitle)

    cy.get($.ACCOUNT.HEADER_MENU)
      .should('be.visible')
      .click()

    cy.get(`${$.ACCOUNT.HEADER_SUBMENU}:visible`)
      .find($.ACCOUNT.CURRENT_ACCOUNT)
      .should('contain', businessTitle)
      .and('contain', businessEmail)
      .and('contain', 'Business Account')
  })
})
