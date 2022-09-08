import billingPaymentMethods from '@support/merchant/billing/billing-payment-methods'
import { generateBillingDetails, generateBillingDetailsItem, generateSubscriber } from '@support/merchant/billing/billing-helper-functions'
import { generateBusinessForAPI, generateTrader } from '@entity/entity-helper-functions'

describe('Mobile - Billing - Subscriptions - Display', () => {
  const { email, password, countryCode } = generateTrader()

  const business = generateBusinessForAPI()

  const billingSubscriber = generateSubscriber()

  const billingDetails = generateBillingDetails()
  const billingPaymentMethod = billingPaymentMethods.instant

  const billingItem = generateBillingDetailsItem()

  before(() => {
    cy.clearCookies()
    cy.setUpVerifiedPersonalAccount(email, password, countryCode)

    cy.visit('/account/dashboard')
    cy.setUpVerifiedBusinessAccount(business)

    cy.createBillingDetailsViaAPI(billingDetails, billingItem, billingPaymentMethod)
    cy.createSubscriberViaAPI(billingSubscriber)
    cy.createInstantSubscriptionViaAPI()
  })

  beforeEach(() => {
    cy.setMobileResolution()

    cy.loginViaAPI(email, password)

    cy.passBillingIntroduction()

    cy.urlContains('/account/billing/details')
  })

  it('[Mobile] Check "Draft" subscription status display', () => {
    cy.visit('/account/billing/subscriptions')

    cy.getSubscriptionsViaAPI()
      .then((response) => {
        const billingSubscriptionID = response.body.data[0].id

        cy.get('tbody tr')
          .first()
          .within(() => {
            cy.assertTableDataCellContains(0, billingSubscriptionID)
            cy.assertTableDataCellContains(1, billingDetails.title)
            cy.assertTableDataCellContains(2, billingSubscriber.email)
            cy.assertTableDataCellContains(3, 'draft')
            cy.assertTableDataCellContains(4, billingPaymentMethod)

            cy.assertTableDataCellIsEmpty(5)

            cy.assertTableDataCellIsNotEmpty(6)
            cy.assertTableDataCellIsNotEmpty(7)
          })
      })
  })

  it('[Mobile] Check "Completed" subscription status display', () => {
    cy.activateSubscriptionViaAPI()

    cy.visit('/account/billing/subscriptions')

    cy.getSubscriptionsViaAPI()
      .then((response) => {
        const billingSubscriptionID = response.body.data[0].id

        cy.get('tbody tr')
          .first()
          .within(() => {
            cy.assertTableDataCellContains(0, billingSubscriptionID)
            cy.assertTableDataCellContains(1, billingDetails.title)
            cy.assertTableDataCellContains(2, billingSubscriber.email)
            cy.assertTableDataCellContains(3, 'completed')
            cy.assertTableDataCellContains(4, billingPaymentMethod)

            cy.assertTableDataCellIsEmpty(5)

            cy.assertTableDataCellIsNotEmpty(6)
            cy.assertTableDataCellIsNotEmpty(7)
          })
      })
  })

  it('[Mobile] Check "Active" subscription status display', () => {
    const recurringBillingPaymentMethod = billingPaymentMethods.weekly

    cy.createBillingDetailsViaAPI(billingDetails, billingItem, recurringBillingPaymentMethod)
    cy.createRecurringSubscriptionViaAPI()
    cy.activateSubscriptionViaAPI()

    cy.visit('/account/billing/subscriptions')

    cy.getSubscriptionsViaAPI()
      .then((response) => {
        const billingSubscriptionID = response.body.data[0].id

        cy.get('tbody tr')
          .first()
          .within(() => {
            cy.assertTableDataCellContains(0, billingSubscriptionID)
            cy.assertTableDataCellContains(1, billingDetails.title)
            cy.assertTableDataCellContains(2, billingSubscriber.email)
            cy.assertTableDataCellContains(3, 'active')
            cy.assertTableDataCellContains(4, recurringBillingPaymentMethod)

            cy.assertTableDataCellIsNotEmpty(5)
            cy.assertTableDataCellIsNotEmpty(6)
            cy.assertTableDataCellIsNotEmpty(7)
          })
      })
  })

  after(() => {
    cy.deleteAllBillingDetails()
    cy.deleteAllSubscribers()
    cy.deleteAllSubscriptions()
  })
})
