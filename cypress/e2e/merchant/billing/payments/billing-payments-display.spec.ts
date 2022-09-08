import $ from '@selectors/index'
import billingPaymentMethods from '@support/merchant/billing/billing-payment-methods'
import { cryptoCurrencySymbol } from '@fixtures/crypto-currency-info.json'
import { fiatCurrencyCode } from '@fixtures/fiat-currency-info.json'
import { generateBillingDetails, generateBillingDetailsItem, generateSubscriber } from '@support/merchant/billing/billing-helper-functions'
import { generateBusinessForAPI, generateTrader } from '@entity/entity-helper-functions'

describe('Billing - Billing Payments - Display', () => {
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
  })

  beforeEach(() => {
    cy.loginViaAPI(email, password)

    cy.passBillingIntroduction()

    cy.urlContains('/account/billing/details')

    cy.createInstantSubscriptionViaAPI()
  })

  it('Check "Pending" payment status display', () => {
    cy.activateSubscriptionViaAPI()

    cy.getPaymentsViaAPI()
      .then((response) => {
        const paymentID = response.body.data[0].id

        cy.visit('/account/billing/payments')

        cy.get('tbody tr')
          .first()
          .within(() => {
            cy.assertTableDataCellContains(0, `${paymentID}`)

            cy.assertTableDataCellContains(1, billingDetails.title)

            cy.assertTableDataCellContains(2, 'pending')

            cy.assertTableDataCellContains(3, billingItem.itemPrice)
            cy.assertTableDataCellContains(3, fiatCurrencyCode)
          })
          .click()

        cy.urlContains(`/account/billing/payments/${paymentID}`)

        cy.breadcrumbContains(`/Account/Merchant/Billing/Payments/${paymentID}`)

        cy.headerContains(`Billing Payment #${paymentID}`)
      })

    cy.waitForSpinAnimationToDisappear()

    cy.get($.BILLING.PAYMENTS.BTN.PAYMENT_DETAILS)
      .should('be.visible')

    cy.assertPayerCardContainsSubscriberInfo(billingSubscriber)

    cy.assertPaymentCardContainsDetailsInfo(billingDetails, billingItem, fiatCurrencyCode)

    cy.assertSubscriptionDoneCardIsDisplayedCorrectly(billingSubscriber)
  })

  it('Check "Paid" payment status display', () => {
    cy.activateSubscriptionViaAPI()
      .visitInstantSubscriptionPaymentURL()

    cy.getButtonWithText('Pay now')
      .click()

    cy.markOrderAsPaidInInvoice(cryptoCurrencySymbol)

    cy.getPaymentsViaAPI()
      .then((response) => {
        const paymentID = response.body.data[0].id

        cy.visit('/account/billing/payments')

        cy.get('tbody tr')
          .first()
          .within(() => {
            cy.assertTableDataCellContains(0, `${paymentID}`)

            cy.assertTableDataCellContains(1, billingDetails.title)

            cy.assertTableDataCellContains(2, 'paid')

            cy.assertTableDataCellContains(3, billingItem.itemPrice)
            cy.assertTableDataCellContains(3, fiatCurrencyCode)
          })
          .click()

        cy.urlContains(`/account/billing/payments/${paymentID}`)

        cy.breadcrumbContains(`/Account/Merchant/Billing/Payments/${paymentID}`)

        cy.headerContains(`Billing Payment #${paymentID}`)
      })

    cy.waitForSpinAnimationToDisappear()

    cy.get($.BILLING.PAYMENTS.BTN.PAYMENT_DETAILS)
      .should('be.visible')

    cy.assertPayerCardContainsSubscriberInfo(billingSubscriber)

    cy.assertPaymentCardContainsDetailsInfo(billingDetails, billingItem, fiatCurrencyCode)

    cy.contains('.ant-tag', 'Paid')
  })

  after(() => {
    cy.deleteAllBillingDetails()
    cy.deleteAllSubscribers()
    cy.deleteAllSubscriptions()
  })
})
