import $ from '@selectors/index'
import { IBillingDetails } from '@support/interfaces'

declare global {
  namespace Cypress {
    interface Chainable {
      createBillingDetailsViaAPI(billingDetails: IBillingDetails, billingItem, billingPaymentMethod: string): Chainable<Element>
      deleteBillingDetailViaAPI(billingDetailID: string | number): Chainable<Element>
      deleteAllBillingDetails(): Chainable<Element>
      getBillingDetailsViaAPI(): Promise<any>
      assertPaymentCardContainsDetailsInfo(billingDetails: IBillingDetails, billingItem, currencyCode: string): Chainable<Element>
      checkSendBillViaEmail(): Chainable<Element>
      checkSendEmailPaidNotification(): Chainable<Element>
      selectBillingDetailsItemPaymentMethod(billingPaymentMethod: string): Chainable<Element>
      selectBillingDetailsItemPriceCurrency(priceCurrency: string): Chainable<Element>
      selectBillingDetailsItemReceiveCurrency(receiveCurrency: string): Chainable<Element>
    }
  }
}

Cypress.Commands.add('createBillingDetailsViaAPI', (billingDetails, billingItem, billingPaymentMethod) => {
  cy.logStep('API: Create instant billing details')

  const { itemDescription, itemID, itemQuantity, itemPrice } = billingItem

  cy.getButtonCurrencyListViaAPI()
    .then((response) => {
      const priceCurrencyID = response.body.currencies.find((currency) => currency.label === billingDetails.priceCurrency).value
      const receiveCurrencyID = response.body.currencies.find((currency) => currency.label === billingDetails.receiveCurrency).value

      cy.internalRequest({
        url: '/account/billing/details',
        method: 'POST',
        body: {
          'billing_details': {
            'payment_method': billingPaymentMethod, // required
            'price_currency_id': priceCurrencyID, // required
            'receive_currency_id': receiveCurrencyID, // required
            'title': billingDetails.title,
            'description': billingDetails.description,
            'send_paid_notification': false,
            'send_payment_email': false,
            'merchant_details_id': billingDetails.detailsID,
            'callback_url': billingDetails.callbackURL,
            'underpaid_cover_pct': billingDetails.underpaidCover,
            'items_attributes': [
              {
                'price': itemPrice, // required
                'description': itemDescription,
                'quantity': itemQuantity,
                'merchant_item_id': itemID
              }
            ]
          }
        }
      }).then((response) => {
        expect(response.status).to.be.eq(200)
      })
    })
})

Cypress.Commands.add('deleteBillingDetailViaAPI', (billingDetailID) => {
  cy.logStep('API: Delete billing detail')

  cy.internalRequest({
    url: `/account/billing/details/${billingDetailID}`,
    method: 'DELETE'
  }).then((response) => {
    expect(response.status).to.be.eq(200)
  })
})

Cypress.Commands.add('deleteAllBillingDetails', () => {
  cy.visit('/account/billing/details')

  cy.get('tbody tr')
    .each((tableRow) => {
      cy.wrap(tableRow)
        .find('td')
        .first()
        .invoke('text')
        .then((billingDetailID) => {
          cy.deleteBillingDetailViaAPI(billingDetailID)
        })
    })

  cy.reload()

  cy.assertEmptyTableState()
})

Cypress.Commands.add('getBillingDetailsViaAPI', () => {
  cy.logStep('API: Get billing details')

  cy.internalRequest({
    url: '/account/billing/details.json'
  }).then((response) => {
    expect(response.status).to.be.eq(200)
  })
})

Cypress.Commands.add('assertPaymentCardContainsDetailsInfo', (billingDetails, billingItem, currencyCode) => {
  cy.contains('.ant-col', 'Payment') // TODO: add selector
    .should('contain', billingDetails.title)
    .and('contain', billingDetails.description)
    .and('contain', billingItem.itemPrice)
    .and('contain', currencyCode)
})

Cypress.Commands.add('checkSendBillViaEmail', () => {
  cy.get($.BILLING.DETAILS.SWITCH.BILL_VIA_EMAIL)
    .should('be.visible')
    .and('not.have.class', 'ant-switch-checked')
    .click()
    .should('have.class', 'ant-switch-checked')
})

Cypress.Commands.add('checkSendEmailPaidNotification', () => {
  cy.get($.BILLING.DETAILS.SWITCH.PAID_EMAIL_NOTIFICATION)
    .should('be.visible')
    .and('not.have.class', 'ant-switch-checked')
    .click()
    .should('have.class', 'ant-switch-checked')
})

Cypress.Commands.add('selectBillingDetailsItemPaymentMethod', (billingPaymentMethod) => {
  cy.get($.BILLING.DETAILS.DROPDOWN.PAYMENT_METHOD)
    .should('be.visible')
    .click()

  cy.contains(`${$.GENERAL.DROPDOWN.SELECT_DROPDOWN_MENU_ITEM}:visible`, billingPaymentMethod)
    .click()

  cy.get($.BILLING.DETAILS.DROPDOWN.PAYMENT_METHOD)
    .should('contain', billingPaymentMethod)
})

Cypress.Commands.add('selectBillingDetailsItemPriceCurrency', (priceCurrency) => {
  cy.get($.BILLING.DETAILS.DROPDOWN.PRICE_CURRENCY)
    .click()

  cy.contains(`${$.GENERAL.DROPDOWN.SELECT_DROPDOWN_MENU_ITEM}:visible`, priceCurrency)
    .click()

  cy.get($.BILLING.DETAILS.DROPDOWN.PRICE_CURRENCY)
    .should('contain', priceCurrency)
})

Cypress.Commands.add('selectBillingDetailsItemReceiveCurrency', (receiveCurrency) => {
  cy.get($.BILLING.DETAILS.DROPDOWN.RECEIVE_CURRENCY)
    .click()

  cy.contains(`${$.GENERAL.DROPDOWN.SELECT_DROPDOWN_MENU_ITEM}:visible`, receiveCurrency)
    .click()

  cy.get($.BILLING.DETAILS.DROPDOWN.RECEIVE_CURRENCY)
    .should('contain', receiveCurrency)
})
