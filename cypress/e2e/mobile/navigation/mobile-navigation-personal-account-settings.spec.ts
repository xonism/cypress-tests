import $ from '@selectors/index'
import { generateTrader } from '@entity/entity-helper-functions'

describe('Mobile - Navigation - Account Settings - Personal  ', () => {
  const { email, password, countryCode } = generateTrader()

  const settingsHeader = `${email} settings`

  before(() => {
    cy.clearCookies()
    cy.registerAndConfirmEmailViaAPI(email, password, countryCode)
  })

  beforeEach(() => {
    cy.setMobileResolution()

    cy.loginViaAPI(email, password)

    cy.visit('/account/dashboard')

    cy.mobileClickOnMenu()

    cy.clickOnMenuItem($.MENU.ACCOUNT_SETTINGS)
  })

  it('[Mobile] Navigate to "Invoices"', () => {
    cy.clickOnMenuItem($.MENU.ACCOUNT_SETTINGS_INVOICES)

    cy.urlContains('/account/invoices')

    cy.breadcrumbContains('/Account/Invoices')

    cy.headerContains('Invoices')

    cy.mobileClickOnMenu()

    cy.assertMenuItemIsSelected($.MENU.ACCOUNT_SETTINGS_INVOICES)

    cy.mobileClickOnMenu()

    cy.get($.GENERAL.ALERT.MESSAGE)
      .should('be.visible')
  })

  it('[Mobile] Navigate to "Verification"', () => {
    cy.clickOnMenuItem($.MENU.ACCOUNT_SETTINGS_VERIFICATION)

    cy.urlContains('/account/settings/verification')

    cy.breadcrumbContains('/Account/Verification')

    cy.headerContains('Before you start')

    cy.assertTabIsActive('Verification')

    cy.get($.GENERAL.ALERT.MESSAGE)
      .should('not.exist')

    cy.mobileClickOnMenu()

    cy.assertMenuItemIsSelected($.MENU.ACCOUNT_SETTINGS_VERIFICATION)

    cy.mobileClickOnMenu()

    cy.get($.VERIFICATION.DROPDOWN.COUNTRY)
      .should('be.visible')

    cy.get($.VERIFICATION.DIV.TIER_CARD)
      .should('be.visible')

    cy.getButtonWithText('Start Tier 1 verification')
      .should('be.visible')
  })

  it('[Mobile] Navigate to "Uploaded Docs"', () => {
    cy.clickOnMenuItem($.MENU.ACCOUNT_SETTINGS_UPLOADED_DOCS)

    cy.urlContains('/account/uploaded_files')

    cy.breadcrumbContains('/Account/Uploaded Docs')

    cy.headerContains('Uploaded Files')

    cy.get($.GENERAL.ALERT.MESSAGE)
      .should('not.exist')

    cy.mobileClickOnMenu()

    cy.assertMenuItemIsSelected($.MENU.ACCOUNT_SETTINGS_UPLOADED_DOCS)

    cy.mobileClickOnMenu()

    cy.getButtonWithText('Upload New File')
      .should('be.visible')
  })

  it('[Mobile] Navigate to "Payout Settings"', () => {
    cy.clickOnMenuItem($.MENU.ACCOUNT_SETTINGS_PAYOUT_SETTINGS)

    cy.urlContains('/account/payout_settings')

    cy.breadcrumbContains('/Account/Payout Settings')

    cy.headerContains('Your payout settings')

    cy.get($.GENERAL.ALERT.MESSAGE)
      .should('not.exist')

    cy.mobileClickOnMenu()

    cy.assertMenuItemIsSelected($.MENU.ACCOUNT_SETTINGS_PAYOUT_SETTINGS)

    cy.mobileClickOnMenu()

    cy.get($.GENERAL.COLLAPSE.HEADER)
      .should('contain', 'Create a new payout setting')

    cy.get($.GENERAL.LIST_ITEM)
      .should('be.visible')

    cy.contains($.GENERAL.DIVIDER, 'Fiat')
      .should('be.visible')

    cy.contains($.GENERAL.DIVIDER, 'Crypto')
      .should('be.visible')

    cy.get('thead')
      .within(() => {
        cy.assertTableHeaderCellContains(1, 'Title')
        cy.assertTableHeaderCellContains(2, 'Status')
        cy.assertTableHeaderCellContains(3, 'Type')
        cy.assertTableHeaderCellContains(4, 'Weekly')
      })

    cy.assertEmptyTableState()
  })

  it('[Mobile] Navigate to "Referrals"', () => {
    cy.clickOnMenuItem($.MENU.ACCOUNT_SETTINGS_REFERRALS)

    cy.urlContains('/account/referrals')
    cy.breadcrumbContains('/Account/Referrals')

    cy.get($.GENERAL.ALERT.MESSAGE)
      .should('be.visible')
      .and('contain', 'We\'ve updated the referral program!')

    cy.mobileClickOnMenu()
    cy.assertMenuItemIsSelected($.MENU.ACCOUNT_SETTINGS_REFERRALS)
    cy.mobileClickOnMenu()

    cy.contains('.ant-col', 'Your Links')
      .within(() => {
        cy.assertEmptyTableState()

        cy.get('thead')
          .within(() => {
            cy.assertTableHeaderCellContains(1, 'Title')
            cy.assertTableHeaderCellContains(3, 'Link')
            cy.assertTableHeaderCellContains(4, 'Status')
          })

        cy.contains('.ant-btn', 'New Referral')
          .should('be.visible')
      })
  })

  it('[Mobile] Navigate to "Security"', () => {
    cy.clickOnMenuItem($.MENU.ACCOUNT_SETTINGS_SECURITY)

    cy.urlContains('/account/manage#security')

    cy.breadcrumbContains('/Account/User/Manage')

    cy.assertTabIsActive('Security')

    cy.get($.GENERAL.ALERT.MESSAGE)
      .should('not.exist')

    cy.contains('h1', settingsHeader)
      .should('be.visible')

    cy.contains($.GENERAL.ITEM, '2FA')
      .within(() => {
        cy.get($.GENERAL.SWITCH)
          .should('be.visible')
      })

    cy.contains($.GENERAL.ITEM, 'Social accounts')
      .should('contain', 'None')
  })
})
