/* eslint quotes: "off" */

declare namespace Cypress {
  interface Chainable {
    generateCryptoFixture(): Promise<any>
  }
}

Cypress.Commands.add('generateCryptoFixture', () => {
  cy.logStep('Generate Fixture')

  cy.getCurrenciesViaAPI()
    .then((response) => {
      const getCurrencyEnabledPlatform = (currencySymbol) => {
        const currencyPlatforms = response.body.find((element) => element.symbol === currencySymbol).platforms

        return currencyPlatforms.find((element) => element.enabled === true)
      }

      cy.writeFile('cypress/fixtures/crypto-payout-settings.json', {
        "BTC": {
          "currencyTitle": "Bitcoin",
          "currencySymbol": "BTC",
          "payoutAddress": "tb1qrhqzduxevr3yvjdu54ak966qhfhj4g84uk3eky",
          "payoutSettingTitle": "BTC Address",
          "amount": 0.2,
          "platform": getCurrencyEnabledPlatform("BTC")
        },
        "LTC": {
          "currencyTitle": "Litecoin",
          "currencySymbol": "LTC",
          "payoutAddress": "QUtpHc1ExnEc7zFcWyVDtToErRU1bZ972c",
          "payoutSettingTitle": "LTC Address",
          "amount": 5,
          "platform": getCurrencyEnabledPlatform("LTC")
        },
        "USDT": {
          "currencyTitle": "Tether",
          "currencySymbol": "USDT",
          "payoutAddress": "0x04f535663110a392a6504839beed34e019fdb4e0",
          "payoutSettingTitle": "USDT Address",
          "amount": 100,
          "platform": getCurrencyEnabledPlatform("USDT")
        }
      })
    })
})
