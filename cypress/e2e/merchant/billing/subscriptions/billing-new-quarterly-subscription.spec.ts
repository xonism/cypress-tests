import $ from '@selectors/index'
import billingPaymentMethods from '@support/merchant/billing/billing-payment-methods'
import { cryptoCurrencySymbol } from '@fixtures/crypto-currency-info.json'
import { fiatCurrencyCode } from '@fixtures/fiat-currency-info.json'
import {
  generateBillingDetails,
  generateBillingDetailsItem,
  generateSubscriber,
  getEndDate,
  getFormattedDateNumber,
  getStartDate
} from '@support/merchant/billing/billing-helper-functions'
import { generateBusinessForAPI, generateTrader } from '@entity/entity-helper-functions'
import { generateRandomNumber } from '@support/helper-functions'

describe('Billing - Billing Subscriptions - Quarterly', () => {
  const { email, password, countryCode } = generateTrader()

  const business = generateBusinessForAPI()

  const dueDaysPeriod = '3'

  const billingSubscriber = generateSubscriber()

  const billingDetails = generateBillingDetails()
  const billingPaymentMethod = billingPaymentMethods.quarterly

  const billingItem = generateBillingDetailsItem()
  const { itemDescription, itemID, itemQuantity, itemPrice } = billingItem

  const merchantSubscriptionID = `BILLING-SUBSCRIPTION-${generateRandomNumber()}`

  before(() => {
    cy.clearCookies()
    cy.setUpVerifiedPersonalAccount(email, password, countryCode)

    cy.visit('/account/dashboard')
    cy.setUpVerifiedBusinessAccount(business)

    cy.createBillingDetailsViaAPI(billingDetails, billingItem, billingPaymentMethod)
    cy.createSubscriberViaAPI(billingSubscriber)
  })

  beforeEach(() => {
    cy.loginViaAPI(email, password)
  })

  it('Create new quarterly subscription', () => {
    cy.passBillingIntroduction()

    cy.urlContains('/account/billing/details')

    cy.breadcrumbContains('/Account/Merchant/Billing/Details')

    cy.headerContains('Billing Details')

    cy.visit('/account/billing/subscriptions')

    cy.breadcrumbContains('/Account/Merchant/Billing/Subscriptions')

    cy.headerContains('Billing Subscriptions')

    cy.get($.BILLING.SUBSCRIPTION.BTN.NEW)
      .should('be.visible')
      .click()

    cy.urlContains('/account/billing/subscriptions/new')

    cy.breadcrumbContains('/Account/Merchant/Billing/Subscriptions/New')

    cy.headerContains('New Billing Subscription')

    cy.selectSubscriberInSubscriptionCreation(billingSubscriber)

    cy.assertPayerCardContainsSubscriberInfo(billingSubscriber)

    cy.selectDetailsInSubscriptionCreation(billingPaymentMethod, fiatCurrencyCode)

    cy.assertPayerCardContainsSubscriberInfo(billingSubscriber)

    cy.assertPaymentCardContainsDetailsInfo(billingDetails, billingItem, fiatCurrencyCode)

    cy.selectSubscriptionStartDate()

    cy.selectSubscriptionEndDate()

    cy.get($.BILLING.SUBSCRIPTION.INPUT.DUE_DAYS)
      .typeAndAssertValue(dueDaysPeriod)

    cy.getButtonWithText('More details') // TODO: add selector
      .should('be.visible')
      .click()

    cy.get($.BILLING.SUBSCRIPTION.INPUT.MERCHANT_ID)
      .typeAndAssertValue(merchantSubscriptionID)

    cy.get($.BILLING.SUBSCRIPTION.BTN.SUBMIT)
      .should('be.visible')
      .click()

    cy.contains('h3', 'Review and finish') // TODO: add selector
      .should('be.visible')

    cy.get($.BILLING.SUBSCRIPTION.BTN.ACTIVATE)
      .should('be.visible')
      .click()

    cy.get($.BILLING.SUBSCRIPTION.BTN.EDIT)
      .should('be.visible')

    cy.get($.BILLING.SUBSCRIPTION.BTN.DELETE)
      .should('be.visible')

    cy.getSubscriptionsViaAPI()
      .then((response) => {
        const subscriptionID = response.body.data[0].id

        cy.urlContains(`/account/billing/subscriptions/${subscriptionID}`)

        cy.breadcrumbContains(`/Account/Merchant/Billing/Subscriptions/${subscriptionID}`)

        cy.headerContains(`Billing Subscription #${subscriptionID}`)

        cy.assertContentNextToLabelContains('ID', subscriptionID)
      })

    cy.contains('.ant-descriptions', 'Subscription') // TODO: add selector
      .should('be.visible')
      .within(() => {
        const { startYear, startMonthNumber, startMonthDay } = getStartDate()
        const { endYear, endMonthNumber, endMonthDay } = getEndDate()

        const formattedStartMonthNumber = getFormattedDateNumber(startMonthNumber)
        const formattedEndMonthNumber = getFormattedDateNumber(endMonthNumber)

        const formattedStartMonthDayNumber = getFormattedDateNumber(startMonthDay)
        const formattedEndMonthDayNumber = getFormattedDateNumber(endMonthDay)

        cy.assertContentNextToLabelContains('Subscription ID', merchantSubscriptionID)

        cy.assertContentNextToLabelContains('Status', 'active')

        cy.assertContentNextToLabelContains('Start Date', `${startYear}-${formattedStartMonthNumber}-${formattedStartMonthDayNumber}`)

        cy.assertContentNextToLabelContains('End Date', `${endYear}-${formattedEndMonthNumber}-${formattedEndMonthDayNumber}`)

        cy.assertContentNextToLabelIsNotEmpty('Next Delivery')

        cy.assertContentNextToLabelContains('Due Days Period', dueDaysPeriod)

        cy.contains('.ant-descriptions-item-label', 'Delivery Schedule')
          .siblings('.ant-descriptions-item-content')
          .find('div')
          .should('not.be.empty')
          .its('length')
          .should('be.within', 7, 9)

        cy.assertContentNextToLabelContains('Send Payment Email', 'false')
      })

    cy.assertSubscriberTableContainsSubscriberInfo(billingSubscriber)

    cy.contains('.ant-descriptions', 'Details') // TODO: add selector
      .should('be.visible')
      .within(() => {
        cy.assertContentNextToLabelContains('Details ID', billingDetails.detailsID)

        cy.assertContentNextToLabelContains('Title', billingDetails.title)

        cy.assertContentNextToLabelContains('Description', billingDetails.description)

        cy.assertContentNextToLabelContains('Payment Method', billingPaymentMethod)

        cy.assertContentNextToLabelContains('Price Currency', fiatCurrencyCode)

        cy.assertContentNextToLabelContains('Receive Currency', cryptoCurrencySymbol)

        cy.assertContentNextToLabelContains('Send Paid Notification', 'False')

        cy.assertContentNextToLabelContains('Send Payment Email', 'False')

        cy.assertContentNextToLabelContains('Callback URL', billingDetails.callbackURL)
      })

    cy.contains($.GENERAL.TABLE.TABLE, 'Items') // TODO: add selector
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

  after(() => {
    cy.deleteAllBillingDetails()
    cy.deleteAllSubscribers()
    cy.deleteAllSubscriptions()
  })
})
