import $ from '@selectors/index'
import cryptoPayoutCurrencyInfo from '@fixtures/crypto-payout-settings.json'
import { generateTrader } from '@entity/entity-helper-functions'

describe('Trader - Exchange - Check order display', () => {
  const { email, password, countryCode } = generateTrader()

  const sellCurrency = cryptoPayoutCurrencyInfo.BTC
  const receiveCurrency = cryptoPayoutCurrencyInfo.LTC

  const exchangeOrderInfo = {
    receiveCurrencyPlatformId: receiveCurrency.platform.id,
    receiveCurrencySymbol: receiveCurrency.currencySymbol,
    sellAmount: sellCurrency.amount,
    sellCurrencyPlatformId: sellCurrency.platform.id,
    sellCurrencySymbol: sellCurrency.currencySymbol
  }

  before(() => {
    cy.clearCookies()
    cy.setUpVerifiedPersonalAccount(email, password, countryCode)

    cy.visit('/account/dashboard')
    cy.addAndConfirmCryptoPayoutSettingViaAPI(receiveCurrency)
  })

  beforeEach(() => {
    cy.loginViaAPI(email, password)

    cy.visit('/account/dashboard')
    cy.createExchangeTraderOrderViaAPI(exchangeOrderInfo)
  })

  it('Check if "Swap" order is displayed in "Dashboard" & "Orders"', () => {
    cy.visit('/account/trader/orders')

    cy.get('tbody tr')
      .first()
      .should('contain', 'Waiting for payment')
      .and('contain', 'Swap')
      .and('contain', exchangeOrderInfo.sellAmount)

    cy.visit('/account/dashboard')

    cy.get('tbody tr')
      .first()
      .should('contain', 'Waiting for payment')
      .and('contain', 'Swap')
      .and('contain', exchangeOrderInfo.sellAmount)
  })

  it('Check if paid "Swap" order is displayed in "Dashboard" & "Orders"', () => {
    cy.visit('/account/dashboard')

    cy.getOrderIdAndConfirmPaymentReceived()

    cy.visit('/account/trader/orders')

    cy.get('tbody tr')
      .first()
      .should('not.contain', 'Waiting for payment')
      .and('contain', 'Completed')
      .and('contain', 'Swap')
      .and('contain', exchangeOrderInfo.sellAmount)

    cy.visit('/account/dashboard')

    cy.get('tbody tr')
      .first()
      .should('not.contain', 'Waiting for payment')
      .and('contain', 'Completed')
      .and('contain', 'Swap')
      .and('contain', exchangeOrderInfo.sellAmount)
  })

  it('Check if paid & withdrawn "Swap" order is displayed in "Balances"', () => {
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
                cy.assertTableDataCellContains(4, receiveCurrency.payoutSettingTitle)

                cy.assertTableDataCellIsNotEmpty(5)
              })
          })
      })
  })
})
