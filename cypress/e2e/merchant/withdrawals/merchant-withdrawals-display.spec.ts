import { cryptoCurrencySymbol } from '@fixtures/crypto-currency-info.json'
import { fiatCurrencyCode, fiatMaxAmount } from '@fixtures/fiat-currency-info.json'
import { generateBusinessForAPI, generateTrader } from '@entity/entity-helper-functions'
import { payoutSettingTitle } from '@fixtures/fiat-payout-settings.json'

describe('Merchant - Withdrawals - Display', () => {
  const { email, password, countryCode } = generateTrader()

  const business = generateBusinessForAPI()

  before(() => {
    cy.clearCookies()
    cy.setUpVerifiedPersonalAccount(email, password, countryCode)

    cy.visit('/account/dashboard')
    cy.setUpVerifiedBusinessAccount(business)

    cy.addAndConfirmFiatPayoutSettingViaAPI()

    cy.createApiAppViaAPI()
      .then((response) => {
        const AUTH_TOKEN = response.body.api_app.auth_token

        cy.createOrderViaApiApp(AUTH_TOKEN, fiatMaxAmount, fiatCurrencyCode, fiatCurrencyCode)
          .markApiAppOrderAsPaid(cryptoCurrencySymbol)
      })

    cy.visit('/account/dashboard')
    cy.createWithdrawalViaAPI(fiatCurrencyCode)
  })

  beforeEach(() => {
    cy.loginViaAPI(email, password)
  })

  it('Check "Pending" withdrawal display', () => {
    cy.visit('/account/withdrawals')

    cy.breadcrumbContains('/Account/Merchant/Withdrawals')

    cy.getMerchantWithdrawalsViaAPI()
      .then((response) => {
        const withdrawalID = response.body.data[0].id
        const withdrawalAmount = Number(response.body.data[0].amount)

        cy.get('tbody tr')
          .should('be.visible')
          .first()
          .within(() => {
            cy.assertTableDataCellContains(0, `${withdrawalID}`)
            cy.assertTableDataCellContains(1, 'Pending')
            cy.assertTableDataCellContains(2, `${withdrawalAmount} ${fiatCurrencyCode}`)
            cy.assertTableDataCellContains(3, payoutSettingTitle)

            cy.assertTableDataCellIsNotEmpty(4)
          })
      })
  })

  it('Check "Completed" withdrawal display', () => {
    cy.visit('/account/withdrawals')

    cy.breadcrumbContains('/Account/Merchant/Withdrawals')

    cy.getMerchantWithdrawalsViaAPI()
      .then((response) => {
        const withdrawalID = response.body.data[0].id
        const withdrawalAmount = Number(response.body.data[0].amount)

        cy.get('tbody tr td')
          .should('be.visible')
          .first()
          .invoke('text')
          .should('contain', withdrawalID)

        cy.completeWithdrawalViaAPI(withdrawalID)

        cy.reload()

        cy.get('tbody tr')
          .should('be.visible')
          .first()
          .within(() => {
            cy.assertTableDataCellContains(0, `${withdrawalID}`)
            cy.assertTableDataCellContains(1, 'Completed')
            cy.assertTableDataCellContains(2, `${withdrawalAmount} ${fiatCurrencyCode}`)
            cy.assertTableDataCellContains(3, payoutSettingTitle)

            cy.assertTableDataCellIsNotEmpty(4)
          })
      })
  })

  after(() => {
    cy.deleteAllApiApps()
  })
})
