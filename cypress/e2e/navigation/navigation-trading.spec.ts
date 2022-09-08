import $ from '@selectors/index'
import { generateTrader } from '@entity/entity-helper-functions'

describe('Navigation - Trading', () => {
  const { email, password, countryCode } = generateTrader()

  before(() => {
    cy.clearCookies()
    cy.registerAndConfirmEmailViaAPI(email, password, countryCode)
  })

  beforeEach(() => {
    cy.loginViaAPI(email, password)

    cy.visit('/account/dashboard')

    cy.clickOnMenuItem($.MENU.TRADING)
  })

  it('Navigate to "Buy & Sell"', () => {
    cy.clickOnMenuItem($.MENU.TRADING_BUY_AND_SELL)

    cy.urlContains('/account/trader/trade')

    cy.breadcrumbContains('/Account/Trader/Buy & Sell')

    cy.get($.GENERAL.ALERT.MESSAGE)
      .should('not.exist')

    cy.assertMenuItemIsSelected($.MENU.TRADING_BUY_AND_SELL)

    cy.get($.TRADER.DIV.PAYMENT_METHODS)
      .should('be.visible')

    cy.get($.TRADER.BTN.BUY)
      .should('be.visible')
      .and('have.class', 'active')

    cy.get($.TRADER.BTN.SELL)
      .should('be.visible')

    cy.get($.TRADER.BTN.EXCHANGE)
      .should('be.visible')

    cy.contains($.GENERAL.CARD, 'Select your registration country')
      .should('be.visible')

    cy.contains('div', 'Account limits apply')
      .should('be.visible')

    cy.contains($.GENERAL.CARD, 'Order Details')
      .should('be.visible')

    cy.get($.GENERAL.DISCLAIMER)
      .should('be.visible')

    cy.get($.TRADER.BUY.INPUT.PAY_AMOUNT)
      .should('be.visible')

    cy.get($.TRADER.BUY.DROPDOWN.SELL_CURRENCY)
      .should('be.visible')

    cy.get($.TRADER.BUY.INPUT.RECEIVE_AMOUNT)
      .should('be.visible')

    cy.get($.TRADER.BUY.DROPDOWN.RECEIVE_CURRENCY)
      .should('be.visible')

    cy.get($.TRADER.BUY.BTN.SUBMIT_BUY)
      .should('be.visible')
  })

  it('Navigate to "Orders"', () => {
    cy.clickOnMenuItem($.MENU.TRADING_ORDERS)

    cy.urlContains('/account/trader/orders')

    cy.breadcrumbContains('/Account/Trading/Orders')

    cy.headerContains('Trading Orders')

    cy.get($.GENERAL.ALERT.MESSAGE)
      .should('not.exist')

    cy.assertMenuItemIsSelected($.MENU.TRADING_ORDERS)

    cy.get($.MERCHANT.INPUT.ORDER_ID)
      .should('be.visible')

    cy.get($.MERCHANT.INPUT.ADDRESS)
      .should('be.visible')

    cy.get($.MERCHANT.INPUT.WITHDRAWAL_ID)
      .should('be.visible')

    cy.get($.MERCHANT.BTN.APPLY_FILTERS)
      .should('be.visible')

    cy.get('thead')
      .within(() => {
        cy.get('th')
          .should('have.length', 7)

        cy.assertTableHeaderCellContains(0, 'ID')
        cy.assertTableHeaderCellContains(1, 'Order Status')
        cy.assertTableHeaderCellContains(2, 'Withdrawal Status')
        cy.assertTableHeaderCellContains(3, 'Category')
        cy.assertTableHeaderCellContains(4, 'Amount')
        cy.assertTableHeaderCellContains(5, 'Created')
      })

    cy.get($.GENERAL.ICON.FILTER)
      .should('have.length', 3)

    cy.assertEmptyTableState()
  })

  it('Navigate to "Mobile Orders"', () => {
    cy.clickOnMenuItem($.MENU.TRADING_MOBILE_ORDERS)

    cy.urlContains('/account/trader/mobile_orders')

    cy.breadcrumbContains('/Account/Trading/Mobile Orders')

    cy.headerContains('Mobile Orders')

    cy.get($.GENERAL.ALERT.MESSAGE)
      .should('not.exist')

    cy.assertMenuItemIsSelected($.MENU.TRADING_MOBILE_ORDERS)

    cy.get('thead')
      .within(() => {
        cy.get('th')
          .should('have.length', 6)

        cy.assertTableHeaderCellContains(0, 'ID')
        cy.assertTableHeaderCellContains(1, 'Order Status')
        cy.assertTableHeaderCellContains(2, 'Withdrawal Status')
        cy.assertTableHeaderCellContains(3, 'Category')
        cy.assertTableHeaderCellContains(4, 'Amount')
        cy.assertTableHeaderCellContains(5, 'Created')
      })

    cy.assertEmptyTableState()
  })
})
