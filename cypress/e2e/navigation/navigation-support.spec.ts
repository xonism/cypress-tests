import $ from '@selectors/index'
import { generateTrader } from '@entity/entity-helper-functions'

describe('Navigation - Support', () => {
  const { email, password, countryCode } = generateTrader()

  before(() => {
    cy.clearCookies()
    cy.registerAndConfirmEmailViaAPI(email, password, countryCode)
  })

  beforeEach(() => {
    cy.loginViaAPI(email, password)

    cy.visit('/account/dashboard')

    cy.clickOnMenuItem($.MENU.SUPPORT)
  })

  it('Navigate to "FAQ"', () => {
    cy.contains('a', 'FAQ')
      .should('be.visible')
      .and('have.attr', 'href', 'https://support.coingate.com/')
      .and('have.attr', 'rel', 'noopener noreferrer')
      .and('have.attr', 'target', '_blank') // cypress can't open new tabs
  })

  it('Navigate to "Support Tickets"', () => {
    cy.clickOnMenuItem($.MENU.SUPPORT_TICKETS)

    cy.urlContains('/account/tickets')

    cy.breadcrumbContains('/Account/Support Tickets')

    cy.headerContains('Tickets')

    cy.get($.GENERAL.ALERT.MESSAGE)
      .should('not.exist')

    cy.assertMenuItemIsSelected($.MENU.SUPPORT_TICKETS)

    cy.contains('.ant-btn', 'Create New Ticket')
      .should('be.visible')

    cy.get('thead')
      .within(() => {
        cy.assertTableHeaderCellContains(0, 'ID')
        cy.assertTableHeaderCellContains(1, 'Subject')
        cy.assertTableHeaderCellContains(2, 'Source')
        cy.assertTableHeaderCellContains(3, 'Created')
      })

    cy.assertEmptyTableState()
  })
})
