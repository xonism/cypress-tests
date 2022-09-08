import $ from '@selectors/index'
import { extractNumber } from '@support/trader/limit-helper-functions'
import { getApiURL } from '@support/helper-functions'

declare global {
  namespace Cypress {
    interface Chainable {
      selectSettlementSetting(buttonText: string): Chainable<Element>
      createApiAppViaAPI(): Promise<any>
      createOrderViaApiApp(AUTH_TOKEN: string, amount: string, payCurrency: string, receiveCurrency: string): Chainable<Element>
      /** Should be chained off `createOrderViaApiApp` */
      visitApiAppPaymentURL(): Chainable<Element>
      /** Should be chained off `createOrderViaApiApp` */
      markApiAppOrderAsPaid(cryptoCurrencySymbol: string, platformTitle?: string): Chainable<Element>
      deleteApiAppViaAPI(apiAppID: string | number): Chainable<Element>
      deleteAllApiApps(): Chainable<Element>
      getApiAppsViaAPI(): Promise<any>
      getApiAppRequestsViaAPI(): Promise<any>
      getApiPaymentCallbacksViaAPI(): Promise<any>
    }
  }
}

Cypress.Commands.add('selectSettlementSetting', (buttonText) => {
  cy.contains($.GENERAL.BTN.RADIO_WRAPPER, buttonText)
    .should('be.visible')
    .click()

  cy.contains($.GENERAL.BTN.RADIO_WRAPPER, buttonText)
    .should('be.visible')
    .should('have.class', 'ant-radio-button-wrapper-checked')
})

Cypress.Commands.add('createApiAppViaAPI', () => {
  cy.logStep('API: Create API App')

  cy.getBusinessWebsiteViaAPI()
    .then((response) => {
      const websiteID = response.body.business.websites[0].id

      cy.internalRequest({
        method: 'POST',
        url: '/account/apps',
        body: {
          api_app: {
            title: 'Auto Test App',
            tool_websites_attributes: [
              {
                website_id: websiteID
              }
            ]
          }
        }
      }).then((response) => {
        expect(response.status).to.be.eq(200)
      })
    })
})

Cypress.Commands.add('createOrderViaApiApp', (AUTH_TOKEN, amount, payCurrency, receiveCurrency) => {
  cy.logStep('API: Create order via API App')

  cy.internalRequest({
    url: `${getApiURL()}/orders`,
    method: 'POST',
    headers: {
      Authorization: `Token ${AUTH_TOKEN}`
    },
    body: {
      price_amount: amount,
      price_currency: payCurrency,
      receive_currency: receiveCurrency,
      callback_url: 'https://coingate.requestcatcher.com/test',
      success_url: 'https://img.icons8.com/cute-clipart/344/checked-checkbox.png',
      cancel_url: 'https://img.icons8.com/cute-clipart/344/delete-sign.png'
    }
  }).then((response) => {
    expect(response.status).to.be.eq(200)
  })
})

Cypress.Commands.add('visitApiAppPaymentURL', { prevSubject: true }, (subject: Cypress.Response<any>) => {
  cy.wrap(subject)
    .then((response) => {
      const paymentURL = response.body.payment_url

      cy.visit(paymentURL)
    })
})

Cypress.Commands.add('markApiAppOrderAsPaid', { prevSubject: true }, (subject: Cypress.Response<any>, cryptoCurrencySymbol, platformTitle) => {
  cy.wrap(subject)
    .then((response) => {
      const paymentURL = response.body.payment_url
      const formattedPaymentURL = paymentURL.replace('invoice', 'payments/mark-as-paid')

      cy.visit(paymentURL)

      cy.selectCryptoCurrencyInInvoice(cryptoCurrencySymbol)

      cy.get('#invoice-checkout-button') // FIXME: fix these steps after new invoice launch
        .should('be.visible')
        .click()

      if (cryptoCurrencySymbol === 'LTC') {
        cy.selectCryptoNetworkInInvoice(platformTitle)
      }

      cy.get('.invoice-progress-bar')
        .should('be.visible')

      cy.get('#invoice-qr-code')
        .should('be.visible')

      cy.markInvoiceAsPaidViaAPI(formattedPaymentURL)
    })
})

Cypress.Commands.add('deleteApiAppViaAPI', (apiAppID) => {
  cy.logStep('API: Delete API app')

  cy.internalRequest({
    url: `/account/apps/${apiAppID}`,
    method: 'DELETE'
  }).then((response) => {
    expect(response.status).to.be.eq(200)
  })
})

Cypress.Commands.add('deleteAllApiApps', () => {
  cy.visit('/account/apps')

  cy.get($.GENERAL.LIST_ITEM_META_TITLE)
    .each((titleElement) => {
      cy.wrap(titleElement)
        .invoke('text')
        .then((titleText) => {
          const apiAppNumber = extractNumber(titleText)

          cy.deleteApiAppViaAPI(apiAppNumber)
        })
    })

  cy.reload()

  cy.assertEmptyTableState()
})

Cypress.Commands.add('getApiAppsViaAPI', () => {
  cy.logStep('API: Get API apps')

  cy.internalRequest({
    url: '/account/apps.json'
  }).then((response) => {
    expect(response.status).to.be.eq(200)
  })
})

Cypress.Commands.add('getApiAppRequestsViaAPI', () => {
  cy.logStep('API: Get API app requests')

  cy.internalRequest({
    url: '/account/apps/api-requests.json'
  }).then((response) => {
    expect(response.status).to.be.eq(200)
  })
})

Cypress.Commands.add('getApiPaymentCallbacksViaAPI', () => {
  cy.logStep('API: Get API payment callbacks')

  cy.internalRequest({
    url: '/account/apps/api-payment-callbacks.json'
  }).then((response) => {
    expect(response.status).to.be.eq(200)
  })
})
