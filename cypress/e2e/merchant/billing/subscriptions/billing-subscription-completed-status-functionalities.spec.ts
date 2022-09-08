import $ from '@selectors/index'
import billingPaymentMethods from '@support/merchant/billing/billing-payment-methods'
import { generateBillingDetails, generateBillingDetailsItem, generateSubscriber } from '@support/merchant/billing/billing-helper-functions'
import { generateBusinessForAPI, generateTrader } from '@entity/entity-helper-functions'

describe('Billing - Billing Subscriptions - Functionalities - Completed Status', () => {
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
    cy.activateSubscriptionViaAPI()
  })

  beforeEach(() => {
    cy.loginViaAPI(email, password)

    cy.passBillingIntroduction()

    cy.urlContains('/account/billing/details')

    cy.visit('/account/billing/subscriptions')

    cy.get('tbody tr td')
      .first()
      .click()

    cy.get($.GENERAL.DESCRIPTIONS.DESCRIPTIONS)
      .should('be.visible')

    cy.get($.BILLING.SUBSCRIPTION.BTN.EDIT)
      .should('not.exist')
  })

  it('Check "Delete" functionality', () => {
    cy.get($.BILLING.SUBSCRIPTION.BTN.DELETE)
      .should('be.visible')
      .click()

    cy.get($.GENERAL.POPOVER)
      .should('be.visible')
      .contains('button[type="button"]', 'Yes')
      .click()

    cy.get($.BILLING.SUBSCRIPTION.BTN.NEW)
      .should('be.visible')

    cy.urlContains('/account/billing/subscriptions')

    cy.assertEmptyTableState()
  })

  after(() => {
    cy.deleteAllBillingDetails()
    cy.deleteAllSubscribers()
  })
})
