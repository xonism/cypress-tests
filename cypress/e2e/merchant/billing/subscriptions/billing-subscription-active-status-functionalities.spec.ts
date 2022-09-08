import $ from '@selectors/index'
import billingPaymentMethods from '@support/merchant/billing/billing-payment-methods'
import { fiatCurrencyCode } from '@fixtures/fiat-currency-info.json'
import {
  generateBillingDetails,
  generateBillingDetailsItem,
  generateSubscriber,
  getEndDate,
  getFormattedDateNumber,
  getStartDate
} from '@support/merchant/billing/billing-helper-functions'
import { generateBusinessForAPI, generateTrader } from '@entity/entity-helper-functions'

describe('Billing - Billing Subscriptions - Functionalities - Active Status', () => {
  const { email, password, countryCode } = generateTrader()

  const business = generateBusinessForAPI()

  const billingSubscriber = generateSubscriber()

  const billingDetails = generateBillingDetails()
  const billingPaymentMethod = billingPaymentMethods.weekly

  const billingItem = generateBillingDetailsItem()

  const newDueDaysPeriod = '5'

  before(() => {
    cy.clearCookies()
    cy.setUpVerifiedPersonalAccount(email, password, countryCode)

    cy.visit('/account/dashboard')
    cy.setUpVerifiedBusinessAccount(business)

    cy.createBillingDetailsViaAPI(billingDetails, billingItem, billingPaymentMethod)
    cy.createSubscriberViaAPI(billingSubscriber)
    cy.createRecurringSubscriptionViaAPI()
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
  })

  it('Check "Edit" functionality', () => {
    const { startYear, startMonthNumber, startMonthDay } = getStartDate()
    const formattedStartMonthNumber = getFormattedDateNumber(startMonthNumber)
    const formattedStartMonthDayNumber = getFormattedDateNumber(startMonthDay)

    const { endYear, endMonthNumber, endMonthDay } = getEndDate()
    const formattedEndMonthNumber = getFormattedDateNumber(endMonthNumber)
    const formattedEndMonthDayNumber = getFormattedDateNumber(endMonthDay)

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

    cy.assertStartDateInputContains(`${startYear}-${formattedStartMonthNumber}-${formattedStartMonthDayNumber}`)

    cy.assertEndDateInputContains(`${endYear}-${formattedEndMonthNumber}-${formattedEndMonthDayNumber}`)

    cy.assertInputContains($.BILLING.SUBSCRIPTION.INPUT.DUE_DAYS, '3')

    cy.assertInputContains($.BILLING.SUBSCRIPTION.INPUT.MERCHANT_ID, 'MERCHANT-SUBSCRIPTION-')

    cy.get($.BILLING.SUBSCRIPTION.BTN.SUBMIT_EDIT)
      .should('be.visible')
      .and('be.disabled')

    cy.get($.BILLING.SUBSCRIPTION.INPUT.DUE_DAYS)
      .typeAndAssertValue(newDueDaysPeriod)

    cy.get($.BILLING.SUBSCRIPTION.BTN.SUBMIT_EDIT)
      .should('not.be.disabled')
      .click()

    cy.contains($.GENERAL.FORM.ITEM, 'Start date') // TODO: add selector
      .should('not.exist')

    cy.contains($.GENERAL.FORM.ITEM, 'End date') // TODO: add selector
      .should('not.exist')

    cy.get($.BILLING.SUBSCRIPTION.INPUT.DUE_DAYS)
      .should('not.exist')

    cy.get($.BILLING.SUBSCRIPTION.INPUT.MERCHANT_ID)
      .should('not.exist')

    cy.get($.BILLING.SUBSCRIPTION.BTN.SUBMIT_EDIT)
      .should('not.exist')

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

    cy.get($.GENERAL.POPOVER) // TODO: add selector
      .should('be.visible')
      .contains('button[type="button"]', 'Yes')
      .click()

    cy.get($.BILLING.SUBSCRIPTION.BTN.NEW)
      .should('be.visible')

    cy.urlContains('/account/billing/subscriptions')

    cy.assertEmptyTableState()
  })
})
