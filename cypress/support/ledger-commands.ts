import $ from '@selectors/index'
import { fiatCurrencyCode, fiatTargetAmount } from '@fixtures/fiat-currency-info.json'

declare global {
  namespace Cypress {
    interface Chainable {
      getLedgerAccountsViaAPI(): Promise<any>
      createLedgerWithdrawalViaAPI(currencyCode: string): Promise<any>
      getLedgerWithdrawalsViaAPI(): Promise<any>
      getLedgerAccountViaAPI(ledgerAccountID: string): Promise<any>
      getLedgerTransactionsViaAPI(): Promise<any>
      assertAllTransactionRowsHaveAccountNameAndDate(rowAmount: number, accountName: string): Chainable<Element>
      submitEditedLedgerAccountName(newAccountName: string, ledgerAccountID: string): Chainable<Element>
      /** @param optionCount - how many options there should be in the dropdown menu */
      setAccountFilterInBalances(currencyTitle: string, optionCount: number): Chainable<Element>
      /** @param optionCount - how many options there should be in the dropdown menu */
      setCryptocurrencyFilterInBalances(currencySymbol: string, optionCount: number): Chainable<Element>
      setDateFilterToLastMonthInBalances(): Chainable<Element>
      setDateFilterToTodayInBalances(): Chainable<Element>
      clearBalanceTransactionFilters(): Chainable<Element>
      assertPendingLedgerWithdrawalsAreVisible(): Chainable<Element>
      setUpTraderLedgerWithdrawal(buyOrderInfo): Chainable<Element>
      setUpMerchantLedgerWithdrawal(buyOrderInfo): Chainable<Element>
    }
  }
}

Cypress.Commands.add('getLedgerAccountsViaAPI', () => {
  cy.logStep('API: Get ledger accounts')

  cy.internalRequest({
    url: '/account/balances.json'
  }).then((response) => {
    expect(response.status).to.be.eq(200)
  })
})

Cypress.Commands.add('createLedgerWithdrawalViaAPI', (currencyCode) => {
  cy.logStep('API: Create ledger withdrawal')

  cy.getLedgerAccountsViaAPI()
    .then((response) => {
      const ledgerCurrencyAccount = response.body.data.find((ledgerAccount) => ledgerAccount.currency_iso_symbol === currencyCode)
      const ledgerCurrencyAccountID = ledgerCurrencyAccount.id
      const ledgerCurrencyAmount = ledgerCurrencyAccount.amount

      cy.getCurrencyPayoutSettingsViaAPI(currencyCode)
        .then((response) => {
          const payoutSettingID = response.body[0].id

          cy.internalRequest({
            method: 'POST',
            url: `/account/balances/${ledgerCurrencyAccountID}/withdraw`,
            body: {
              'payout_setting_id': payoutSettingID,
              'amount': ledgerCurrencyAmount
            }
          }).then((response) => {
            expect(response.status).to.be.eq(200)
          })
        })
    })
})

Cypress.Commands.add('getLedgerWithdrawalsViaAPI', () => {
  cy.logStep('API: Get ledger withdrawals')

  cy.internalRequest({
    url: '/account/balances/ledger_withdrawals'
  }).then((response) => {
    expect(response.status).to.be.eq(200)
  })
})

Cypress.Commands.add('getLedgerAccountViaAPI', (ledgerAccountID) => {
  cy.logStep('API: Get ledger account')

  cy.internalRequest({
    url: `/account/balances/${ledgerAccountID}.json`
  }).then((response) => {
    expect(response.status).to.be.eq(200)
  })
})

Cypress.Commands.add('getLedgerTransactionsViaAPI', () => {
  cy.logStep('API: Get ledger transactions')

  cy.internalRequest({
    url: '/account/balances/transactions.json'
  }).then((response) => {
    expect(response.status).to.be.eq(200)
  })
})

Cypress.Commands.add('assertAllTransactionRowsHaveAccountNameAndDate', (rowAmount, accountName) => {
  cy.get('tbody tr')
    .should('be.visible')
    .and('have.length', rowAmount)
    .each((tableRow) => {
      cy.wrap(tableRow)
        .within(() => {
          cy.assertTableDataCellContains(0, accountName)

          cy.assertTableDataCellIsNotEmpty(2)
        })
    })
})

Cypress.Commands.add('submitEditedLedgerAccountName', (newAccountName, ledgerAccountID) => {
  cy.get($.BALANCES.INPUT.EDIT_TITLE)
    .should('be.visible')
    .typeAndAssertValue(newAccountName)

  cy.intercept(`/account/balances/${ledgerAccountID}/edit`)
    .as('editLedgerTitle')

  cy.get($.BALANCES.BTN.SUBMIT_EDIT)
    .should('be.visible')
    .click()

  cy.wait('@editLedgerTitle')
})

Cypress.Commands.add('setAccountFilterInBalances', (currencyTitle, optionCount) => {
  cy.contains($.GENERAL.SELECT.SELECTION, 'Select Account') // TODO: add selector
    .should('be.visible')
    .click()

  cy.get(`${$.GENERAL.DROPDOWN.SELECT_DROPDOWN_MENU_ITEM}:visible`) // TODO: add selector
    .should('have.length', optionCount)

  cy.contains($.GENERAL.DROPDOWN.SELECT_DROPDOWN_MENU_ITEM, `${currencyTitle} main account`) // TODO: add selector
    .should('be.visible')
    .click()

  cy.get($.BALANCES.BTN.APPLY_FILTERS)
    .should('be.visible')
    .click()
})

Cypress.Commands.add('setCryptocurrencyFilterInBalances', (currencySymbol, optionCount) => {
  cy.get($.BALANCES.DROPDOWN.FILTER_CRYPTO)
    .should('be.visible')
    .click()

  cy.get(`${$.GENERAL.DROPDOWN.SELECT_DROPDOWN_MENU_ITEM}:visible`) // TODO: add selector
    .should('have.length', optionCount)

  cy.contains($.GENERAL.DROPDOWN.SELECT_DROPDOWN_MENU_ITEM, currencySymbol) // TODO: add selector
    .should('be.visible')
    .click()

  cy.get($.BALANCES.BTN.APPLY_FILTERS)
    .should('be.visible')
    .click()
})

Cypress.Commands.add('setDateFilterToLastMonthInBalances', () => {
  cy.get($.BALANCES.DROPDOWN.FILTER_DATE)
    .should('be.visible')
    .click()

  cy.get($.GENERAL.CALENDAR.PREVIOUS_MONTH)
    .should('be.visible')
    .click()

  // chooses start date
  cy.get($.GENERAL.CALENDAR.TABLE_BODY)
    .should('be.visible')
    .find('td')
    .eq(0)
    .click()

  // chooses end date
  cy.get($.GENERAL.CALENDAR.TABLE_BODY)
    .should('be.visible')
    .find('td')
    .eq(6)
    .click()

  cy.get($.BALANCES.BTN.APPLY_FILTERS)
    .should('be.visible')
    .click()
})

Cypress.Commands.add('setDateFilterToTodayInBalances', () => {
  cy.get($.BALANCES.DROPDOWN.FILTER_DATE)
    .should('be.visible')
    .click()

  cy.get($.GENERAL.CALENDAR.NEXT_MONTH)
    .should('be.visible')
    .click()

  // chooses start date
  cy.get($.GENERAL.CALENDAR.TODAY)
    .should('be.visible')
    .click()

  // chooses end date
  cy.get($.GENERAL.CALENDAR.TODAY)
    .should('be.visible')
    .click()

  cy.get($.BALANCES.BTN.APPLY_FILTERS)
    .should('be.visible')
    .click()
})

Cypress.Commands.add('clearBalanceTransactionFilters', () => {
  cy.get($.BALANCES.BTN.CLEAR_FILTERS)
    .should('be.visible')
    .click()

  cy.get($.BALANCES.BTN.CLEAR_FILTERS)
    .should('not.exist')

  cy.get($.GENERAL.SELECT.SELECTION_SELECTED_VALUE) // checks that account & cryptocurrency filters are not active
    .should('not.exist')

  cy.get($.BALANCES.DROPDOWN.FILTER_DATE)
    .invoke('val')
    .should('be.empty')
})

Cypress.Commands.add('assertPendingLedgerWithdrawalsAreVisible', () => {
  cy.visit('/account/balances')
  cy.breadcrumbContains('/Account/Balances/Accounts')
  cy.headerContains('Balances')

  cy.get($.BALANCES.TABLE.BALANCE_WITHDRAWALS)
    .should('be.visible')
    .within(() => {
      cy.get('tbody tr')
        .should('be.visible')
        .each((tableRow) => {
          cy.wrap(tableRow)
            .find('td')
            .eq(1)
            .should('contain', 'Pending')
        })
    })
})

Cypress.Commands.add('setUpTraderLedgerWithdrawal', (buyOrderInfo) => {
  cy.createBuyTraderOrderViaAPI(buyOrderInfo)
    .then((response) => {
      const orderID = response.body.id

      cy.confirmTraderOrderPaymentReceivedViaAPI(orderID)
    })

  cy.visit('/account/trader/orders')
  cy.breadcrumbContains('/Account/Trading/Orders')
  cy.headerContains('Trading Orders')

  cy.get('tbody tr')
    .should('be.visible')
    .each((tableRow) => {
      cy.wrap(tableRow)
        .find('td')
        .eq(1)
        .should('contain', 'Completed')
    })

  cy.createLedgerWithdrawalViaAPI(buyOrderInfo.receiveCurrencySymbol)

  cy.assertPendingLedgerWithdrawalsAreVisible()
})

Cypress.Commands.add('setUpMerchantLedgerWithdrawal', (receiveCurrency) => {
  const { currencySymbol, platform } = receiveCurrency

  cy.enableLedgerForMerchantViaAPI()

  cy.createApiAppViaAPI()
    .then((response) => {
      const AUTH_TOKEN = response.body.api_app.auth_token

      cy.createOrderViaApiApp(AUTH_TOKEN, fiatTargetAmount, fiatCurrencyCode, currencySymbol)
        .markApiAppOrderAsPaid(currencySymbol, platform.title)
    })

  cy.visit('/account/orders')
  cy.breadcrumbContains('/Account/Merchant/Orders')
  cy.headerContains('Merchant Orders')

  cy.get('tbody tr')
    .should('be.visible')
    .each((tableRow) => {
      cy.wrap(tableRow)
        .find('td')
        .eq(5)
        .should('contain', 'Paid')
    })

  cy.createLedgerWithdrawalViaAPI(currencySymbol)

  cy.assertPendingLedgerWithdrawalsAreVisible()
})
