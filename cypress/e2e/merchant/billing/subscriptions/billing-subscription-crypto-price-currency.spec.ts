import $ from '@selectors/index'
import billingPaymentMethods from '@support/merchant/billing/billing-payment-methods'
import { cryptoCurrency, cryptoCurrencySymbol } from '@fixtures/crypto-currency-info.json'
import { fiatCurrency } from '@fixtures/fiat-currency-info.json'
import { generateBillingDetails, generateSubscriber } from '@support/merchant/billing/billing-helper-functions'
import { generateBusinessForAPI, generateTrader } from '@entity/entity-helper-functions'

describe('Billing - Billing Subscriptions - Crypto to Fiat', () => {
  const { email, password, countryCode } = generateTrader()

  const business = generateBusinessForAPI()

  const dueDaysPeriod = '3'

  const billingSubscriber = generateSubscriber()

  const billingDetails = generateBillingDetails()
  billingDetails.priceCurrency = cryptoCurrency
  billingDetails.receiveCurrency = fiatCurrency

  const billingPaymentMethod = billingPaymentMethods.instant

  const billingItem = {
    itemDescription: 'Item Description',
    itemQuantity: 1,
    itemPrice: '0.01'
  }

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

  it('Create new instant subscription', () => {
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

    cy.contains($.GENERAL.COLLAPSE.ITEM, billingDetails.title) // TODO: add selector
      .should('be.visible')
      .click()

    cy.get($.GENERAL.COLLAPSE.HEADER)
      .should('contain', billingPaymentMethod)
      .and('contain', `${Number(billingItem.itemPrice)} ${cryptoCurrencySymbol}`)

    cy.get($.GENERAL.COLLAPSE.CONTENT)
      .should('be.visible')
      .and('contain', billingDetails.title)
      .and('contain', billingDetails.description)
      .and('contain', `${Number(billingItem.itemPrice)} ${cryptoCurrencySymbol}`)

    cy.get($.BILLING.SUBSCRIPTION.BTN.DETAILS_CONTINUE)
      .should('be.visible')
      .click()

    cy.assertPayerCardContainsSubscriberInfo(billingSubscriber)

    cy.assertPaymentCardContainsDetailsInfo(billingDetails, billingItem, cryptoCurrencySymbol)

    cy.get($.BILLING.SUBSCRIPTION.INPUT.DUE_DAYS)
      .typeAndAssertValue(dueDaysPeriod)

    cy.get($.BILLING.SUBSCRIPTION.BTN.SUBMIT)
      .should('be.visible')
      .click()

    cy.contains('h3', 'Review and finish') // TODO: add selector
      .should('be.visible')

    cy.get($.BILLING.SUBSCRIPTION.BTN.ACTIVATE)
      .should('be.visible')
      .click()

    cy.assertPayerCardContainsSubscriberInfo(billingSubscriber)

    cy.assertPaymentCardContainsDetailsInfo(billingDetails, billingItem, cryptoCurrencySymbol)

    cy.assertSubscriptionDoneCardIsDisplayedCorrectly(billingSubscriber)
  })

  after(() => {
    cy.deleteAllBillingDetails()
    cy.deleteAllSubscribers()
    cy.deleteAllSubscriptions()
  })
})
