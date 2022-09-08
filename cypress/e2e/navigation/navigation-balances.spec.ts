import $ from '@selectors/index'
import { generateTrader } from '@entity/entity-helper-functions'

describe('Navigation - Balances', () => {
  const { email, password, countryCode } = generateTrader()

  before(() => {
    cy.clearCookies()
    cy.registerAndConfirmEmailViaAPI(email, password, countryCode)
  })

  beforeEach(() => {
    cy.loginViaAPI(email, password)

    cy.visit('/account/dashboard')

    cy.clickOnMenuItem($.MENU.BALANCES)
  })

  it('Navigate to "Accounts"', () => {
    cy.clickOnMenuItem($.MENU.BALANCES_ACCOUNTS)

    cy.urlContains('/account/balances')

    cy.breadcrumbContains('/Account/Balances/Accounts')

    cy.headerContains('Balances')

    cy.get($.GENERAL.ALERT.MESSAGE)
      .should('not.exist')

    cy.contains('.ant-empty', 'You don\'t have any balances to withdraw')
      .within(() => {
        cy.assertEmptyTableState('You don\'t have any balances to withdraw')
      })

    cy.contains('h3', 'Balance withdrawals')
      .should('be.visible')

    cy.get($.BALANCES.TABLE.BALANCE_WITHDRAWALS)
      .should('be.visible')
      .within(() => {
        cy.get('th')
          .should('have.length', 6)

        cy.assertTableHeaderCellContains(0, 'ID')
        cy.assertTableHeaderCellContains(1, 'Status')
        cy.assertTableHeaderCellContains(2, 'Amount')
        cy.assertTableHeaderCellContains(3, 'Category')
        cy.assertTableHeaderCellContains(4, 'Payout Setting')
        cy.assertTableHeaderCellContains(5, 'Created')
      })

    cy.get($.GENERAL.EMPTY.EMPTY)
      .eq(1)
      .within(() => {
        cy.assertEmptyTableState()
      })
  })

  it('Navigate to "Transactions"', () => {
    cy.clickOnMenuItem($.MENU.BALANCES_TRANSACTIONS)

    cy.urlContains('/account/balances/transactions')

    cy.breadcrumbContains('/Account/Balances/Transactions')

    cy.headerContains('Transactions')

    cy.get($.GENERAL.ALERT.MESSAGE)
      .should('not.exist')

    cy.get($.BALANCES.DROPDOWN.FILTER_CRYPTO)
      .should('be.visible')

    cy.get($.BALANCES.DROPDOWN.FILTER_DATE)
      .should('be.visible')

    cy.get($.BALANCES.BTN.APPLY_FILTERS)
      .should('be.visible')

    cy.get($.BALANCES.TABLE.TRANSACTIONS)
      .should('be.visible')
      .within(() => {
        cy.get('th')
          .should('have.length', 4)

        cy.assertTableHeaderCellContains(0, 'Account')
        cy.assertTableHeaderCellContains(1, 'Amount')
        cy.assertTableHeaderCellContains(2, 'Created')
        cy.assertTableHeaderCellContains(3, 'Notes')
      })

    cy.assertEmptyTableState()
  })
})
