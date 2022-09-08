import $ from '@selectors/index'
import fiatPayoutCurrencyInfo from '@fixtures/fiat-payout-settings.json'
import { getApiURL, getTestingApiURL } from '@support/helper-functions'
import { ICurrency } from './interfaces'
import { traderCountryCode } from '@fixtures/trader-currency-and-country.json'
import { traderCurrencyCode } from '@fixtures/trader-currency-and-country.json'

declare global {
  namespace Cypress {
    interface Chainable {
      /** Returns all currencies available when paying in Trader section. Used for dynamically getting currency IDs */
      getCurrenciesFromTraderBuyViaAPI(): Promise<any>
      addCryptoPayoutSettingViaAPI(currency: ICurrency): Promise<any>
      addFiatPayoutSettingViaAPI(currency: {
        accountHolderName: string
        bankName: string
        IBAN: string
        SWIFT: string
        payoutSettingTitle: string
      }): Promise<any>
      getCurrencyPayoutSettingsViaAPI(currencySymbol: string): Promise<any>
      confirmPayoutSettingViaAPI(currencySymbol: string): Promise<any>
      addAndConfirmCryptoPayoutSettingViaAPI(currency: ICurrency): Promise<any>
      addAndConfirmFiatPayoutSettingViaAPI(confirmationCurrency?: string): Promise<any>
      getCurrenciesViaAPI(): Promise<any>
      selectPayoutSettingNetwork(platformTitle: string): Chainable<Element>
    }
  }
}

const testingApiURL = getTestingApiURL()

Cypress.Commands.add('getCurrenciesFromTraderBuyViaAPI', () => {
  cy.logStep('API: Get currencies from trader buy')

  cy.internalRequest({
    url: `/account/trader/trade/currencies?country=${traderCountryCode}&method=buy`
  }).then((response) => {
    expect(response.status).to.be.eq(200)
  })
})

Cypress.Commands.add('addCryptoPayoutSettingViaAPI', ({ currencyTitle, payoutAddress, platform, payoutSettingTitle }) => {
  cy.logStep('API: Add crypto payout setting')

  cy.getCurrenciesFromTraderBuyViaAPI()
    .then((response) => {
      const currencyID = response.body.currencies.find((element) => element.title === currencyTitle).id

      cy.internalRequest({
        method: 'POST',
        url: '/account/payout_settings',
        body: {
          payout_setting: {
            crypto_address_attributes: {
              address: payoutAddress,
              crypto_platform_id: platform.id,
              currency_id: currencyID
            },
            title: payoutSettingTitle,
            category: 'crypto',
          },
        },
      }).then((response) => {
        expect(response.status).to.be.eq(200)
      })
    })
})

Cypress.Commands.add('addFiatPayoutSettingViaAPI', ({ accountHolderName, bankName, IBAN, SWIFT, payoutSettingTitle }) => {
  cy.logStep('API: Add fiat payout setting')

  cy.internalRequest({
    method: 'POST',
    url: '/account/payout_settings',
    body: {
      payout_setting: {
        bank_detail_attributes: {
          account_holder_name: accountHolderName,
          bank_name: bankName,
          iban: IBAN,
          swift: SWIFT
        },
        category: 'fiat',
        kind: 'sepa',
        title: payoutSettingTitle
      },
    },
  }).then((response) => {
    expect(response.status).to.be.eq(200)
  })
})

Cypress.Commands.add('getCurrencyPayoutSettingsViaAPI', (currencySymbol) => {
  cy.logStep('API: Get currency payout settings')

  cy.internalRequest({
    url: `/account/payout_settings/currency/${currencySymbol}`,
  }).then((response) => {
    expect(response.status).to.be.eq(200)
  })
})

Cypress.Commands.add('confirmPayoutSettingViaAPI', (currencySymbol) => {
  cy.logStep('API: Confirm payout setting')

  cy.getCurrencyPayoutSettingsViaAPI(currencySymbol)
    .then((response) => {
      const payoutSettingID = response.body[0].id

      cy.internalRequest({
        method: 'POST',
        url: `${testingApiURL}/payout_settings/${payoutSettingID}/confirm`
      }).then((response) => {
        expect(response.status).to.be.eq(204)
      })
    })
})

Cypress.Commands.add('addAndConfirmCryptoPayoutSettingViaAPI', (currency) => {
  cy.addCryptoPayoutSettingViaAPI(currency)
  cy.confirmPayoutSettingViaAPI(currency.currencySymbol)
})

Cypress.Commands.add('addAndConfirmFiatPayoutSettingViaAPI', (confirmationCurrency = traderCurrencyCode) => {
  cy.addFiatPayoutSettingViaAPI(fiatPayoutCurrencyInfo)
  cy.confirmPayoutSettingViaAPI(confirmationCurrency)
})

Cypress.Commands.add('getCurrenciesViaAPI', () => {
  cy.logStep('API: Get currencies')

  cy.internalRequest({
    url: `${getApiURL()}/currencies`,
  }).then((response) => {
    expect(response.status).to.be.eq(200)
  })
})

Cypress.Commands.add('selectPayoutSettingNetwork', (platformTitle) => {
  cy.get($.PAYOUT_SETTINGS.CRYPTO.DROPDOWN.CURRENCY_NETWORK)
    .should('be.visible')
    .click()

  cy.contains(`${$.GENERAL.DROPDOWN.SELECT_DROPDOWN_MENU_ITEM}:visible`, platformTitle)
    .click()

  cy.get($.PAYOUT_SETTINGS.CRYPTO.DROPDOWN.CURRENCY_NETWORK)
    .should('be.visible')
    .and('contain', platformTitle)
})
