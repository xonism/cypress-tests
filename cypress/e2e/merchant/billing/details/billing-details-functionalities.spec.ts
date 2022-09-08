import $ from '@selectors/index'
import billingPaymentMethods from '@support/merchant/billing/billing-payment-methods'
import { generateBillingDetails, generateBillingDetailsItem } from '@support/merchant/billing/billing-helper-functions'
import { generateBusinessForAPI, generateTrader } from '@entity/entity-helper-functions'

describe('Billing - Billing Details - Functionalities', () => {
  const { email, password, countryCode } = generateTrader()

  const business = generateBusinessForAPI()

  const billingDetails = generateBillingDetails()
  const billingPaymentMethod = billingPaymentMethods.instant

  const billingItem = generateBillingDetailsItem()
  const { itemDescription, itemID, itemQuantity, itemPrice } = billingItem

  before(() => {
    cy.clearCookies()
    cy.setUpVerifiedPersonalAccount(email, password, countryCode)

    cy.visit('/account/dashboard')
    cy.setUpVerifiedBusinessAccount(business)

    cy.createBillingDetailsViaAPI(billingDetails, billingItem, billingPaymentMethod)
  })

  beforeEach(() => {
    cy.loginViaAPI(email, password)

    cy.passBillingIntroduction()

    cy.urlContains('/account/billing/details')

    cy.breadcrumbContains('/Account/Merchant/Billing/Details')

    cy.headerContains('Billing Details')

    cy.get('tbody tr')
      .should('have.length', 1)
      .click()

    cy.get($.GENERAL.DESCRIPTIONS.DESCRIPTIONS)
      .should('be.visible')
  })

  it('Check "Edit" functionality', () => {
    cy.getBillingDetailsViaAPI()
      .then((response) => {
        const billingDetailsID = response.body.data[0].id

        cy.urlContains(`/account/billing/details/${billingDetailsID}`)

        cy.breadcrumbContains(`/Account/Merchant/Billing/Details/${billingDetailsID}`)

        cy.headerContains(`Billing Details #${billingDetailsID}`)
      })

    cy.get($.BILLING.DETAILS.BTN.EDIT)
      .click()

    cy.getBillingDetailsViaAPI()
      .then((response) => {
        const billingDetailsID = response.body.data[0].id

        cy.urlContains(`/account/billing/details/${billingDetailsID}/edit`)

        cy.breadcrumbContains(`/Account/Merchant/Billing/Details/${billingDetailsID}/Edit`)

        cy.headerContains(`Edit Billing Details #${billingDetailsID}`)
      })

    cy.get($.GENERAL.FORM.FORM)
      .should('be.visible')

    cy.assertInputContains($.BILLING.DETAILS.INPUT.TITLE, billingDetails.title)

    cy.assertInputContains($.BILLING.DETAILS.INPUT.DESCRIPTION, billingDetails.description)

    cy.get($.BILLING.DETAILS.BTN.LESS_DETAILS)
      .should('contain', 'Less details')

    cy.assertInputContains($.BILLING.DETAILS.INPUT.CALLBACK_URL, billingDetails.callbackURL)

    cy.assertInputContains($.BILLING.DETAILS.INPUT.MERCHANT_ID, billingDetails.detailsID)

    cy.assertSliderHandleHasValue(billingDetails.underpaidCover)

    cy.assertInputContains($.BILLING.DETAILS.INPUT.UNDERPAID_COVER, billingDetails.underpaidCover)

    cy.get($.BILLING.DETAILS.DROPDOWN.PAYMENT_METHOD)
      .should('contain', billingPaymentMethod)

    cy.get($.BILLING.DETAILS.DROPDOWN.PRICE_CURRENCY)
      .should('contain', billingDetails.priceCurrency)

    cy.get($.BILLING.DETAILS.DROPDOWN.RECEIVE_CURRENCY)
      .should('contain', billingDetails.receiveCurrency)

    cy.get($.BILLING.DETAILS.BTN.REMOVE_ITEMS)
      .should('contain', 'Remove items')

    cy.assertInputContains($.BILLING.DETAILS.ITEM_0.INPUT.DESCRIPTION, itemDescription)

    cy.assertInputContains($.BILLING.DETAILS.ITEM_0.INPUT.MERCHANT_ID, itemID)

    cy.assertInputContains($.BILLING.DETAILS.ITEM_0.INPUT.QUANTITY, itemQuantity)

    cy.assertInputContains($.BILLING.DETAILS.ITEM_0.INPUT.PRICE, itemPrice)

    cy.get($.BILLING.DETAILS.BTN.ADD_ITEM)
      .should('be.visible')

    cy.get($.BILLING.DETAILS.BTN.SUBMIT_EDIT)
      .should('be.disabled')

    cy.get($.BILLING.DETAILS.INPUT.TITLE)
      .typeAndAssertValue('Edited Auto Test Billing Details Title')

    cy.get($.BILLING.DETAILS.BTN.SUBMIT_EDIT)
      .click()

    cy.get($.BILLING.DETAILS.BTN.EDIT)
      .should('be.visible')

    cy.urlContains('/account/billing/details/')

    cy.getBillingDetailsViaAPI()
      .then((response) => {
        const billingDetailsID = response.body.data[0].id

        cy.urlContains(`/account/billing/details/${billingDetailsID}`)

        cy.breadcrumbContains(`/Account/Merchant/Billing/Details/${billingDetailsID}`)

        cy.headerContains(`Billing Details #${billingDetailsID}`)
      })

    cy.assertContentNextToLabelContains('Title', 'Edited Auto Test Billing Details Title')
  })

  it('Check "Delete" functionality', () => {
    cy.get($.BILLING.DETAILS.BTN.DELETE)
      .click()

    cy.get($.GENERAL.POPOVER)
      .should('be.visible')
      .contains('button[type="button"]', 'Yes')
      .click()

    cy.get($.BILLING.DETAILS.BTN.NEW)
      .should('be.visible')

    cy.urlContains('/account/billing/details')

    cy.assertEmptyTableState()
  })
})
