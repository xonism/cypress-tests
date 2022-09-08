import { generateTrader } from '@entity/entity-helper-functions'
import { getTestingApiURL } from '@support/helper-functions'
import { traderCurrencyCode } from '@fixtures/trader-currency-and-country.json'

declare global {
  namespace Cypress {
    interface Chainable {
      createBuyTraderOrderViaAPI(
        buyOrderInfo: {
          receiveCurrencyPlatformID: number,
          receiveCurrencySymbol: string,
          sellAmount: number | string,
          sellCurrencySymbol?: string
        }
      ): Promise<any>
      createSellTraderOrderViaAPI(
        sellOrderInfo: {
          receiveCurrencySymbol: string,
          sellAmount: number,
          sellCurrencyPlatformId: number,
          sellCurrencySymbol: string
        }
      ): Promise<any>
      createSellTraderOrderWithReceiveAmountViaAPI(
        sellOrderInfo: {
          receiveCurrencySymbol: string,
          receiveAmount: number,
          sellCurrencyPlatformId: number,
          sellCurrencySymbol: string
        }
      ): Promise<any>
      createExchangeTraderOrderViaAPI(
        sellOrderInfo: {
          receiveCurrencyPlatformId: number,
          receiveCurrencySymbol: string,
          sellAmount: string | number,
          sellCurrencyPlatformId: number,
          sellCurrencySymbol: string
        }
      ): Promise<any>
      confirmTraderOrderPaymentReceivedViaAPI(orderID: string): Promise<any>
      getTraderOrderViaAPI(orderID: string): Promise<any>
      getTraderOrdersViaAPI(): Promise<any>
    }
  }
}

const testingApiURL = getTestingApiURL()

Cypress.Commands.add('createBuyTraderOrderViaAPI',
  ({
    receiveCurrencyPlatformID,
    receiveCurrencySymbol,
    sellAmount,
    sellCurrencySymbol
  }) => {
    cy.logStep('API: Create buy trader order')

    const { countryCode } = generateTrader()

    cy.internalRequest({
      url: '/account/trader/trade/buy',
      method: 'POST',
      body: {
        trader_order: {
          country: countryCode,
          kind_of_exactly_amount: 'sell',
          payment_type: 'sepa',
          receive_currency_platform_id: receiveCurrencyPlatformID,
          receive_currency_symbol: receiveCurrencySymbol,
          sell_amount: sellAmount,
          sell_currency_symbol: sellCurrencySymbol ? sellCurrencySymbol : traderCurrencyCode
        },
      },
    }).then((response) => {
      expect(response.status).to.be.eq(200)
    })
  })

Cypress.Commands.add('createSellTraderOrderViaAPI',
  ({
    receiveCurrencySymbol,
    sellAmount,
    sellCurrencyPlatformId,
    sellCurrencySymbol
  }) => {
    cy.logStep('API: Create sell trader order')

    cy.getCurrencyPayoutSettingsViaAPI(receiveCurrencySymbol)
      .then((response) => {
        const payoutSettingID = Number(response.body[0].id)

        cy.internalRequest({
          url: '/account/trader/trade/sell',
          method: 'POST',
          body: {
            trader_order: {
              kind_of_exactly_amount: 'sell',
              payout_setting_id: payoutSettingID,
              receive_currency_platform_id: null,
              receive_currency_symbol: receiveCurrencySymbol,
              sell_amount: sellAmount,
              sell_currency_platform_id: sellCurrencyPlatformId,
              sell_currency_symbol: sellCurrencySymbol
            },
          },
        }).then((response) => {
          expect(response.status).to.be.eq(200)
        })
      })
  })

Cypress.Commands.add('createSellTraderOrderWithReceiveAmountViaAPI',
  ({
    receiveCurrencySymbol,
    receiveAmount,
    sellCurrencyPlatformId,
    sellCurrencySymbol
  }) => {
    cy.logStep('API: Create sell trader order')

    cy.getCurrencyPayoutSettingsViaAPI(receiveCurrencySymbol)
      .then((response) => {
        const payoutSettingID = Number(response.body[0].id)

        cy.internalRequest({
          url: '/account/trader/trade/sell',
          method: 'POST',
          body: {
            trader_order: {
              kind_of_exactly_amount: 'receive',
              payout_setting_id: payoutSettingID,
              receive_amount: receiveAmount,
              receive_currency_platform_id: null,
              receive_currency_symbol: receiveCurrencySymbol,
              sell_currency_platform_id: sellCurrencyPlatformId,
              sell_currency_symbol: sellCurrencySymbol
            },
          },
        }).then((response) => {
          expect(response.status).to.be.eq(200)
        })
      })
  })

Cypress.Commands.add('createExchangeTraderOrderViaAPI',
  ({
    receiveCurrencyPlatformId,
    receiveCurrencySymbol,
    sellAmount,
    sellCurrencyPlatformId,
    sellCurrencySymbol
  }) => {
    cy.logStep('API: Create sell trader order')

    cy.getCurrencyPayoutSettingsViaAPI(receiveCurrencySymbol)
      .then((response) => {
        const payoutSettingID = Number(response.body[0].id)

        cy.internalRequest({
          url: '/account/trader/trade/sell',
          method: 'POST',
          body: {
            trader_order: {
              auto_redeem: true,
              kind_of_exactly_amount: 'sell',
              payout_setting_id: payoutSettingID,
              receive_currency_platform_id: receiveCurrencyPlatformId,
              receive_currency_symbol: receiveCurrencySymbol,
              sell_amount: sellAmount,
              sell_currency_platform_id: sellCurrencyPlatformId,
              sell_currency_symbol: sellCurrencySymbol
            },
          },
        }).then((response) => {
          expect(response.status).to.be.eq(200)
        })
      })
  })

Cypress.Commands.add('confirmTraderOrderPaymentReceivedViaAPI', (orderID) => {
  cy.logStep('API: Confirm trader order payment received')

  cy.internalRequest({
    method: 'POST',
    url: `${testingApiURL}/trader_orders/${orderID}/complete`
  }).then((response) => {
    expect(response.status).to.be.eq(204)
  })
})

Cypress.Commands.add('getTraderOrderViaAPI', (orderID) => {
  cy.logStep('API: Get trader order')

  cy.internalRequest({
    url: `/account/trader/orders/${orderID}.json`
  }).then((response) => {
    expect(response.status).to.be.eq(200)
  })
})

Cypress.Commands.add('getTraderOrdersViaAPI', () => {
  cy.logStep('API: Get trader orders')

  cy.internalRequest({
    url: '/account/trader/orders.json'
  }).then((response) => {
    expect(response.status).to.be.eq(200)
  })
})
