import $ from '@selectors/index'
import { generateBusinessForAPI, generateTrader } from '@entity/entity-helper-functions'

describe('Mobile - Merchant - API - API App - Functionalities', () => {
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
    cy.setMobileResolution()

    cy.loginViaAPI(email, password)

    cy.visit('/account/apps')

    cy.get($.GENERAL.LIST_ITEM)
      .should('be.visible')
      .and('have.length', 1)

    cy.mobileClickOnMoreOptions()
  })

  it('[Mobile] Check "Edit" button functionality', () => {
    cy.getApiAppsViaAPI()
      .then((response) => {
        const apiAppID = response.body.data[0].id

        cy.contains($.GENERAL.DROPDOWN.DROPDOWN_MENU_ITEM, 'Edit')
          .click()

        cy.urlContains(`/account/apps/${apiAppID}/edit`)

        cy.contains('h1', `App #${apiAppID}`)
          .should('be.visible')
      })

    cy.assertTabIsActive('Settings')

    cy.get($.GENERAL.FORM.FORM)
      .should('be.visible')

    cy.assertInputContains($.API_APP.INPUT.TITLE, 'Auto Test App')

    cy.contains($.GENERAL.BTN.RADIO_WRAPPER, 'Default API / plugin settings')
      .should('have.class', 'ant-radio-button-wrapper-checked')

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

  it('[Mobile] Check "Disable" & "Enable" button functionality', () => {
    cy.contains($.GENERAL.DROPDOWN.DROPDOWN_MENU_ITEM, 'Disable')
      .should('be.visible')
      .click()

    cy.contains($.GENERAL.TAG, 'Disabled')
      .should('be.visible')

    cy.mobileClickOnMoreOptions()

    cy.contains($.GENERAL.DROPDOWN.DROPDOWN_MENU_ITEM, 'Disable')
      .should('not.exist')

    cy.contains($.GENERAL.DROPDOWN.DROPDOWN_MENU_ITEM, 'Enable')
      .should('be.visible')
      .click()

    cy.contains('.ant-tag', 'Disabled')
      .should('not.exist')

    cy.mobileClickOnMoreOptions()

    cy.contains($.GENERAL.DROPDOWN.DROPDOWN_MENU_ITEM, 'Enable')
      .should('not.exist')

    cy.contains($.GENERAL.DROPDOWN.DROPDOWN_MENU_ITEM, 'Disable')
      .should('be.visible')
  })

  it('[Mobile] Check "Delete" button functionality', () => {
    cy.contains($.GENERAL.DROPDOWN.DROPDOWN_MENU_ITEM, 'Delete')
      .should('be.visible')
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
