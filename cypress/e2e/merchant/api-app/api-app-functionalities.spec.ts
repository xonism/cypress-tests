import $ from '@selectors/index'
import { extractNumber } from '@support/trader/limit-helper-functions'
import { generateBusinessForAPI, generateTrader } from '@entity/entity-helper-functions'

describe('Merchant - API - API App - Functionalities', () => {
  const { email, password, countryCode } = generateTrader()

  const business = generateBusinessForAPI()

  before(() => {
    cy.clearCookies()
    cy.setUpVerifiedPersonalAccount(email, password, countryCode)

    cy.visit('/account/dashboard')
    cy.setUpVerifiedBusinessAccount(business)

    cy.createApiAppViaAPI()
  })

  beforeEach(() => {
    cy.loginViaAPI(email, password)

    cy.visit('/account/apps')

    cy.get($.GENERAL.LIST_ITEM)
      .should('have.length', 1)
      .and('be.visible')
  })

  it('Check "Edit" button functionality', () => {
    cy.get($.GENERAL.LIST_ITEM_META_TITLE)
      .invoke('text')
      .should('contain', 'Auto Test App')
      .then((titleText) => {
        const apiAppNumber = extractNumber(titleText)

        cy.get($.GENERAL.ICON.EDIT)
          .click()

        cy.urlContains(`/account/apps/${apiAppNumber}/edit`)

        cy.contains('h1', `App #${apiAppNumber}`)
          .should('be.visible')
      })

    cy.assertTabIsActive('Settings')

    cy.contains($.GENERAL.TAB, 'Currency Settings')
      .should('be.visible')

    cy.get($.GENERAL.FORM.FORM)
      .should('be.visible')

    cy.assertInputContains($.API_APP.INPUT.TITLE, 'Auto Test App')

    cy.selectSettlementSetting('Default API / plugin settings')

    cy.get($.API_APP.DROPDOWN.INVOICE_TIME)
      .should('contain', '20 minutes')

    cy.assertSliderHandleHasValue('0')

    cy.get($.API_APP.INPUT.UNDERPAID_COVER)
      .invoke('val')
      .should('equal', '0')

    cy.get($.API_APP.CHECKBOX.PAID_NOTIFICATION)
      .should('not.be.checked')

    cy.get($.API_APP.INPUT.TITLE)
      .typeAndAssertValue('Edited Auto Test App')

    cy.get($.API_APP.BTN.UPDATE)
      .click()

    cy.visit('/account/apps')

    cy.breadcrumbContains('/Account/Merchant/Apps')

    cy.headerContains('Apps')

    cy.get($.GENERAL.LIST_ITEM_META_TITLE)
      .should('contain', 'Edited Auto Test App')
  })

  it('Check "Disable" & "Enable" button functionality', () => {
    cy.get($.GENERAL.ICON.LOCK)
      .click()

    cy.get($.GENERAL.TAG)
      .should('be.visible')
      .and('contain', 'Disabled')

    cy.get($.GENERAL.ICON.LOCK)
      .should('not.exist')

    cy.get($.GENERAL.ICON.UNLOCK)
      .should('be.visible')
      .click()

    cy.get($.GENERAL.TAG)
      .should('not.exist')

    cy.get($.GENERAL.ICON.UNLOCK)
      .should('not.exist')

    cy.get($.GENERAL.ICON.LOCK)
      .should('be.visible')
  })

  it('Check "Delete" button functionality', () => {
    cy.get($.GENERAL.ICON.DELETE)
      .click()

    cy.get($.GENERAL.MODAL.BODY)
      .within(() => {
        cy.getButtonWithText('Yes')
          .click()
      })

    cy.get($.GENERAL.LIST_ITEM)
      .should('not.exist')

    cy.assertEmptyTableState()
  })
})
