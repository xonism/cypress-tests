import $ from '@selectors/index'
import { generateBusinessForAPI, generateTrader } from '@entity/entity-helper-functions'

describe('Navigation - General', () => {
  const { email, password, countryCode } = generateTrader()

  before(() => {
    cy.clearCookies()
    cy.registerAndConfirmEmailViaAPI(email, password, countryCode)
  })

  beforeEach(() => {
    cy.loginViaAPI(email, password)

    cy.visit('/account/dashboard')
  })

  it('Navigate to personal "Dashboard"', () => {
    cy.clickOnMenuItem($.MENU.DASHBOARD)

    cy.urlContains('/account/dashboard')

    cy.breadcrumbContains('/Account/Dashboard')

    cy.get($.GENERAL.ALERT.MESSAGE)
      .should('not.exist')

    cy.assertMenuItemIsSelected($.MENU.DASHBOARD)

    cy.contains($.GENERAL.DASHBOARD_CARD, 'Quick Start')
      .should('be.visible')
      .within(() => {
        cy.get('.quick-start')
          .should('be.visible')
      })

    cy.contains($.GENERAL.DASHBOARD_CARD, 'Trading Orders')
      .should('be.visible')
      .within(() => {
        cy.get('thead')
          .within(() => {
            cy.assertTableHeaderCellContains(0, 'ID')
            cy.assertTableHeaderCellContains(1, 'Order Status')
            cy.assertTableHeaderCellContains(2, 'Withdrawal Status')
            cy.assertTableHeaderCellContains(3, 'Category')
            cy.assertTableHeaderCellContains(4, 'Amount')
          })

        cy.assertEmptyTableState('No Orders')

        cy.contains('.ant-btn-dashed', 'Buy')
          .should('be.visible')

        cy.contains('.ant-btn-dashed', 'Sell')
          .should('be.visible')
      })

    cy.contains($.GENERAL.DASHBOARD_CARD, 'Open a Business Account')
      .should('be.visible')
      .within(() => {
        cy.contains('.ant-btn', 'Create a Business account')
          .should('be.visible')
      })

    cy.contains($.GENERAL.DASHBOARD_CARD, 'Currency Rates')
      .should('be.visible')
      .within(() => {
        cy.get('.currency-rate')
          .should('be.visible')
      })

    cy.contains($.GENERAL.DASHBOARD_CARD, 'Check out our new Gift Cards section')
      .should('be.visible')
      .within(() => {
        cy.contains('.ant-btn', 'Go to shop')
          .should('be.visible')
      })

    cy.contains($.GENERAL.DASHBOARD_CARD, 'Account Limits')
      .should('be.visible')

    cy.contains($.GENERAL.DASHBOARD_CARD, 'Earn rewards')
      .should('be.visible')
      .within(() => {
        cy.contains('.ant-btn', 'Create your referral link')
          .should('be.visible')
      })
  })

  it('Navigate to "Suggest a Feature"', () => {
    cy.clickOnMenuItem($.MENU.SUGGEST_A_FEATURE)

    cy.get($.GENERAL.ALERT.MESSAGE)
      .should('not.exist')

    cy.get($.GENERAL.MODAL.CONTENT)
      .should('be.visible')
      .within(() => {
        cy.contains('h1', 'Suggest a new feature')
          .should('be.visible')

        cy.get($.GENERAL.MODAL.CLOSE)
          .should('be.visible')

        cy.get($.GENERAL.SUGGEST_FEATURE.INPUT.DESCRIPTION)
          .should('be.visible')

        cy.contains('.ant-checkbox-wrapper', 'updates')
          .should('be.visible')

        cy.contains('.ant-checkbox-wrapper', 'contacted')
          .should('be.visible')

        cy.get('button[type="submit"]')
          .should('be.visible')
      })
  })

  it('Navigate to business "Dashboard"', () => {
    const business = generateBusinessForAPI()

    cy.addBusinessAndApproveBusinessWebsiteViaAPI(business)

    cy.clickOnMenuItem($.MENU.DASHBOARD)

    cy.urlContains('/account/dashboard')

    cy.breadcrumbContains('/Account/Dashboard')

    cy.get($.GENERAL.ALERT.MESSAGE)
      .should('not.exist')

    cy.assertMenuItemIsSelected($.MENU.DASHBOARD)

    cy.contains($.GENERAL.DASHBOARD_CARD, 'Quick Start')
      .should('be.visible')
      .within(() => {
        cy.get('.quick-start')
          .should('be.visible')
      })

    cy.contains($.GENERAL.DASHBOARD_CARD, 'Orders')
      .should('be.visible')
      .within(() => {
        cy.get('.orders')
          .should('be.visible')
      })

    cy.contains($.GENERAL.DASHBOARD_CARD, 'Currency Rates')
      .should('be.visible')
      .within(() => {
        cy.get('.currency-rate')
          .should('be.visible')
      })

    cy.contains($.GENERAL.DASHBOARD_CARD, 'Merchant Orders')
      .should('be.visible')
      .within(() => {
        cy.get('thead')
          .within(() => {
            cy.assertTableHeaderCellContains(0, 'ID')
            cy.assertTableHeaderCellContains(1, 'Type')
            cy.assertTableHeaderCellContains(2, 'Title')
            cy.assertTableHeaderCellContains(3, 'Price')
            cy.assertTableHeaderCellContains(4, 'Status')
          })

        cy.assertEmptyTableState('No Orders')
      })

    cy.contains($.GENERAL.DASHBOARD_CARD, 'Check out our new Gift Cards section')
      .should('be.visible')
      .within(() => {
        cy.contains('.ant-btn', 'Go to shop')
          .should('be.visible')
      })

    cy.contains($.GENERAL.DASHBOARD_CARD, 'Account Limits')
      .should('be.visible')
      .within(() => {
        cy.contains('.ant-btn', 'Start verification')
          .should('be.visible')
      })

    cy.contains($.GENERAL.DASHBOARD_CARD, 'Earn rewards')
      .should('be.visible')
      .within(() => {
        cy.contains('.ant-btn', 'Create your referral link')
          .should('be.visible')
      })

    cy.contains($.GENERAL.DASHBOARD_CARD, 'Billing is live')
      .should('be.visible')
      .within(() => {
        cy.contains('.ant-btn', 'Learn more')
          .should('be.visible')
      })

    cy.contains($.GENERAL.DASHBOARD_CARD, 'Top Currencies')
      .should('be.visible')
      .within(() => {
        cy.assertEmptyTableState()
      })
  })
})
