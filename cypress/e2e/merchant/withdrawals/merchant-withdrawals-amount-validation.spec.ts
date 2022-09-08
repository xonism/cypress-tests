import $ from '@selectors/index'
import cryptoPayoutCurrencyInfo from '@fixtures/crypto-payout-settings.json'
import fiatPayoutCurrencyInfo from '@fixtures/fiat-payout-settings.json'
import { cryptoCurrencySymbol } from '@fixtures/crypto-currency-info.json'
import { fiatCurrencyCode } from '@fixtures/fiat-currency-info.json'
import { generateBusinessForAPI, generateTrader } from '@entity/entity-helper-functions'
import { getSelectorWithoutLastTwoSymbols } from '@support/helper-functions'

describe('Merchant - Withdrawals - Amount Validation', () => {
  const { email, password, countryCode } = generateTrader()

  const business = generateBusinessForAPI()

  const receiveCryptoCurrency = cryptoPayoutCurrencyInfo.BTC

  const PAYOUT_SETTING_SELECTOR_START = getSelectorWithoutLastTwoSymbols($.MERCHANT.WITHDRAWALS.DROPDOWN.PAYOUT_SETTING)
  const WITHDRAW_BUTTON_SELECTOR_START = getSelectorWithoutLastTwoSymbols($.MERCHANT.WITHDRAWALS.BTN.WITHDRAW)

  before(() => {
    cy.clearCookies()
    cy.setUpVerifiedPersonalAccount(email, password, countryCode)

    cy.visit('/account/dashboard')
    cy.setUpVerifiedBusinessAccount(business)

    cy.addAndConfirmFiatPayoutSettingViaAPI()
    cy.addAndConfirmCryptoPayoutSettingViaAPI(receiveCryptoCurrency)

    cy.getMerchantPayoutBalancesViaAPI()
      .then((response) => {
        const minWithdrawalAmounts = response.body.min_withdrawal_amounts
        const minFiatWithdrawalAmount = minWithdrawalAmounts.find((currency) => currency.iso_symbol === fiatCurrencyCode).amount
        const minCryptoWithdrawalAmount = minWithdrawalAmounts.find((currency) => currency.iso_symbol === cryptoCurrencySymbol).amount

        cy.createApiAppViaAPI()
          .then((response) => {
            const AUTH_TOKEN = response.body.api_app.auth_token

            cy.createOrderViaApiApp(AUTH_TOKEN, minFiatWithdrawalAmount, fiatCurrencyCode, fiatCurrencyCode)
              .markApiAppOrderAsPaid(cryptoCurrencySymbol)

            cy.createOrderViaApiApp(AUTH_TOKEN, minCryptoWithdrawalAmount, cryptoCurrencySymbol, cryptoCurrencySymbol)
              .markApiAppOrderAsPaid(cryptoCurrencySymbol)
          })
      })
  })

  beforeEach(() => {
    cy.loginViaAPI(email, password)
  })

  it('Check fiat minimum amount validation', () => {
    // '[data-test="select-payout-setting-BTC"]'
    const PAYOUT_SETTING_DROPDOWN_SELECTOR = `${PAYOUT_SETTING_SELECTOR_START}-${fiatCurrencyCode}"]`

    cy.visit('/account/withdrawals#payout-balances')

    cy.breadcrumbContains('/Account/Merchant/Withdrawals')

    cy.get(PAYOUT_SETTING_DROPDOWN_SELECTOR)
      .should('be.visible')
      .click()

    cy.contains($.GENERAL.DROPDOWN.SELECT_DROPDOWN_MENU_ITEM, fiatPayoutCurrencyInfo.IBAN)
      .should('be.visible')
      .click()

    cy.getMerchantPayoutBalancesViaAPI()
      .then((response) => {
        const currencyPayoutBalance = response.body.payout_balances.find((payoutBalance) => payoutBalance.currency.iso_symbol === fiatCurrencyCode)
        const withdrawalAmount = currencyPayoutBalance.payout_sum

        const firstPayoutSettingObject = currencyPayoutBalance.payout_settings[0]
        const minAmount = Number(firstPayoutSettingObject.min_amount)
        const outgoingFeeAmount = Number(firstPayoutSettingObject.outgoing_fee.amount)

        // '[data-test="button-withdraw-BTC"]'
        const WITHDRAW_BUTTON_SELECTOR = `${WITHDRAW_BUTTON_SELECTOR_START}-${fiatCurrencyCode}"]`

        cy.get(WITHDRAW_BUTTON_SELECTOR)
          .should('be.visible')
          .and('contain', `Withdraw ${withdrawalAmount} ${fiatCurrencyCode}`)
          .click()

        cy.get($.GENERAL.FORM.EXPLAIN)
          .should('be.visible')
          .and('contain', `Minimum withdrawal amount is ${minAmount + outgoingFeeAmount} ${fiatCurrencyCode}`)
      })
  })

  it('Check crypto minimum amount validation', () => {
    // '[data-test="select-payout-setting-BTC"]'
    const PAYOUT_SETTING_DROPDOWN_SELECTOR = `${PAYOUT_SETTING_SELECTOR_START}-${cryptoCurrencySymbol}"]`

    cy.visit('/account/withdrawals#payout-balances')

    cy.breadcrumbContains('/Account/Merchant/Withdrawals')

    cy.get(PAYOUT_SETTING_DROPDOWN_SELECTOR)
      .should('be.visible')
      .click()

    cy.contains($.GENERAL.DROPDOWN.SELECT_DROPDOWN_MENU_ITEM, receiveCryptoCurrency.payoutAddress)
      .should('be.visible')
      .click()

    cy.getMerchantPayoutBalancesViaAPI()
      .then((response) => {
        const currencyPayoutBalance = response.body.payout_balances.find((payoutBalance) => payoutBalance.currency.iso_symbol === cryptoCurrencySymbol)
        const withdrawalAmount = currencyPayoutBalance.payout_sum

        const firstPayoutSettingObject = currencyPayoutBalance.payout_settings[0]
        const minAmount = Number(firstPayoutSettingObject.min_amount)
        const outgoingFeeAmount = Number(firstPayoutSettingObject.outgoing_fee.amount)

        // '[data-test="button-withdraw-BTC"]'
        const WITHDRAW_BUTTON_SELECTOR = `${WITHDRAW_BUTTON_SELECTOR_START}-${cryptoCurrencySymbol}"]`

        cy.get(WITHDRAW_BUTTON_SELECTOR)
          .should('be.visible')
          .and('contain', `Withdraw ${withdrawalAmount} ${cryptoCurrencySymbol}`)
          .click()

        cy.get($.GENERAL.FORM.EXPLAIN)
          .should('be.visible')
          .and('contain', `Minimum withdrawal amount is ${minAmount + outgoingFeeAmount} ${cryptoCurrencySymbol}`)
      })
  })

  after(() => {
    cy.deleteAllApiApps()
  })
})
