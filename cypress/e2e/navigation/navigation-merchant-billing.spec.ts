import $ from '@selectors/index'
import { generateBusinessForAPI, generateTrader } from '@entity/entity-helper-functions'

describe('Navigation - Merchant - Billing', () => {
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
    cy.loginViaAPI(email, password)

    cy.visit('/account/dashboard')

    cy.clickOnMenuItem($.MENU.MERCHANT)

    cy.clickOnMenuItem($.MENU.MERCHANT_BILLING)
  })

  it('Navigate to "Whats this?"', () => {
    cy.clickOnMenuItem($.MENU.MERCHANT_BILLING_WHATS_THIS)

    cy.urlContains('/account/billing/info')

    cy.breadcrumbContains('/Account/Merchant/Billing/Info')

    cy.get($.GENERAL.ALERT.MESSAGE)
      .should('not.exist')

    cy.assertMenuItemIsSelected($.MENU.MERCHANT_BILLING_WHATS_THIS)

    cy.contains('.billing-description h3', 'What is billing?')
      .should('be.visible')

    cy.get('.billing-description p')
      .should('be.visible')
  })

  it('Navigate to "Details"', () => {
    cy.passBillingIntroduction()

    cy.clickOnMenuItem($.MENU.MERCHANT_BILLING_DETAILS)

    cy.urlContains('/account/billing/details')

    cy.breadcrumbContains('/Account/Merchant/Billing/Details')

    cy.headerContains('Billing Details')

    cy.get($.GENERAL.ALERT.MESSAGE)
      .should('not.exist')

    cy.assertMenuItemIsSelected($.MENU.MERCHANT_BILLING_DETAILS)

    cy.contains('.ant-btn', 'New Billing Details')
      .should('be.visible')

    cy.get('thead')
      .within(() => {
        cy.assertTableHeaderCellContains(0, 'ID')
        cy.assertTableHeaderCellContains(1, 'Title')
        cy.assertTableHeaderCellContains(2, 'Details ID')
        cy.assertTableHeaderCellContains(3, 'Price Currency')
        cy.assertTableHeaderCellContains(4, 'Receive Currency')
        cy.assertTableHeaderCellContains(5, 'Payment Method')
      })

    cy.assertEmptyTableState()
  })

  it('Navigate to "Subscribers"', () => {
    cy.passBillingIntroduction()

    cy.clickOnMenuItem($.MENU.MERCHANT_BILLING_SUBSCRIBERS)

    cy.urlContains('/account/billing/subscribers')

    cy.breadcrumbContains('/Account/Merchant/Billing/Subscribers')

    cy.headerContains('Billing Subscribers')

    cy.get($.GENERAL.ALERT.MESSAGE)
      .should('not.exist')

    cy.assertMenuItemIsSelected($.MENU.MERCHANT_BILLING_SUBSCRIBERS)

    cy.contains('.ant-btn', 'New Billing Subscriber')
      .should('be.visible')

    cy.get('thead')
      .within(() => {
        cy.assertTableHeaderCellContains(0, 'ID')
        cy.assertTableHeaderCellContains(1, 'Email')
        cy.assertTableHeaderCellContains(2, 'Organisation Name')
        cy.assertTableHeaderCellContains(3, 'First Name')
        cy.assertTableHeaderCellContains(4, 'Last Name')
      })

    cy.assertEmptyTableState()
  })

  it('Navigate to "Subscriptions"', () => {
    cy.passBillingIntroduction()

    cy.clickOnMenuItem($.MENU.MERCHANT_BILLING_SUBSCRIPTIONS)

    cy.urlContains('/account/billing/subscriptions')

    cy.breadcrumbContains('/Account/Merchant/Billing/Subscriptions')

    cy.headerContains('Billing Subscriptions')

    cy.get($.GENERAL.ALERT.MESSAGE)
      .should('not.exist')

    cy.assertMenuItemIsSelected($.MENU.MERCHANT_BILLING_SUBSCRIPTIONS)

    cy.contains('.ant-btn', 'New Billing Subscription')
      .should('be.visible')

    cy.get('thead')
      .within(() => {
        cy.assertTableHeaderCellContains(0, 'ID')
        cy.assertTableHeaderCellContains(1, 'Details')
        cy.assertTableHeaderCellContains(2, 'Subscriber')
        cy.assertTableHeaderCellContains(3, 'Status')
        cy.assertTableHeaderCellContains(4, 'Payment Method')
        cy.assertTableHeaderCellContains(5, 'Next Delivery Date')
        cy.assertTableHeaderCellContains(6, 'Created')
      })

    cy.assertEmptyTableState()
  })

  it('Navigate to "Payments"', () => {
    cy.passBillingIntroduction()

    cy.clickOnMenuItem($.MENU.MERCHANT_BILLING_PAYMENTS)

    cy.urlContains('/account/billing/payments')

    cy.breadcrumbContains('/Account/Merchant/Billing/Payments')

    cy.headerContains('Billing Payments')

    cy.get($.GENERAL.ALERT.MESSAGE)
      .should('not.exist')

    cy.assertMenuItemIsSelected($.MENU.MERCHANT_BILLING_PAYMENTS)

    cy.get('thead')
      .within(() => {
        cy.assertTableHeaderCellContains(0, 'ID')
        cy.assertTableHeaderCellContains(1, 'Subscriptions')
        cy.assertTableHeaderCellContains(2, 'Status')
        cy.assertTableHeaderCellContains(3, 'Amount')
      })

    cy.assertEmptyTableState()
  })
})
