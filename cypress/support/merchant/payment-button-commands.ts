import { generateRandomNumber } from '@support/helper-functions'

declare global {
  namespace Cypress {
    interface Chainable {
      /** Returns all currencies available when paying with a button. Used for dynamically getting currency IDs */
      getButtonCurrencyListViaAPI(): Cypress.Chainable<Cypress.Response<any>>
      createFixedPaymentButtonViaAPI(currency: string, amount: string | number): Chainable<Element>
      createSliderPaymentButtonViaAPI(
        currency: string,
        minAmount: string | number,
        maxAmount: string | number,
        sliderStep: string | number
      ): Chainable<Element>
      createDynamicPaymentButtonViaAPI(currency: string, ...amounts: string[] | number[]): Chainable<Element>
      deletePaymentButtonViaAPI(paymentButtonID: string | number): Chainable<Element>
      deleteAllPaymentButtons(): Chainable<Element>
      getPaymentButtonsViaAPI(): Promise<any>
    }
  }
}

Cypress.Commands.add('getButtonCurrencyListViaAPI', () => {
  cy.logStep('API: Get button currency list')

  cy.internalRequest({
    url: '/account/buttons/new.json'
  }).then((response) => {
    expect(response.status).to.be.eq(200)
  })
})

Cypress.Commands.add('createFixedPaymentButtonViaAPI', (currency, amount) => {
  cy.logStep('API: Create Fixed Payment Button')

  cy.getBusinessWebsiteViaAPI()
    .then((response) => {
      const websiteID = response.body.business.websites[0].id

      cy.getButtonCurrencyListViaAPI()
        .then((response) => {
          const currencyID = response.body.currencies.find((element) => element.label === currency).value

          cy.internalRequest({
            method: 'POST',
            url: '/account/buttons',
            body: {
              button: {
                currency_id: currencyID,
                invoice_time: 20,
                kind: 'fixed_price',
                payment_gateway_attributes: {
                  name: `auto-test-button-${generateRandomNumber()}`
                },
                price: amount,
                title: 'Auto Test Fixed Button',
                tool_website_attributes: {
                  website_id: websiteID
                }
              }
            }
          }).then((response) => {
            expect(response.status).to.be.eq(200)
          })
        })
    })
})

Cypress.Commands.add('createSliderPaymentButtonViaAPI',
  (
    currency,
    minAmount,
    maxAmount,
    sliderStep
  ) => {
    cy.logStep('API: Create Slider Payment Button')

    cy.getBusinessWebsiteViaAPI()
      .then((response) => {
        const websiteID = response.body.business.websites[0].id

        cy.getButtonCurrencyListViaAPI()
          .then((response) => {
            const currencyID = response.body.currencies.find((element) => element.label === currency).value

            cy.internalRequest({
              method: 'POST',
              url: '/account/buttons',
              body: {
                button: {
                  currency_id: currencyID,
                  invoice_time: 20,
                  kind: 'slider',
                  payment_gateway_attributes: {
                    name: `auto-test-button-${generateRandomNumber()}`,
                  },
                  min_price: minAmount,
                  max_price: maxAmount,
                  slider_step: sliderStep,
                  title: 'Auto Test Slider Button',
                  tool_website_attributes: {
                    website_id: websiteID,
                  }
                }
              }
            }).then((response) => {
              expect(response.status).to.be.eq(200)
            })
          })
      })
  }
)

Cypress.Commands.add('createDynamicPaymentButtonViaAPI', (currency, ...amounts) => {
  cy.logStep('API: Create Dynamic Payment Button')

  cy.getBusinessWebsiteViaAPI()
    .then((response) => {
      const websiteID = response.body.business.websites[0].id

      cy.getButtonCurrencyListViaAPI()
        .then((response) => {
          const currencyID = response.body.currencies.find((element) => element.label === currency).value

          cy.internalRequest({
            method: 'POST',
            url: '/account/buttons',
            body: {
              button: {
                currency_id: currencyID,
                invoice_time: 20,
                kind: 'dynamic_price',
                payment_gateway_attributes: {
                  name: `auto-test-button-${generateRandomNumber()}`
                },
                amounts,
                title: 'Auto Test Dynamic Button',
                tool_website_attributes: {
                  website_id: websiteID
                }
              }
            }
          }).then((response) => {
            expect(response.status).to.be.eq(200)
          })
        })
    })
})

Cypress.Commands.add('deletePaymentButtonViaAPI', (paymentButtonID) => {
  cy.logStep('API: Delete payment button')

  cy.internalRequest({
    url: `/account/buttons/${paymentButtonID}`,
    method: 'DELETE'
  }).then((response) => {
    expect(response.status).to.be.eq(204)
  })
})

Cypress.Commands.add('deleteAllPaymentButtons', () => {
  cy.visit('/account/buttons')

  cy.get('tbody tr')
    .each((tableRow) => {
      cy.wrap(tableRow)
        .find('td')
        .first()
        .invoke('text')
        .then((paymentButtonID) => {
          cy.deletePaymentButtonViaAPI(paymentButtonID)
        })
    })

  cy.reload()

  cy.assertEmptyTableState()
})

Cypress.Commands.add('getPaymentButtonsViaAPI', () => {
  cy.logStep('API: Get payment buttons')

  cy.internalRequest({
    url: '/account/buttons.json'
  }).then((response) => {
    expect(response.status).to.be.eq(200)
  })
})
