import $ from '@selectors/index'
import { generateBusinessForAPI, generateTrader } from '@entity/entity-helper-functions'
import { generateSubscriber } from '@support/merchant/billing/billing-helper-functions'

describe('Billing - Billing Subscribers - Functionalities', () => {
  const { email, password, countryCode } = generateTrader()

  const business = generateBusinessForAPI()

  const billingSubscriber = generateSubscriber()

  before(() => {
    cy.clearCookies()
    cy.setUpVerifiedPersonalAccount(email, password, countryCode)

    cy.visit('/account/dashboard')
    cy.setUpVerifiedBusinessAccount(business)

    cy.createSubscriberViaAPI(billingSubscriber)
  })

  beforeEach(() => {
    cy.loginViaAPI(email, password)

    cy.passBillingIntroduction()

    cy.urlContains('/account/billing/details')

    cy.visit('/account/billing/subscribers')

    cy.breadcrumbContains('/Account/Merchant/Billing/Subscribers')
    cy.headerContains('Billing Subscribers')

    cy.get('tbody tr')
      .first()
      .click()

    cy.get($.GENERAL.DESCRIPTIONS.DESCRIPTIONS)
      .should('be.visible')
  })

  it('Check "Edit" functionality', () => {
    cy.get($.BILLING.SUBSCRIBER.BTN.EDIT)
      .should('be.visible')
      .click()

    cy.getSubscribersViaAPI()
      .then((response) => {
        const subscriberID = response.body.data[0].id

        cy.urlContains(`/account/billing/subscribers/${subscriberID}/edit`)

        cy.breadcrumbContains(`/Account/Merchant/Billing/Subscribers/${subscriberID}/Edit`)

        cy.headerContains(`Edit Billing Subscriber #${subscriberID}`)

        cy.get($.GENERAL.FORM.FORM)
          .should('be.visible')

        cy.assertInputContains($.BILLING.SUBSCRIBER.INPUT.EMAIL, billingSubscriber.email)

        cy.assertInputContains($.BILLING.SUBSCRIBER.INPUT.FIRST_NAME, billingSubscriber.firstName)

        cy.assertInputContains($.BILLING.SUBSCRIBER.INPUT.LAST_NAME, billingSubscriber.lastName)

        cy.assertInputContains($.BILLING.SUBSCRIBER.INPUT.ADDRESS, billingSubscriber.address)

        cy.assertInputContains($.BILLING.SUBSCRIBER.INPUT.SECONDARY_ADDRESS, billingSubscriber.secondaryAddress)

        cy.assertInputContains($.BILLING.SUBSCRIBER.INPUT.COUNTRY, billingSubscriber.country)

        cy.assertInputContains($.BILLING.SUBSCRIBER.INPUT.CITY, billingSubscriber.city)

        cy.assertInputContains($.BILLING.SUBSCRIBER.INPUT.POSTAL_CODE, billingSubscriber.postalCode)

        cy.assertInputContains($.BILLING.SUBSCRIBER.INPUT.MERCHANT_ID, billingSubscriber.merchantID)

        cy.get($.BILLING.SUBSCRIBER.BTN.SUBMIT_EDIT)
          .should('be.visible')
          .and('be.disabled')

        cy.get($.BILLING.SUBSCRIBER.INPUT.FIRST_NAME)
          .typeAndAssertValue(`Edited ${billingSubscriber.firstName}`)

        cy.get($.BILLING.SUBSCRIBER.BTN.SUBMIT_EDIT)
          .should('not.be.disabled')
          .click()

        cy.get($.BILLING.SUBSCRIBER.BTN.EDIT)
          .should('be.visible')

        cy.urlContains(`/account/billing/subscribers/${subscriberID}`)

        cy.assertContentNextToLabelContains('First Name', `Edited ${billingSubscriber.firstName}`)
      })
  })

  it('Check "Delete" functionality', () => {
    cy.get($.BILLING.SUBSCRIBER.BTN.DELETE)
      .should('be.visible')
      .click()

    cy.get($.GENERAL.POPOVER)
      .should('be.visible')
      .contains('button[type="button"]', 'Yes')
      .click()

    cy.urlContains('/account/billing/subscribers')
    cy.breadcrumbContains('/Account/Merchant/Billing/Subscribers')
    cy.headerContains('Billing Subscribers')

    cy.get($.BILLING.SUBSCRIBER.BTN.NEW)
      .should('be.visible')

    cy.assertEmptyTableState()
  })
})
