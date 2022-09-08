import $ from '@selectors/index'
import { generateBusinessForAPI, generateTrader } from '@entity/entity-helper-functions'

describe('Mobile - Navigation - Merchant - API', () => {
  const { email, password, countryCode } = generateTrader()

  const business = generateBusinessForAPI()

  before(() => {
    cy.clearCookies()
    cy.registerAndConfirmEmailViaAPI(email, password, countryCode)
    cy.loginViaAPI(email, password)

    cy.visit('/account/dashboard')
    cy.addBusinessAndApproveBusinessWebsiteViaAPI(business)
  })

  beforeEach(() => {
    cy.setMobileResolution()

    cy.loginViaAPI(email, password)

    cy.visit('/account/dashboard')

    cy.mobileClickOnMenu()

    cy.clickOnMenuItem($.MENU.MERCHANT)

    cy.clickOnMenuItem($.MENU.MERCHANT_API)
  })

  it('[Mobile] Navigate to "Apps"', () => {
    cy.clickOnMenuItem($.MENU.MERCHANT_API_APPS)

    cy.urlContains('/account/apps')

    cy.breadcrumbContains('/Account/Merchant/Apps')

    cy.headerContains('Apps')

    cy.get($.GENERAL.ALERT.MESSAGE)
      .should('not.exist')

    cy.mobileClickOnMenu()

    cy.clickOnMenuItem($.MENU.MERCHANT)

    cy.clickOnMenuItem($.MENU.MERCHANT_API)

    cy.assertMenuItemIsSelected($.MENU.MERCHANT_API_APPS)

    cy.mobileClickOnMenu()

    cy.contains('.ant-btn', 'Documentation')
      .should('be.visible')

    cy.contains('.ant-btn', 'New App')
      .should('be.visible')

    cy.assertEmptyTableState()
  })

  it('[Mobile] Navigate to "Requests"', () => {
    cy.clickOnMenuItem($.MENU.MERCHANT_API_REQUESTS)

    cy.urlContains('/account/apps/api-requests')

    cy.breadcrumbContains('/Account/Merchant/Apps/API Requests')

    cy.headerContains('API requests')

    cy.get($.GENERAL.ALERT.MESSAGE)
      .should('not.exist')

    cy.mobileClickOnMenu()

    cy.clickOnMenuItem($.MENU.MERCHANT)

    cy.clickOnMenuItem($.MENU.MERCHANT_API)

    cy.assertMenuItemIsSelected($.MENU.MERCHANT_API_REQUESTS)

    cy.mobileClickOnMenu()

    cy.getButtonWithText('Clear Filters')
      .should('be.visible')

    cy.get('thead')
      .within(() => {
        cy.assertTableHeaderCellContains(1, 'API App')
        cy.assertTableHeaderCellContains(2, 'Action')
        cy.assertTableHeaderCellContains(3, 'Response')
        cy.assertTableHeaderCellContains(4, 'IP Address')
        cy.assertTableHeaderCellContains(5, 'Time')
      })

    cy.get($.GENERAL.ICON.FILTER)
      .should('have.length', 2)

    cy.waitForSpinAnimationToDisappear()

    cy.assertEmptyTableState()
  })

  it('[Mobile] Navigate to "Callbacks"', () => {
    cy.clickOnMenuItem($.MENU.MERCHANT_API_CALLBACKS)

    cy.urlContains('/account/apps/api-payment-callbacks')

    cy.breadcrumbContains('/Account/Merchant/Apps/API Callbacks')

    cy.headerContains('API Payment Callbacks')

    cy.get($.GENERAL.ALERT.MESSAGE)
      .should('not.exist')

    cy.mobileClickOnMenu()

    cy.clickOnMenuItem($.MENU.MERCHANT)

    cy.clickOnMenuItem($.MENU.MERCHANT_API)

    cy.assertMenuItemIsSelected($.MENU.MERCHANT_API_CALLBACKS)

    cy.mobileClickOnMenu()

    cy.get('thead')
      .within(() => {
        cy.assertTableHeaderCellContains(0, 'ID')
        cy.assertTableHeaderCellContains(1, 'Order')
        cy.assertTableHeaderCellContains(2, 'Type')
        cy.assertTableHeaderCellContains(3, 'Order Status')
        cy.assertTableHeaderCellContains(4, 'Callback Status')
        cy.assertTableHeaderCellContains(5, 'Retries')
      })

    cy.assertEmptyTableState()
  })
})
