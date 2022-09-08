import $ from '@selectors/index'
import billingPaymentMethods from '@support/merchant/billing/billing-payment-methods'
import { fiatCurrencyCode } from '@fixtures/fiat-currency-info.json'
import { generateBillingDetails, generateBillingDetailsItem, generateSubscriber } from '@support/merchant/billing/billing-helper-functions'
import { generateBusinessForAPI, generateTrader } from '@entity/entity-helper-functions'

describe('Mobile - Billing - Billing Subscriptions - Instant', () => {
  const { email, password, countryCode } = generateTrader()

  const business = generateBusinessForAPI()

  const dueDaysPeriod = '3'

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
  })

  beforeEach(() => {
    cy.setMobileResolution()

    cy.loginViaAPI(email, password)
  })

  it('[Mobile] Create new instant subscription', () => {
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

    cy.contains($.GENERAL.COLLAPSE.ITEM, billingDetails.title)
      .should('be.visible')
      .click()

    cy.get($.GENERAL.COLLAPSE.HEADER)
      .should('contain', billingPaymentMethod)
      .and('contain', `${Number(billingItem.itemPrice)} ${fiatCurrencyCode}`)

    cy.get($.GENERAL.COLLAPSE.CONTENT)
      .should('be.visible')
      .and('contain', billingDetails.title)
      .and('contain', billingDetails.description)
      .and('contain', `${Number(billingItem.itemPrice)} ${fiatCurrencyCode}`)

    cy.get($.BILLING.SUBSCRIPTION.BTN.DETAILS_CONTINUE)
      .should('be.visible')
      .click()

    cy.assertPayerCardContainsSubscriberInfo(billingSubscriber)

    cy.assertPaymentCardContainsDetailsInfo(billingDetails, billingItem, fiatCurrencyCode)

    cy.get($.BILLING.SUBSCRIPTION.INPUT.DUE_DAYS)
      .typeAndAssertValue(dueDaysPeriod)

    cy.get($.BILLING.SUBSCRIPTION.BTN.SUBMIT)
      .should('be.visible')
      .click()

    cy.contains('h3', 'Review and finish')
      .should('be.visible')

    cy.get($.BILLING.SUBSCRIPTION.BTN.ACTIVATE)
      .should('be.visible')
      .click()

    cy.assertPayerCardContainsSubscriberInfo(billingSubscriber)

    cy.assertPaymentCardContainsDetailsInfo(billingDetails, billingItem, fiatCurrencyCode)

    cy.assertSubscriptionDoneCardIsDisplayedCorrectly(billingSubscriber)
  })

  after(() => {
    cy.deleteAllBillingDetails()
    cy.deleteAllSubscribers()
    cy.deleteAllSubscriptions()
  })
})
