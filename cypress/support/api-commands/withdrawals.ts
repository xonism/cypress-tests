import { getTestingApiURL } from '@support/helper-functions'

declare global {
  namespace Cypress {
    interface Chainable {
      createWithdrawalViaAPI(currencyCode: string): Promise<any>
      completeWithdrawalViaAPI(withdrawalID: string): Promise<any>
      getMerchantWithdrawalViaAPI(withdrawalID: string): Promise<any>
      getMerchantWithdrawalsViaAPI(): Promise<any>
      getMerchantPayoutBalancesViaAPI(): Promise<any>
    }
  }
}

const testingApiURL = getTestingApiURL()

Cypress.Commands.add('createWithdrawalViaAPI', (currencyCode) => {
  cy.logStep('API: Create withdrawal')

  cy.getCurrencyPayoutSettingsViaAPI(currencyCode)
    .then((response) => {
      const payoutSettingID = response.body[0].id

      cy.internalRequest({
        method: 'POST',
        url: '/account/withdrawals',
        body: {
          'withdrawal': {
            'payout_setting_id': payoutSettingID
          },
          'currency': currencyCode
        }
      }).then((response) => {
        expect(response.status).to.be.eq(204)
      })
    })
})

Cypress.Commands.add('completeWithdrawalViaAPI', (withdrawalID) => {
  cy.logStep('API: Complete withdrawal')

  cy.internalRequest({
    method: 'POST',
    url: `${testingApiURL}/withdrawals/${withdrawalID}/complete`
  }).then((response) => {
    expect(response.status).to.be.eq(204)
  })
})

Cypress.Commands.add('getMerchantWithdrawalViaAPI', (withdrawalID) => {
  cy.logStep('API: Get merchant withdrawal')

  cy.internalRequest({
    url: `/account/withdrawals/${withdrawalID}.json`
  }).then((response) => {
    expect(response.status).to.be.eq(200)
  })
})

Cypress.Commands.add('getMerchantWithdrawalsViaAPI', () => {
  cy.logStep('API: Get merchant withdrawals')

  cy.internalRequest({
    url: '/account/withdrawals.json'
  }).then((response) => {
    expect(response.status).to.be.eq(200)
  })
})

Cypress.Commands.add('getMerchantPayoutBalancesViaAPI', () => {
  cy.logStep('API: Get merchant payout balances')

  cy.internalRequest({
    url: '/account/withdrawals/payout_balances'
  }).then((response) => {
    expect(response.status).to.be.eq(200)
  })
})
