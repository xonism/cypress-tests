import $ from '@selectors/index'
import { generateBusinessForAPI, generateTrader } from '@entity/entity-helper-functions'

describe('Navigation - Merchant', () => {
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
  })

  it('Navigate to "Orders"', () => {
    cy.clickOnMenuItem($.MENU.MERCHANT_ORDERS)

    cy.urlContains('/account/orders')

    cy.breadcrumbContains('/Account/Merchant/Orders')

    cy.headerContains('Merchant Orders')

    cy.get($.GENERAL.ALERT.MESSAGE)
      .should('not.exist')

    cy.assertMenuItemIsSelected($.MENU.MERCHANT_ORDERS)

    cy.get($.MERCHANT.INPUT.ORDER_ID)
      .should('be.visible')

    cy.get($.MERCHANT.INPUT.MERCHANT_ORDER_ID)
      .should('be.visible')

    cy.get($.MERCHANT.INPUT.TITLE)
      .should('be.visible')

    cy.get($.MERCHANT.INPUT.ADDRESS)
      .should('be.visible')

    cy.get($.MERCHANT.INPUT.WITHDRAWAL_ID)
      .should('be.visible')

    cy.get($.MERCHANT.BTN.APPLY_FILTERS)
      .should('be.visible')

    cy.get($.MERCHANT.BTN.CLEAR_FILTERS)
      .should('be.visible')

    cy.get('thead')
      .within(() => {
        cy.assertTableHeaderCellContains(0, 'ID')
        cy.assertTableHeaderCellContains(1, 'Type')
        cy.assertTableHeaderCellContains(2, 'Title')
        cy.assertTableHeaderCellContains(3, 'Price')
        cy.assertTableHeaderCellContains(4, 'Pay Amount')
        cy.assertTableHeaderCellContains(5, 'Status')
        cy.assertTableHeaderCellContains(6, 'Created')
        cy.assertTableHeaderCellContains(7, 'Paid')
        cy.assertTableHeaderCellContains(8, 'Credit')
        cy.assertTableHeaderCellContains(9, 'Issue a refund')
        cy.assertTableHeaderCellContains(10, 'Generate Invoice')
      })

    cy.get($.GENERAL.ICON.FILTER)
      .should('have.length', 3)

    cy.assertEmptyTableState()
  })

  it('Navigate to "Withdrawals"', () => {
    cy.clickOnMenuItem($.MENU.MERCHANT_WITHDRAWALS)

    cy.urlContains('/account/withdrawals')

    cy.breadcrumbContains('/Account/Merchant/Withdrawals')

    cy.assertTabIsActive('Withdrawals')

    cy.get($.GENERAL.ALERT.MESSAGE)
      .should('not.exist')

    cy.assertMenuItemIsSelected($.MENU.MERCHANT_WITHDRAWALS)

    cy.get($.MERCHANT.INPUT.WITHDRAWAL_ID)
      .should('be.visible')

    cy.get($.MERCHANT.WITHDRAWALS.INPUT.PAYOUT_SETTING)
      .should('be.visible')

    cy.get($.MERCHANT.BTN.APPLY_FILTERS)
      .should('be.visible')

    cy.get('thead')
      .within(() => {
        cy.assertTableHeaderCellContains(0, 'ID')
        cy.assertTableHeaderCellContains(1, 'Status')
        cy.assertTableHeaderCellContains(2, 'Amount')
        cy.assertTableHeaderCellContains(3, 'Payout Setting')
        cy.assertTableHeaderCellContains(4, 'Created')
      })

    cy.get($.GENERAL.ICON.FILTER)
      .should('have.length', 2)

    cy.assertEmptyTableState()
  })

  it('Navigate to "Point of Sale"', () => {
    cy.clickOnMenuItem($.MENU.MERCHANT_POINT_OF_SALE)

    cy.urlContains('/account/pos')

    cy.breadcrumbContains('/Account/Merchant/Points of Sale')

    cy.headerContains('Points of Sale')

    cy.get($.GENERAL.ALERT.MESSAGE)
      .should('not.exist')

    cy.assertMenuItemIsSelected($.MENU.MERCHANT_POINT_OF_SALE)

    cy.get('.inner p')
      .should('be.visible')

    cy.contains('.ant-btn', 'Request POS Access')
      .should('be.visible')
  })

  it('Navigate to "Payment Buttons"', () => {
    cy.clickOnMenuItem($.MENU.MERCHANT_PAYMENT_BUTTONS)

    cy.urlContains('/account/buttons')

    cy.breadcrumbContains('/Account/Merchant/Buttons')

    cy.headerContains('Payment Buttons')

    cy.get($.GENERAL.ALERT.MESSAGE)
      .should('not.exist')

    cy.assertMenuItemIsSelected($.MENU.MERCHANT_PAYMENT_BUTTONS)

    cy.contains('.ant-btn', 'New Payment Button')
      .should('be.visible')

    cy.get('thead')
      .within(() => {
        cy.assertTableHeaderCellContains(0, 'ID')
        cy.assertTableHeaderCellContains(1, 'Title')
        cy.assertTableHeaderCellContains(2, 'Name ID')
        cy.assertTableHeaderCellContains(3, 'Kind')
        cy.assertTableHeaderCellContains(4, 'Prices')
        cy.assertTableHeaderCellContains(5, 'Currency (Price)')
      })

    cy.assertEmptyTableState()
  })

  it('Navigate to "Plugins"', () => {
    cy.clickOnMenuItem($.MENU.MERCHANT_PLUGINS)

    cy.urlContains('coingate.com/plugins')

    cy.get('.intro__content__part-text')
      .should('be.visible')
  })

  it('Navigate to "Refunds"', () => {
    cy.clickOnMenuItem($.MENU.MERCHANT_REFUNDS)

    cy.urlContains('/account/refunds')

    cy.breadcrumbContains('/Account/Merchant/Refunds')

    cy.headerContains('Merchant Refunds')

    cy.get('thead')
      .within(() => {
        cy.get('th')
          .should('have.length', 8)

        cy.assertTableHeaderCellContains(0, 'ID')
        cy.assertTableHeaderCellContains(1, 'Order ID')
        cy.assertTableHeaderCellContains(2, 'Requested Amount')
        cy.assertTableHeaderCellContains(3, 'Refund Amount')
        cy.assertTableHeaderCellContains(4, 'Balance Debit')
        cy.assertTableHeaderCellContains(5, 'Status')
        cy.assertTableHeaderCellContains(6, 'Created at')
      })

    cy.assertEmptyTableState()
  })
})
