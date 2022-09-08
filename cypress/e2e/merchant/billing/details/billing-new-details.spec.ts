import $ from '@selectors/index'
import billingPaymentMethods from '@support/merchant/billing/billing-payment-methods'
import { cryptoCurrencySymbol } from '@fixtures/crypto-currency-info.json'
import { fiatCurrencyCode } from '@fixtures/fiat-currency-info.json'
import { generateBillingDetails, generateBillingDetailsItem } from '@support/merchant/billing/billing-helper-functions'
import { generateBusinessForAPI, generateTrader } from '@entity/entity-helper-functions'

describe('Billing - Billing Details', () => {
  const { email, password, countryCode } = generateTrader()

  const business = generateBusinessForAPI()

  const billingDetails = generateBillingDetails()

  const { itemDescription, itemID, itemQuantity, itemPrice } = generateBillingDetailsItem()

  before(() => {
    cy.clearCookies()
    cy.setUpVerifiedPersonalAccount(email, password, countryCode)

    cy.visit('/account/dashboard')
    cy.setUpVerifiedBusinessAccount(business)
  })

  beforeEach(() => {
    cy.loginViaAPI(email, password)
  })

  for (const billingPaymentMethod in billingPaymentMethods) {
    it(`Create ${billingPaymentMethod} billing details`, () => {
      cy.passBillingIntroduction()

      cy.urlContains('/account/billing/details')

      cy.breadcrumbContains('/Account/Merchant/Billing/Details')

      cy.headerContains('Billing Details')

      cy.get($.BILLING.DETAILS.BTN.NEW)
        .click()

      cy.urlContains('/account/billing/details/new')

      cy.breadcrumbContains('/Account/Merchant/Billing/Details/New')

      cy.headerContains('New Billing Details')

      cy.get($.GENERAL.FORM.FORM)
        .should('be.visible')

      cy.get($.BILLING.DETAILS.INPUT.TITLE)
        .typeAndAssertValue(billingDetails.title)

      cy.get($.BILLING.DETAILS.INPUT.DESCRIPTION)
        .typeAndAssertValue(billingDetails.description)

      if (billingDetails.sendBillViaEmail) {
        cy.get($.BILLING.DETAILS.SWITCH.BILL_VIA_EMAIL)
          .click()
          .should('have.class', 'ant-switch-checked')
      }

      cy.get($.BILLING.DETAILS.BTN.MORE_DETAILS)
        .click()

      cy.get($.BILLING.DETAILS.INPUT.CALLBACK_URL)
        .typeAndAssertValue(billingDetails.callbackURL)

      if (billingDetails.sendEmailPaidNotification) {
        cy.get($.BILLING.DETAILS.SWITCH.PAID_EMAIL_NOTIFICATION)
          .click()
          .should('have.class', 'ant-switch-checked')
      }

      cy.get($.BILLING.DETAILS.INPUT.MERCHANT_ID)
        .typeAndAssertValue(billingDetails.detailsID)

      cy.get($.BILLING.DETAILS.INPUT.UNDERPAID_COVER)
        .typeAndAssertValue(billingDetails.underpaidCover)

      cy.assertSliderHandleHasValue(billingDetails.underpaidCover)

      cy.get($.BILLING.DETAILS.BTN.ADD_ITEMS)
        .click()

      cy.get($.BILLING.DETAILS.DROPDOWN.PAYMENT_METHOD)
        .click()

      cy.contains(`${$.GENERAL.DROPDOWN.SELECT_DROPDOWN_MENU_ITEM}:visible`, billingPaymentMethod)
        .should('be.visible')
        .click()

      cy.get($.BILLING.DETAILS.DROPDOWN.PAYMENT_METHOD)
        .should('contain', billingPaymentMethod)

      cy.get($.BILLING.DETAILS.DROPDOWN.PRICE_CURRENCY)
        .click()

      cy.contains(`${$.GENERAL.DROPDOWN.SELECT_DROPDOWN_MENU_ITEM}:visible`, billingDetails.priceCurrency)
        .should('be.visible')
        .click()

      cy.get($.BILLING.DETAILS.DROPDOWN.PRICE_CURRENCY)
        .should('contain', billingDetails.priceCurrency)

      cy.get($.BILLING.DETAILS.DROPDOWN.RECEIVE_CURRENCY)
        .click()

      cy.contains(`${$.GENERAL.DROPDOWN.SELECT_DROPDOWN_MENU_ITEM}:visible`, billingDetails.receiveCurrency)
        .should('be.visible')
        .click()

      cy.get($.BILLING.DETAILS.DROPDOWN.RECEIVE_CURRENCY)
        .should('contain', billingDetails.receiveCurrency)

      cy.get($.BILLING.DETAILS.ITEM_0.INPUT.DESCRIPTION)
        .typeAndAssertValue(itemDescription)

      cy.get($.BILLING.DETAILS.ITEM_0.INPUT.MERCHANT_ID)
        .typeAndAssertValue(itemID)

      cy.get($.BILLING.DETAILS.ITEM_0.INPUT.QUANTITY)
        .typeAndAssertValue(itemQuantity)

      cy.get($.BILLING.DETAILS.ITEM_0.INPUT.PRICE)
        .typeAndAssertValue(itemPrice)

      cy.get($.BILLING.DETAILS.BTN.SUBMIT)
        .click()

      cy.get($.BILLING.DETAILS.BTN.EDIT)
        .should('be.visible')

      cy.get($.BILLING.DETAILS.BTN.DELETE)
        .should('be.visible')

      cy.getBillingDetailsViaAPI()
        .then((response) => {
          const billingDetailsID = response.body.data[0].id

          cy.urlContains(`/account/billing/details/${billingDetailsID}`)

          cy.breadcrumbContains(`/Account/Merchant/Billing/Details/${billingDetailsID}`)

          cy.headerContains(`Billing Details #${billingDetailsID}`)

          cy.assertContentNextToLabelContains('ID', billingDetailsID)
        })

      cy.get($.GENERAL.DESCRIPTIONS.DESCRIPTIONS)
        .should('be.visible')

      cy.contains($.GENERAL.DESCRIPTIONS.DESCRIPTIONS, 'Details')
        .within(() => {
          cy.assertContentNextToLabelContains('Details ID', billingDetails.detailsID)

          cy.assertContentNextToLabelContains('Title', billingDetails.title)

          cy.assertContentNextToLabelContains('Description', billingDetails.description)

          cy.assertContentNextToLabelContains('Underpaid Cover', billingDetails.underpaidCover)

          cy.assertContentNextToLabelContains('Payment Method', billingPaymentMethod)

          cy.assertContentNextToLabelContains('Price Currency', fiatCurrencyCode)

          cy.assertContentNextToLabelContains('Receive Currency', cryptoCurrencySymbol)

          cy.assertContentNextToLabelContains('Send Paid Notification', billingDetails.sendEmailPaidNotification ? 'True' : 'False')

          cy.assertContentNextToLabelContains('Send Payment Email', billingDetails.sendBillViaEmail ? 'True' : 'False')

          cy.assertContentNextToLabelContains('Callback URL', billingDetails.callbackURL)
        })

      cy.contains($.GENERAL.TABLE.TABLE, 'Items')
        .should('be.visible')
        .within(() => {
          cy.get('thead')
            .within(() => {
              cy.assertTableHeaderCellContains(0, 'Description')
              cy.assertTableHeaderCellContains(1, 'Item ID')
              cy.assertTableHeaderCellContains(2, 'Quantity')
              cy.assertTableHeaderCellContains(3, 'Price')
            })

          cy.get('tbody')
            .within(() => {
              cy.assertTableDataCellContains(0, itemDescription)
              cy.assertTableDataCellContains(1, itemID)
              cy.assertTableDataCellContains(2, itemQuantity)
              cy.assertTableDataCellContains(3, `${itemPrice} ${fiatCurrencyCode}`)
            })
        })
    })
  }

  after(() => {
    cy.deleteAllBillingDetails()
  })
})
