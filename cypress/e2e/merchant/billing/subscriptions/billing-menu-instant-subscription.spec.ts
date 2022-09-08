import $ from '@selectors/index'
import billingPaymentMethods from '@support/merchant/billing/billing-payment-methods'
import { fiatCurrencyCode } from '@fixtures/fiat-currency-info.json'
import { generateBillingDetails, generateBillingDetailsItem, generateSubscriber } from '@support/merchant/billing/billing-helper-functions'
import { generateBusinessForAPI, generateTrader } from '@entity/entity-helper-functions'

describe('Billing - Subscriptions - Instant - Menu', () => {
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
    cy.loginViaAPI(email, password)
  })

  it('Create instant bill from menu', () => {
    cy.visit('/account/dashboard')

    cy.breadcrumbContains('/Account/Dashboard')

    cy.passBillingIntroduction()

    cy.get($.MENU.CREATE_INSTANT_BILL)
      .should('be.visible')
      .click()

    cy.contains($.GENERAL.DRAWER.BODY, 'Instant Bill')
      .should('be.visible')

    cy.selectSubscriberInSubscriptionCreation(billingSubscriber)

    cy.assertPayerCardContainsSubscriberInfo(billingSubscriber)

    cy.contains($.GENERAL.COLLAPSE.ITEM, billingDetails.title) // TODO: add selector
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

    cy.get($.BILLING.SUBSCRIPTION.BTN.MORE_DETAILS)
      .should('be.visible')
      .click()

    cy.get($.BILLING.SUBSCRIPTION.INPUT.DUE_DAYS)
      .typeAndAssertValue(dueDaysPeriod)

    cy.get($.BILLING.SUBSCRIPTION.SWITCH.SEND_BILL_VIA_EMAIL)
      .should('be.visible')
      .and('not.have.class', 'ant-switch-checked')
      .click()
      .should('have.class', 'ant-switch-checked')

    cy.get($.BILLING.SUBSCRIPTION.BTN.CREATE)
      .should('be.visible')
      .click()

    cy.get($.BILLING.SUBSCRIPTION.BTN.DONE)
      .should('be.visible')

    cy.get($.BILLING.SUBSCRIPTION.BTN.CREATE_MORE)
      .should('be.visible')

    cy.assertPayerCardContainsSubscriberInfo(billingSubscriber)

    cy.assertPaymentCardContainsDetailsInfo(billingDetails, billingItem, fiatCurrencyCode)

    cy.assertSubscriptionDoneCardIsDisplayedCorrectly(billingSubscriber)

    cy.visit('/account/billing/subscriptions')

    cy.breadcrumbContains('/Account/Merchant/Billing/Subscriptions')

    cy.headerContains('Billing Subscriptions')

    cy.get('tbody tr')
      .should('be.visible')
      .and('have.length', 1)
      .within(() => {
        cy.assertTableDataCellContains(1, billingDetails.title)
        cy.assertTableDataCellContains(2, billingSubscriber.email)
        cy.assertTableDataCellContains(4, billingPaymentMethod)
      })
  })

  after(() => {
    cy.deleteAllBillingDetails()
    cy.deleteAllSubscribers()
    cy.deleteAllSubscriptions()
  })
})
