import $ from '@selectors/index'
import { generateBusinessForUiRegistration, generateTrader } from '@entity/entity-helper-functions'

describe('Business - Unsupported Country', () => {
  const { email, password, countryCode } = generateTrader()

  const { businessTitle, businessEmail, businessWebsite } = generateBusinessForUiRegistration()
  const unsupportedBusinessCountry = 'Afghanistan'

  before(() => {
    cy.clearCookies()
    cy.setUpVerifiedPersonalAccount(email, password, countryCode)
  })

  beforeEach(() => {
    cy.loginViaAPI(email, password)
  })

  it(`Create business account in unsupported country (${unsupportedBusinessCountry})`, () => {
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

    cy.get($.ACCOUNT.BUSINESS.INPUT.TITLE)
      .typeAndAssertValue(businessTitle)

    cy.get($.ACCOUNT.BUSINESS.INPUT.EMAIL)
      .typeAndAssertValue(businessEmail)

    cy.contains($.GENERAL.SELECT.SELECTION, 'Business registration country') // TODO: add selector
      .should('be.visible')
      .click()
      .type(unsupportedBusinessCountry)
      .should('contain', unsupportedBusinessCountry)

    cy.get(`${$.GENERAL.DROPDOWN.SELECT_DROPDOWN_MENU_ITEM}:visible`)
      .contains(unsupportedBusinessCountry) // TODO: add selector
      .click()

    cy.get($.ACCOUNT.BUSINESS.INPUT.WEBSITE)
      .typeAndAssertValue(businessWebsite)

    cy.get($.ACCOUNT.BUSINESS.CHECKBOX.TERMS)
      .click()

    cy.getButtonWithText('Add account') // TODO: add selector
      .click()

    cy.urlContains('/account/new')

    cy.breadcrumbContains('/Account/Add Account')

    cy.headerContains('Create new business account')

    cy.get($.ACCOUNT.TYPE)
      .should('be.visible')
      .and('contain', 'personal')

    cy.get($.ACCOUNT.HEADER_MENU)
      .should('be.visible')
      .and('contain', email)

    cy.contains($.GENERAL.SELECT.SELECTION, unsupportedBusinessCountry) // TODO: add selector
      .should('be.visible')
      .parentsUntil('.ant-col')
      .last()
      .find($.GENERAL.FORM.EXPLAIN)
      .should('contain', 'Country not supported')
  })
})
