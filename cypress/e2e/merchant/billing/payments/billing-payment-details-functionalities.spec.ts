import $ from '@selectors/index'
import billingPaymentMethods from '@support/merchant/billing/billing-payment-methods'
import { cryptoCurrencySymbol } from '@fixtures/crypto-currency-info.json'
import { fiatCurrencyCode } from '@fixtures/fiat-currency-info.json'
import { generateBillingDetails, generateBillingDetailsItem, generateSubscriber, getStartDateInISO } from '@support/merchant/billing/billing-helper-functions'
import { generateBusinessForAPI, generateTrader } from '@entity/entity-helper-functions'

describe('Billing - Billing Payments - Payment Details', () => {
  const { email, password, countryCode } = generateTrader()

  const business = generateBusinessForAPI()

  const billingSubscriber = generateSubscriber()

  const billingDetails = generateBillingDetails()
  const billingPaymentMethod = billingPaymentMethods.instant

  const billingItem = generateBillingDetailsItem()
  const { itemDescription, itemID, itemQuantity, itemPrice } = billingItem

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

    cy.getBillingDetailsViaAPI()
      .then((response) => {
        const billingDetailsID = response.body.data[0].id

        cy.wrap(billingDetailsID)
          .as('billingDetailsID')
      })

    cy.passBillingIntroduction()

    cy.urlContains('/account/billing/details')

    cy.createInstantSubscriptionViaAPI()
  })

  it('Check "Pending" payment details display', () => {
    cy.activateSubscriptionViaAPI()

    cy.getPaymentsViaAPI()
      .then((response) => {
        const paymentID = response.body.data[0].id

        cy.getSubscriptionsViaAPI()
          .then((response) => {
            const billingSubscriptionID = response.body.data[0].id

            cy.get('@billingDetailsID')
              .then((billingDetailsID) => {
                cy.visit('/account/billing/payments')

                cy.breadcrumbContains('/Account/Merchant/Billing/Payments')
                cy.headerContains('Billing Payments')

                cy.get('tbody tr')
                  .first()
                  .click()

                cy.urlContains(`/account/billing/payments/${paymentID}`)
                cy.breadcrumbContains(`/Account/Merchant/Billing/Payments/${paymentID}`)
                cy.headerContains(`Billing Payment #${paymentID}`)

                cy.waitForSpinAnimationToDisappear()

                cy.getButtonWithText('Payment Details')
                  .click()

                cy.contains('.ant-descriptions', 'Payment Details')
                  .within(() => {
                    cy.assertContentNextToLabelContains('ID', `${paymentID}`)

                    cy.assertContentNextToLabelContainsHref('Subscription', `/account/billing/subscriptions/${billingSubscriptionID}`)

                    cy.assertContentNextToLabelContainsHref('Details', `/account/billing/details/${billingDetailsID}`)

                    cy.assertContentNextToLabelContainsHref('Bill', '.coingate.com/bill/')

                    cy.assertContentNextToLabelContains('Status', 'pending')

                    cy.assertContentNextToLabelContains('Title', billingDetails.title)

                    cy.assertContentNextToLabelContains('Description', billingDetails.description)

                    cy.assertContentNextToLabelIsNotEmpty('Created')

                    cy.assertContentNextToLabelIsNotEmpty('Due Date')

                    cy.assertContentNextToLabelIsEmpty('Paid At')

                    cy.assertContentNextToLabelContains('Send Paid Notification', 'False')

                    cy.assertContentNextToLabelContains('Payment Method', billingPaymentMethod)

                    cy.assertContentNextToLabelContains('Callback URL', billingDetails.callbackURL)
                  })
              })
          })
      })

    cy.assertSubscriberTableContainsSubscriberInfoInPayments(billingSubscriber)

    cy.contains($.GENERAL.TABLE.TABLE, 'Items')
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

    cy.contains($.GENERAL.TABLE.TABLE, 'API Callbacks')
      .should('be.visible')
      .within(() => {
        cy.get('thead')
          .within(() => {
            cy.assertTableHeaderCellContains(1, 'ID')
            cy.assertTableHeaderCellContains(2, 'Status')
            cy.assertTableHeaderCellContains(3, 'Failure Reason')
            cy.assertTableHeaderCellContains(4, 'Requests Count')
            cy.assertTableHeaderCellContains(5, 'Created At')
          })

        cy.get('tbody tr')
          .should('have.length', 1)
          .find('td')
          .should('not.be.empty')
      })
  })

  it('Check "Paid" payment details display', () => {
    cy.activateSubscriptionViaAPI()
      .visitInstantSubscriptionPaymentURL()

    cy.getButtonWithText('Pay now')
      .click()

    cy.markOrderAsPaidInInvoice(cryptoCurrencySymbol)

    cy.getPaymentsViaAPI()
      .then((response) => {
        const paymentID = response.body.data[0].id

        cy.getSubscriptionsViaAPI()
          .then((response) => {
            const billingSubscriptionID = response.body.data[0].id

            cy.get('@billingDetailsID')
              .then((billingDetailsID) => {
                cy.visit('/account/billing/payments')

                cy.get('tbody tr')
                  .first()
                  .click()

                cy.urlContains(`/account/billing/payments/${paymentID}`)

                cy.breadcrumbContains(`/Account/Merchant/Billing/Payments/${paymentID}`)

                cy.headerContains(`Billing Payment #${paymentID}`)

                cy.waitForSpinAnimationToDisappear()

                cy.getButtonWithText('Payment Details')
                  .click()

                cy.contains('.ant-descriptions', 'Payment Details')
                  .within(() => {
                    cy.assertContentNextToLabelContains('ID', `${paymentID}`)

                    cy.assertContentNextToLabelContainsHref('Subscription', `/account/billing/subscriptions/${billingSubscriptionID}`)

                    cy.assertContentNextToLabelContainsHref('Details', `/account/billing/details/${billingDetailsID}`)

                    cy.assertContentNextToLabelContainsHref('Bill', '.coingate.com/bill/')

                    cy.assertContentNextToLabelContains('Status', 'paid')

                    cy.assertContentNextToLabelContains('Title', billingDetails.title)

                    cy.assertContentNextToLabelContains('Description', billingDetails.description)

                    cy.assertContentNextToLabelIsNotEmpty('Created')

                    cy.assertContentNextToLabelIsNotEmpty('Due Date')

                    cy.assertContentNextToLabelContains('Paid At', getStartDateInISO().split('T')[0])

                    cy.assertContentNextToLabelContains('Send Paid Notification', 'False')

                    cy.assertContentNextToLabelContains('Payment Method', billingPaymentMethod)

                    cy.assertContentNextToLabelContains('Callback URL', billingDetails.callbackURL)
                  })
              })
          })
      })

    cy.assertSubscriberTableContainsSubscriberInfoInPayments(billingSubscriber)

    cy.contains($.GENERAL.TABLE.TABLE, 'Items')
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

    cy.contains($.GENERAL.TABLE.TABLE, 'API Callbacks')
      .should('be.visible')
      .within(() => {
        cy.get('thead')
          .within(() => {
            cy.assertTableHeaderCellContains(1, 'ID')
            cy.assertTableHeaderCellContains(2, 'Status')
            cy.assertTableHeaderCellContains(3, 'Failure Reason')
            cy.assertTableHeaderCellContains(4, 'Requests Count')
            cy.assertTableHeaderCellContains(5, 'Created At')
          })

        cy.get('tbody tr')
          .should('have.length', 2)
          .find('td')
          .should('not.be.empty')
      })
  })

  after(() => {
    cy.deleteAllBillingDetails()
    cy.deleteAllSubscribers()
    cy.deleteAllSubscriptions()
  })
})
