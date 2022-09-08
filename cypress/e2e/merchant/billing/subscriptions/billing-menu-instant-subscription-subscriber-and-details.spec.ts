import $ from '@selectors/index'
import { fiatCurrencyCode } from '@fixtures/fiat-currency-info.json'
import { generateBillingDetails, generateBillingDetailsItem, generateSubscriber } from '@support/merchant/billing/billing-helper-functions'
import { generateBusinessForAPI, generateTrader } from '@entity/entity-helper-functions'

describe('Billing - Subscriptions - Instant - Menu - Subscriber & Details', () => {
  const { email, password, countryCode } = generateTrader()

  const business = generateBusinessForAPI()

  const dueDaysPeriod = '3'

  const billingSubscriber = generateSubscriber()

  const billingDetails = generateBillingDetails()

  const billingItem = generateBillingDetailsItem()
  const { itemDescription, itemID, itemQuantity, itemPrice } = billingItem

  before(() => {
    cy.clearCookies()
    cy.setUpVerifiedPersonalAccount(email, password, countryCode)

    cy.visit('/account/dashboard')
    cy.setUpVerifiedBusinessAccount(business)
  })

  beforeEach(() => {
    cy.loginViaAPI(email, password)
  })

  it('Create subscriber & details in instant bill from menu', () => {
    cy.visit('/account/dashboard')
    cy.breadcrumbContains('/Account/Dashboard')

    cy.passBillingIntroduction()

    cy.get($.MENU.CREATE_INSTANT_BILL)
      .should('be.visible')
      .click()

    cy.contains($.GENERAL.DRAWER.BODY, 'Instant Bill')
      .should('be.visible')

    cy.get($.BILLING.SUBSCRIBER.BTN.NEW_SUBSCRIBER)
      .should('be.visible')
      .click()

    cy.get($.BILLING.SUBSCRIBER.INPUT.EMAIL)
      .should('be.visible')

    cy.get($.BILLING.SUBSCRIBER.BTN.SEARCH)
      .should('be.visible')
      .click()

    cy.get($.BILLING.SUBSCRIBER.INPUT.EMAIL)
      .should('not.exist')

    cy.get($.BILLING.SUBSCRIBER.LINK.ADD_PAYER_FIRST)
      .should('be.visible')
      .click()

    cy.get($.BILLING.SUBSCRIBER.INPUT.EMAIL)
      .typeAndAssertValue(billingSubscriber.email)

    cy.get($.BILLING.SUBSCRIBER.INPUT.FIRST_NAME)
      .should('be.visible')

    cy.get($.BILLING.SUBSCRIBER.INPUT.LAST_NAME)
      .should('be.visible')

    cy.get($.BILLING.SUBSCRIBER.INPUT.COMPANY_NAME)
      .should('not.exist')

    cy.get($.BILLING.SUBSCRIBER.BTN.SPECIFY_COMPANY_NAME)
      .should('be.visible')
      .click()

    cy.get($.BILLING.SUBSCRIBER.INPUT.FIRST_NAME)
      .should('not.exist')

    cy.get($.BILLING.SUBSCRIBER.INPUT.LAST_NAME)
      .should('not.exist')

    cy.get($.BILLING.SUBSCRIBER.INPUT.COMPANY_NAME)
      .should('be.visible')

    cy.get($.BILLING.SUBSCRIBER.BTN.SPECIFY_PERSON_NAME)
      .should('be.visible')
      .click()

    cy.assertInputContains($.BILLING.SUBSCRIBER.INPUT.EMAIL, billingSubscriber.email)

    cy.get($.BILLING.SUBSCRIBER.BTN.MORE_DETAILS)
      .should('be.visible')
      .click()

    cy.get($.BILLING.SUBSCRIBER.BTN.LESS_DETAILS)
      .should('be.visible')

    cy.get($.BILLING.SUBSCRIBER.BTN.MORE_DETAILS)
      .should('not.exist')

    cy.get($.BILLING.SUBSCRIBER.INPUT.FIRST_NAME)
      .typeAndAssertValue(billingSubscriber.firstName)

    cy.get($.BILLING.SUBSCRIBER.INPUT.LAST_NAME)
      .typeAndAssertValue(billingSubscriber.lastName)

    cy.get($.BILLING.SUBSCRIBER.INPUT.ADDRESS)
      .typeAndAssertValue(billingSubscriber.address)

    cy.get($.BILLING.SUBSCRIBER.INPUT.SECONDARY_ADDRESS)
      .typeAndAssertValue(billingSubscriber.secondaryAddress)

    cy.get($.BILLING.SUBSCRIBER.INPUT.COUNTRY)
      .typeAndAssertValue(billingSubscriber.country)

    cy.get($.BILLING.SUBSCRIBER.INPUT.CITY)
      .typeAndAssertValue(billingSubscriber.city)

    cy.get($.BILLING.SUBSCRIBER.INPUT.POSTAL_CODE)
      .typeAndAssertValue(billingSubscriber.postalCode)

    cy.get($.BILLING.SUBSCRIBER.INPUT.MERCHANT_ID)
      .typeAndAssertValue(billingSubscriber.merchantID)

    cy.get($.BILLING.SUBSCRIPTION.BTN.SUBSCRIBER_CONTINUE)
      .should('be.visible')
      .click()

    cy.assertPayerCardContainsSubscriberInfo(billingSubscriber, false)

    cy.get($.BILLING.SUBSCRIBER.BTN.NEW_DETAILS)
      .should('be.visible')
      .click()

    cy.get($.BILLING.DETAILS.INPUT.TITLE)
      .should('be.visible')

    cy.get($.BILLING.DETAILS.BTN.SEARCH)
      .should('be.visible')
      .click()

    cy.get($.BILLING.DETAILS.INPUT.TITLE)
      .should('not.exist')

    cy.get($.BILLING.SUBSCRIBER.LINK.ADD_DETAILS_FIRST)
      .should('be.visible')
      .click()

    cy.get($.BILLING.DETAILS.INPUT.TITLE)
      .typeAndAssertValue(billingDetails.title)

    cy.get($.BILLING.DETAILS.BTN.MORE_DETAILS)
      .should('be.visible')
      .click()

    cy.get($.BILLING.DETAILS.BTN.LESS_DETAILS)
      .should('be.visible')

    cy.get($.BILLING.DETAILS.BTN.MORE_DETAILS)
      .should('not.exist')

    cy.get($.BILLING.DETAILS.INPUT.DESCRIPTION)
      .typeAndAssertValue(billingDetails.description)

    if (billingDetails.sendBillViaEmail) {
      cy.checkSendBillViaEmail()
    }

    cy.get($.BILLING.DETAILS.INPUT.CALLBACK_URL)
      .typeAndAssertValue(billingDetails.callbackURL)

    if (billingDetails.sendEmailPaidNotification) {
      cy.checkSendEmailPaidNotification()
    }

    cy.get($.BILLING.DETAILS.INPUT.MERCHANT_ID)
      .typeAndAssertValue(billingDetails.detailsID)

    cy.get($.BILLING.DETAILS.INPUT.UNDERPAID_COVER)
      .typeAndAssertValue(billingDetails.underpaidCover)

    cy.assertSliderHandleHasValue(billingDetails.underpaidCover)

    cy.get($.BILLING.DETAILS.BTN.ADD_ITEMS)
      .should('be.visible')
      .click()

    cy.get($.BILLING.DETAILS.BTN.REMOVE_ITEMS)
      .should('be.visible')

    cy.get($.BILLING.DETAILS.BTN.ADD_ITEMS)
      .should('not.exist')

    cy.selectBillingDetailsItemPriceCurrency(billingDetails.priceCurrency)

    cy.selectBillingDetailsItemReceiveCurrency(billingDetails.receiveCurrency)

    cy.get($.BILLING.DETAILS.ITEM_0.INPUT.DESCRIPTION)
      .typeAndAssertValue(itemDescription)

    cy.get($.BILLING.DETAILS.ITEM_0.INPUT.MERCHANT_ID)
      .typeAndAssertValue(itemID)

    cy.get($.BILLING.DETAILS.ITEM_0.INPUT.QUANTITY)
      .typeAndAssertValue(itemQuantity)

    cy.get($.BILLING.DETAILS.ITEM_0.INPUT.PRICE)
      .typeAndAssertValue(itemPrice)

    cy.get($.BILLING.SUBSCRIPTION.BTN.DETAILS_CONTINUE)
      .should('be.visible')
      .click()

    cy.assertPayerCardContainsSubscriberInfo(billingSubscriber, false)

    cy.assertPaymentCardContainsDetailsInfo(billingDetails, billingItem, fiatCurrencyCode)

    cy.get($.BILLING.SUBSCRIPTION.SWITCH.SEND_BILL_VIA_EMAIL)
      .should('be.visible')
      .and('have.class', 'ant-switch-checked')

    cy.get($.BILLING.SUBSCRIPTION.BTN.MORE_DETAILS)
      .should('be.visible')
      .click()

    cy.get($.BILLING.SUBSCRIPTION.BTN.LESS_DETAILS)
      .should('be.visible')

    cy.get($.BILLING.SUBSCRIPTION.BTN.MORE_DETAILS)
      .should('not.exist')

    cy.get($.BILLING.SUBSCRIPTION.INPUT.DUE_DAYS)
      .typeAndAssertValue(dueDaysPeriod)

    cy.get($.BILLING.SUBSCRIPTION.BTN.CREATE)
      .should('be.visible')
      .click()

    cy.assertSubscriptionDoneCardIsDisplayedCorrectly(billingSubscriber)

    cy.get($.BILLING.SUBSCRIPTION.BTN.DONE)
      .should('be.visible')

    cy.get($.BILLING.SUBSCRIPTION.BTN.CREATE_MORE)
      .should('be.visible')

    cy.visit('/account/billing/details')

    cy.breadcrumbContains('/Account/Merchant/Billing/Details')
    cy.headerContains('Billing Details')

    cy.getTableRow(0)
      .should('be.visible')
      .and('have.length', 1)
      .within(() => {
        cy.assertTableDataCellContains(1, billingDetails.title)
        cy.assertTableDataCellContains(2, billingDetails.detailsID)
        cy.assertTableDataCellContains(5, 'instant')
      })

    cy.visit('/account/billing/subscribers')

    cy.breadcrumbContains('/Account/Merchant/Billing/Subscribers')
    cy.headerContains('Billing Subscribers')

    cy.getTableRow(0)
      .should('be.visible')
      .and('have.length', 1)
      .within(() => {
        cy.assertTableDataCellContains(1, billingSubscriber.email)
        cy.assertTableDataCellContains(3, billingSubscriber.firstName)
        cy.assertTableDataCellContains(4, billingSubscriber.lastName)
      })

    cy.visit('/account/billing/subscriptions')

    cy.breadcrumbContains('/Account/Merchant/Billing/Subscriptions')
    cy.headerContains('Billing Subscriptions')

    cy.getTableRow(0)
      .should('be.visible')
      .and('have.length', 1)
      .within(() => {
        cy.assertTableDataCellContains(1, billingDetails.title)
        cy.assertTableDataCellContains(2, billingSubscriber.email)
        cy.assertTableDataCellContains(4, 'instant')
      })
  })

  after(() => {
    cy.deleteAllBillingDetails()
    cy.deleteAllSubscribers()
    cy.deleteAllSubscriptions()
  })
})
