import $ from '@selectors/index'
import cryptoPayoutCurrencyInfo from '@fixtures/crypto-payout-settings.json'
import { generateTrader } from '@entity/entity-helper-functions'
import { payoutSettingTitle } from '@fixtures/fiat-payout-settings.json'
import { traderCurrencyCode } from '@fixtures/trader-currency-and-country.json'

describe('Mobile - Trader - Sell - Check order display', () => {
  const { email, password, countryCode } = generateTrader()

  const { currencySymbol, amount, platform } = cryptoPayoutCurrencyInfo.BTC

  const sellOrderInfo = {
    receiveCurrencySymbol: traderCurrencyCode,
    sellAmount: amount,
    sellCurrencyPlatformId: platform.id,
    sellCurrencySymbol: currencySymbol
  }

  before(() => {
    cy.clearCookies()
    cy.setUpVerifiedPersonalAccount(email, password, countryCode)

    cy.visit('/account/dashboard')
    cy.addAndConfirmFiatPayoutSettingViaAPI()
  })

  beforeEach(() => {
    cy.setMobileResolution()

    cy.loginViaAPI(email, password)

    cy.visit('/account/dashboard')
    cy.createSellTraderOrderViaAPI(sellOrderInfo)
  })

  it('[Mobile] Check if "Sell" order is displayed in "Dashboard" & "Orders"', () => {
    cy.visit('/account/trader/orders')

    cy.get('tbody tr')
      .first()
      .should('contain', 'Waiting for payment')
      .and('contain', 'Sell')
      .and('contain', sellOrderInfo.sellAmount)

    cy.visit('/account/dashboard')

    cy.get('tbody tr')
      .first()
      .should('contain', 'Waiting for payment')
      .and('contain', 'Sell')
      .and('contain', sellOrderInfo.sellAmount)
  })

  it('[Mobile] Check if paid "Sell" order is displayed in "Dashboard" & "Orders"', () => {
    cy.visit('/account/dashboard')

    cy.getOrderIdAndConfirmPaymentReceived()

    cy.visit('/account/trader/orders')

    cy.get('tbody tr')
      .first()
      .should('contain', 'Completed')
      .and('contain', 'Sell')
      .and('contain', sellOrderInfo.sellAmount)

    cy.visit('/account/dashboard')

    cy.get('tbody tr')
      .first()
      .should('contain', 'Completed')
      .and('contain', 'Sell')
      .and('contain', sellOrderInfo.sellAmount)
  })

  it('[Mobile] Check if paid & withdrawn "Sell" order is displayed in "Balances"', () => {
    cy.getTraderOrdersViaAPI()
      .then((response) => {
        const orderID = response.body.data[0].id

        cy.confirmTraderOrderPaymentReceivedViaAPI(orderID)
      })

    cy.getLedgerWithdrawalsViaAPI()
      .then((response) => {
        const withdrawal = response.body.data.find((withdrawal) => withdrawal.status === 'pending')
        const withdrawalID = withdrawal.id
        const withdrawalCurrencySymbol = withdrawal.currency.iso_symbol

        cy.completeWithdrawalViaAPI(withdrawalID)

        cy.visit('/account/balances')

        cy.get($.BALANCES.TABLE.BALANCE_WITHDRAWALS)
          .should('be.visible')
          .within(() => {
            cy.get('tbody tr')
              .first()
              .within(() => {
                cy.assertTableDataCellContains(0, withdrawalID)
                cy.assertTableDataCellContains(1, 'Completed')
                cy.assertTableDataCellContains(2, withdrawalCurrencySymbol)
                cy.assertTableDataCellContains(3, 'balance')
                cy.assertTableDataCellContains(4, payoutSettingTitle)

                cy.assertTableDataCellIsNotEmpty(5)
              })
          })
      })
  })
})
