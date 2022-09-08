import $ from '@selectors/index'
import {
  generateBillingDetails,
  generateBillingDetailsItem,
  getEndDate,
  getEndDateInISO,
  getFormattedDateNumber,
  getStartDate,
  getStartDateInISO
} from './billing-helper-functions'
import { generateRandomNumber } from '@support/helper-functions'

declare global {
  namespace Cypress {
    interface Chainable {
      createInstantSubscriptionViaAPI(): Chainable<Element>
      createRecurringSubscriptionViaAPI(): Chainable<Element>
      activateSubscriptionViaAPI(): Chainable<Element>
      /** Should be chained off `activateSubscriptionViaAPI` */
      visitInstantSubscriptionPaymentURL(): Chainable<Element>
      deleteSubscriptionViaAPI(billingSubscriptionID: string | number): Chainable<Element>
      deleteAllSubscriptions(): Chainable<Element>
      selectSubscriptionStartDate(): Chainable<Element>
      selectSubscriptionEndDate(): Chainable<Element>
      assertStartDateInputContains(value: string): Chainable<Element>
      assertEndDateInputContains(value: string): Chainable<Element>
      getSubscriptionsViaAPI(): Promise<any>
      assertSubscriptionDoneCardIsDisplayedCorrectly(billingSubscriber): Chainable<Element>
      selectDetailsInSubscriptionCreation(billingPaymentMethod: string, currencyCode: string): Chainable<Element>
      selectSubscriberInSubscriptionCreation(billingSubscriber): Chainable<Element>
    }
  }
}

Cypress.Commands.add('createInstantSubscriptionViaAPI', () => {
  cy.logStep('API: Create instant billing subscription')

  cy.getBillingDetailsViaAPI()
    .then((response) => {
      const billingDetailsID = response.body.data[0].id

      cy.getSubscribersViaAPI()
        .then((response) => {
          const billingSubscriberID = response.body.data[0].id

          cy.internalRequest({
            url: '/account/billing/subscriptions',
            method: 'POST',
            body: {
              'billing_subscription': {
                'merchant_subscription_id': `MERCHANT-SUBSCRIPTION-${generateRandomNumber()}`,
                'due_days_period': 3,
                'billing_subscribers_id': billingSubscriberID,
                'send_payment_email': false,
                'billing_details_id': billingDetailsID
              },
              'activate': false
            }
          }).then((response) => {
            expect(response.status).to.be.eq(200)
          })
        })
    })
})

Cypress.Commands.add('createRecurringSubscriptionViaAPI', () => {
  cy.logStep('API: Create billing subscription')

  cy.getBillingDetailsViaAPI()
    .then((response) => {
      const billingDetailsID = response.body.data[0].id

      cy.getSubscribersViaAPI()
        .then((response) => {
          const billingSubscriberID = response.body.data[0].id

          cy.internalRequest({
            url: '/account/billing/subscriptions',
            method: 'POST',
            body: {
              'billing_subscription': {
                'merchant_subscription_id': `MERCHANT-SUBSCRIPTION-${generateRandomNumber()}`,
                'due_days_period': 3,
                'billing_subscribers_id': billingSubscriberID,
                'send_payment_email': false,
                'billing_details_id': billingDetailsID,
                'start_date': getStartDateInISO(),
                'end_date': getEndDateInISO()
              },
              'activate': false
            }
          }).then((response) => {
            expect(response.status).to.be.eq(200)
          })
        })
    })
})

Cypress.Commands.add('activateSubscriptionViaAPI', () => {
  cy.logStep('API: Activate billing subscription')

  cy.getSubscriptionsViaAPI()
    .then((response) => {
      const billingSubscriptionID = response.body.data[0].id

      cy.internalRequest({
        url: `/account/billing/subscriptions/${billingSubscriptionID}/activate`,
        method: 'POST',
        body: {
          activate: true
        }
      }).then((response) => {
        expect(response.status).to.be.eq(200)
      })
    })
})

Cypress.Commands.add('visitInstantSubscriptionPaymentURL', { prevSubject: true }, (subject: Cypress.Response<any>) => {
  cy.wrap(subject)
    .then((response) => {
      const paymentURL = response.body.payment.url

      cy.visit(paymentURL)
    })
})

Cypress.Commands.add('deleteSubscriptionViaAPI', (billingSubscriptionID) => {
  cy.logStep('API: Delete billing subscription')

  cy.internalRequest({
    url: `/account/billing/subscriptions/${billingSubscriptionID}`,
    method: 'DELETE'
  }).then((response) => {
    expect(response.status).to.be.eq(200)
  })
})

Cypress.Commands.add('deleteAllSubscriptions', () => {
  cy.visit('/account/billing/subscriptions')

  cy.get('tbody tr')
    .each((tableRow) => {
      cy.wrap(tableRow)
        .find('td')
        .first()
        .invoke('text')
        .then((billingSubscriptionID) => {
          cy.deleteSubscriptionViaAPI(billingSubscriptionID)
        })
    })

  cy.reload()

  cy.assertEmptyTableState()
})

Cypress.Commands.add('selectSubscriptionStartDate', () => {
  const { startYear, startMonthNumber, startMonthName, startShortenedMonthName, startMonthDay } = getStartDate()

  const formattedStartMonthNumber = getFormattedDateNumber(startMonthNumber)
  const formattedStartMonthDayNumber = getFormattedDateNumber(startMonthDay)

  cy.contains($.GENERAL.FORM.ITEM, 'Start date')
    .find($.GENERAL.CALENDAR.PICKER)
    .click()

  cy.get($.GENERAL.CALENDAR.YEAR_SELECT)
    .click()

  cy.contains($.GENERAL.CALENDAR.YEAR_PANEL_CELL, startYear)
    .click()

  cy.get($.GENERAL.CALENDAR.YEAR_SELECT)
    .should('contain', startYear)

  cy.get($.GENERAL.CALENDAR.MONTH_SELECT)
    .click()

  cy.contains($.GENERAL.CALENDAR.MONTH_PANEL_CELL, startShortenedMonthName)
    .click()

  cy.get($.GENERAL.CALENDAR.MONTH_SELECT)
    .should('contain', startShortenedMonthName)

  cy.get(`[title="${startMonthName} ${startMonthDay}, ${startYear}"]`)
    .first()
    .click()

  cy.contains($.GENERAL.FORM.ITEM, 'Start date')
    .find($.GENERAL.CALENDAR.PICKER_INPUT)
    .invoke('val')
    .should('contain', `${startYear}-${formattedStartMonthNumber}-${formattedStartMonthDayNumber}`)
})

Cypress.Commands.add('selectSubscriptionEndDate', () => {
  const { endYear, endMonthNumber, endMonthName, endShortenedMonthName, endMonthDay } = getEndDate()

  const formattedEndMonthNumber = getFormattedDateNumber(endMonthNumber)
  const formattedEndMonthDayNumber = getFormattedDateNumber(endMonthDay)

  cy.contains($.GENERAL.FORM.ITEM, 'End date')
    .find($.GENERAL.CALENDAR.PICKER)
    .click()

  cy.get($.GENERAL.CALENDAR.YEAR_SELECT)
    .click()

  cy.contains($.GENERAL.CALENDAR.YEAR_PANEL_CELL, endYear)
    .click()

  cy.get($.GENERAL.CALENDAR.YEAR_SELECT)
    .should('contain', endYear)

  cy.get($.GENERAL.CALENDAR.MONTH_SELECT)
    .click()

  cy.contains($.GENERAL.CALENDAR.MONTH_PANEL_CELL, endShortenedMonthName)
    .click()

  cy.get($.GENERAL.CALENDAR.MONTH_SELECT)
    .should('contain', endShortenedMonthName)

  cy.get(`[title="${endMonthName} ${endMonthDay}, ${endYear}"]`)
    .click()

  cy.contains($.GENERAL.FORM.ITEM, 'End date')
    .find($.GENERAL.CALENDAR.PICKER_INPUT)
    .invoke('val')
    .should('contain', `${endYear}-${formattedEndMonthNumber}-${formattedEndMonthDayNumber}`)
})

Cypress.Commands.add('assertStartDateInputContains', (value) => {
  cy.contains($.GENERAL.FORM.ITEM, 'Start date')
    .find('input')
    .invoke('val')
    .should('contain', value)
})

Cypress.Commands.add('assertEndDateInputContains', (value) => {
  cy.contains($.GENERAL.FORM.ITEM, 'End date')
    .find('input')
    .invoke('val')
    .should('contain', value)
})

Cypress.Commands.add('getSubscriptionsViaAPI', () => {
  cy.logStep('API: Get billing subscriptions')

  cy.internalRequest({
    url: '/account/billing/subscriptions.json'
  }).then((response) => {
    expect(response.status).to.be.eq(200)
  })
})

Cypress.Commands.add('assertSubscriptionDoneCardIsDisplayedCorrectly', (billingSubscriber) => {
  cy.contains($.GENERAL.CARD, `Done! Share the link with ${billingSubscriber.firstName} ${billingSubscriber.lastName}`) // TODO: add selector
    .should('be.visible')
    .within(() => {
      cy.get('svg')
        .should('be.visible')

      cy.assertInputContains($.BILLING.SUBSCRIPTION.INPUT.INSTANT_PAYMENT_URL, 'coingate.com/bill/')
    })
})

Cypress.Commands.add('selectDetailsInSubscriptionCreation', (billingPaymentMethod, currencyCode) => {
  const billingDetails = generateBillingDetails()

  const billingItem = generateBillingDetailsItem()

  cy.contains($.GENERAL.COLLAPSE.ITEM, billingDetails.title) // TODO: add selector
    .should('be.visible')
    .click()

  cy.get($.GENERAL.COLLAPSE.HEADER)
    .should('contain', billingPaymentMethod)
    .and('contain', `${Number(billingItem.itemPrice)} ${currencyCode}`)

  cy.get($.GENERAL.COLLAPSE.CONTENT)
    .should('be.visible')
    .and('contain', billingDetails.title)
    .and('contain', billingDetails.description)
    .and('contain', `${Number(billingItem.itemPrice)} ${currencyCode}`)

  cy.get($.BILLING.SUBSCRIPTION.BTN.DETAILS_CONTINUE)
    .should('be.visible')
    .click()
})

Cypress.Commands.add('selectSubscriberInSubscriptionCreation', (billingSubscriber) => {
  cy.contains($.GENERAL.COLLAPSE.ITEM, billingSubscriber.email)
    .should('be.visible')
    .click()

  cy.get($.GENERAL.COLLAPSE.HEADER)
    .should('contain', billingSubscriber.organisationName)
    .and('contain', billingSubscriber.firstName)
    .and('contain', billingSubscriber.lastName)
    .and('contain', billingSubscriber.email)

  cy.get($.GENERAL.COLLAPSE.CONTENT)
    .should('be.visible')
    .and('contain', billingSubscriber.organisationName)
    .and('contain', billingSubscriber.firstName)
    .and('contain', billingSubscriber.lastName)
    .and('contain', billingSubscriber.email)
    .and('contain', billingSubscriber.address)
    .and('contain', billingSubscriber.secondaryAddress)
    .and('contain', billingSubscriber.city)
    .and('contain', billingSubscriber.postalCode)
    .and('contain', billingSubscriber.country)

  cy.get($.BILLING.SUBSCRIPTION.BTN.SUBSCRIBER_CONTINUE)
    .should('be.visible')
    .click()
})
