import $ from '@selectors/index'
import { generateBusinessForAPI, generateTrader } from '@entity/entity-helper-functions'

describe('Mobile - Merchant - API - Apps - Create API App', () => {
  const { email, password, countryCode } = generateTrader()

  const business = generateBusinessForAPI()

  const appTitle = 'Auto Test App'
  const underpaidCover = '0.5'
  const enablePaidNotification = true

  before(() => {
    cy.clearCookies()
    cy.setUpVerifiedPersonalAccount(email, password, countryCode)

    cy.visit('/account/dashboard')
    cy.setUpVerifiedBusinessAccount(business)
  })

  beforeEach(() => {
    cy.setMobileResolution()

    cy.loginViaAPI(email, password)
  })

  it('[Mobile] Create API app', () => {
    cy.visit('/account/apps')

    cy.breadcrumbContains('/Account/Merchant/Apps')

    cy.headerContains('Apps')

    cy.mobileClickOnMenu()

    cy.clickOnMenuItem($.MENU.MERCHANT)

    cy.clickOnMenuItem($.MENU.MERCHANT_API)

    cy.assertMenuItemIsSelected($.MENU.MERCHANT_API_APPS)

    cy.mobileClickOnMenu()

    cy.get($.API_APP.BTN.NEW)
      .click()

    cy.urlContains('/account/apps/new')

    cy.breadcrumbContains('/Account/Merchant/Apps/New')

    cy.headerContains('New App')

    cy.get($.GENERAL.FORM.FORM)
      .should('be.visible')

    cy.get($.API_APP.INPUT.TITLE)
      .typeAndAssertValue(appTitle)

    cy.selectSettlementSetting('Default API / plugin settings')

    cy.get($.API_APP.DROPDOWN.INVOICE_TIME)
      .should('contain', '20 minutes')

    cy.get($.API_APP.INPUT.UNDERPAID_COVER)
      .typeAndAssertValue(underpaidCover)

    cy.assertSliderHandleHasValue(underpaidCover)

    if (enablePaidNotification) {
      cy.get($.API_APP.CHECKBOX.PAID_NOTIFICATION)
        .click()
        .should('be.checked')
    }

    cy.get($.API_APP.BTN.CREATE)
      .click()

    cy.getApiAppsViaAPI()
      .then((response) => {
        const apiAppID = response.body.data[0].id

        cy.urlContains(`/account/apps/${apiAppID}`)

        cy.breadcrumbContains(`/Account/Merchant/Apps/App #${apiAppID}`)

        cy.headerContains(`App #${apiAppID}`)

        cy.get($.API_APP.BTN.EDIT)
          .should('be.visible')

        cy.get($.API_APP.BTN.CURRENCY_SETTINGS)
          .should('be.visible')

        cy.contains($.GENERAL.ALERT.SUCCESS, 'Your API Credentials')
          .should('be.visible')

        cy.assertInputIsNotEmpty($.API_APP.INPUT.AUTH_TOKEN)

        cy.get($.API_APP.LINK.API_DOCUMENTATION)
          .should('be.visible')
          .invoke('attr', 'href')
          .should('contain', 'https://developer.coingate.com')

        cy.get($.GENERAL.CG_LIST)
          .should('be.visible')
          .within(() => {
            cy.get('tr')
              .should('have.length', 7)

            cy.assertTableHeaderCellContains(0, 'Name')
            cy.assertTableDataCellContains(0, appTitle)

            cy.assertTableHeaderCellContains(1, 'App ID')
            cy.assertTableDataCellContains(1, apiAppID)

            cy.assertTableHeaderCellContains(2, 'Invoice Time')
            cy.assertTableDataCellContains(2, '20')

            cy.assertTableHeaderCellContains(3, 'Underpaid Cover %')
            cy.assertTableDataCellContains(3, `${underpaidCover}%`)

            cy.assertTableHeaderCellContains(4, 'IP Whitelist')
            cy.assertTableDataCellContains(4, 'None')

            cy.assertTableHeaderCellContains(5, 'Send Paid Notification')
            cy.assertTableDataCellContains(5, 'Yes')

            cy.assertTableHeaderCellContains(6, 'Notification Emails')
            cy.assertTableDataCellIsEmpty(6)
          })
      })
  })

  after(() => {
    cy.deleteAllApiApps()
  })
})
