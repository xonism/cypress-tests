import $ from '@selectors/index'
import billingPaymentMethods from '@support/merchant/billing/billing-payment-methods'
import { fiatCurrencyCode } from '@fixtures/fiat-currency-info.json'
import { generateBillingDetails, generateBillingDetailsItem, generateSubscriber } from '@support/merchant/billing/billing-helper-functions'
import { generateBusinessForAPI, generateTrader } from '@entity/entity-helper-functions'

describe('Billing - Subscriptions - Functionalities - Draft Status', () => {
  const { email, password, countryCode } = generateTrader()

  const business = generateBusinessForAPI()

  const billingSubscriber = generateSubscriber()

  const billingDetails = generateBillingDetails()
  const billingPaymentMethod = billingPaymentMethods.instant

  const billingItem = generateBillingDetailsItem()

  const newDueDaysPeriod = '5'

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
    cy.loginViaAPI(email, password)

    cy.passBillingIntroduction()

    cy.urlContains('/account/billing/details')

    cy.visit('/account/billing/subscriptions')

    cy.get('tbody tr td')
      .first()
      .click()

    cy.get($.GENERAL.DESCRIPTIONS.DESCRIPTIONS)
      .should('be.visible')
  })

  it('Check "Edit" functionality', () => {
    cy.get($.BILLING.SUBSCRIPTION.BTN.EDIT)
      .should('be.visible')
      .click()

    cy.getSubscriptionsViaAPI()
      .then((response) => {
        const billingSubscriptionID = response.body.data[0].id

        cy.urlContains(`/account/billing/subscriptions/${billingSubscriptionID}/edit`)

        cy.breadcrumbContains(`/Account/Merchant/Billing/Subscriptions/${billingSubscriptionID}/Edit`)

        cy.headerContains(`Edit Billing Subscription ${billingSubscriptionID}`)
      })

    cy.get($.GENERAL.FORM.FORM)
      .should('be.visible')

    cy.assertPayerCardContainsSubscriberInfo(billingSubscriber)

    cy.assertPaymentCardContainsDetailsInfo(billingDetails, billingItem, fiatCurrencyCode)

    cy.assertInputContains($.BILLING.SUBSCRIPTION.INPUT.DUE_DAYS, '3')

    cy.get($.BILLING.SUBSCRIPTION.BTN.SUBMIT_EDIT)
      .should('be.visible')
      .and('be.disabled')

    cy.get($.BILLING.SUBSCRIPTION.INPUT.DUE_DAYS)
      .typeAndAssertValue(newDueDaysPeriod)

    cy.get($.BILLING.SUBSCRIPTION.BTN.SUBMIT_EDIT)
      .should('not.be.disabled')
      .click()

    cy.get($.BILLING.SUBSCRIPTION.BTN.ACTIVATE)
      .should('be.visible')

    cy.visit('/account/billing/subscriptions')

    cy.get('tbody tr td')
      .first()
      .click()

    cy.assertContentNextToLabelContains('Due Days Period', newDueDaysPeriod)
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
