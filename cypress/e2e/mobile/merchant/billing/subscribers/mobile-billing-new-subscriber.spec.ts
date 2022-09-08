import $ from '@selectors/index'
import { generateBusinessForAPI, generateTrader } from '@entity/entity-helper-functions'
import { generateSubscriber } from '@support/merchant/billing/billing-helper-functions'

describe('Mobile - Billing - Billing Subscribers', () => {
  const { email, password, countryCode } = generateTrader()

  const business = generateBusinessForAPI()

  const billingSubscriber = generateSubscriber()

  before(() => {
    cy.clearCookies()
    cy.setUpVerifiedPersonalAccount(email, password, countryCode)

    cy.visit('/account/dashboard')
    cy.setUpVerifiedBusinessAccount(business)
  })

  beforeEach(() => {
    cy.setMobileResolution()

    cy.loginViaAPI(email, password)
  })

  it('[Mobile] Create new subscriber', () => {
    cy.passBillingIntroduction()

    cy.urlContains('/account/billing/details')

    cy.breadcrumbContains('/Account/Merchant/Billing/Details')

    cy.headerContains('Billing Details')

    cy.visit('/account/billing/subscribers')

    cy.breadcrumbContains('/Account/Merchant/Billing/Subscribers')

    cy.headerContains('Billing Subscribers')

    cy.get($.BILLING.SUBSCRIBER.BTN.NEW)
      .click()

    cy.urlContains('/account/billing/subscribers/new')

    cy.breadcrumbContains('/Account/Merchant/Billing/Subscribers/New')

    cy.headerContains('New Billing Subscriber')

    cy.get($.GENERAL.FORM.FORM)
      .should('be.visible')

    cy.get($.BILLING.SUBSCRIBER.BTN.MORE_DETAILS)
      .click()

    cy.get($.BILLING.SUBSCRIBER.INPUT.EMAIL)
      .typeAndAssertValue(billingSubscriber.email)

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

    cy.get($.BILLING.SUBSCRIBER.BTN.SUBMIT)
      .click()

    cy.get($.BILLING.SUBSCRIBER.BTN.EDIT)
      .should('be.visible')

    cy.get($.BILLING.SUBSCRIBER.BTN.DELETE)
      .should('be.visible')

    cy.getSubscribersViaAPI()
      .then((response) => {
        const subscriberID = response.body.data[0].id

        cy.urlContains(`/account/billing/subscribers/${subscriberID}`)

        cy.breadcrumbContains(`/Account/Merchant/Billing/Subscribers/${subscriberID}`)

        cy.headerContains(`Billing Subscriber #${subscriberID}`)

        cy.assertContentNextToLabelContains('ID', subscriberID)
      })

    cy.contains($.GENERAL.DESCRIPTIONS.DESCRIPTIONS, 'Subscriber')
      .should('be.visible')
      .within(() => {
        cy.get($.GENERAL.DESCRIPTIONS.ROW)
          .should('have.length', 11)

        cy.assertContentNextToLabelContains('Email', billingSubscriber.email)
        cy.assertContentNextToLabelContains('Subscriber ID', billingSubscriber.merchantID)

        cy.assertContentNextToLabelIsEmpty('Organisation Name')

        cy.assertContentNextToLabelContains('First Name', billingSubscriber.firstName)
        cy.assertContentNextToLabelContains('Last Name', billingSubscriber.lastName)
        cy.assertContentNextToLabelContains('Address', billingSubscriber.address)
        cy.assertContentNextToLabelContains('Secondary Address', billingSubscriber.secondaryAddress)
        cy.assertContentNextToLabelContains('City', billingSubscriber.city)
        cy.assertContentNextToLabelContains('Postal Code', billingSubscriber.postalCode)
        cy.assertContentNextToLabelContains('Country', billingSubscriber.country)
      })
  })

  after(() => {
    cy.deleteAllSubscribers()
  })
})
