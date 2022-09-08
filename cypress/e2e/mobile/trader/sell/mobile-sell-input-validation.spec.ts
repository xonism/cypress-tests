import $ from '@selectors/index'
import cryptoPayoutCurrencyInfo from '@fixtures/crypto-payout-settings.json'
import { decrementToClosestDecimal, extractNumber, incrementToClosestDecimal } from '@support/trader/limit-helper-functions'
import { generateTrader } from '@entity/entity-helper-functions'
import { traderCountry, traderCurrencyCode, traderCurrencySymbol } from '@fixtures/trader-currency-and-country.json'

describe('Mobile - Trader - Sell - Input Validation', () => {
  const { email, password, countryCode } = generateTrader()

  const sellCurrency = cryptoPayoutCurrencyInfo.BTC
  const { currencySymbol, amount } = sellCurrency

  const receiveAmount = 100

  before(() => {
    cy.clearCookies()
    cy.setUpVerifiedPersonalAccount(email, password, countryCode)
  })

  beforeEach(() => {
    cy.setMobileResolution()

    cy.loginViaAPI(email, password)

    cy.intercept('/account/trader/trade/order_details?*')
      .as('getOrderDetails')
  })

  it('[Mobile] Check if only digits & dots are allowed in sell & receive fields', () => {
    const allCharString = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcdefghijklmnopqrstuvwxyz{|}~'

    cy.visit('/account/trader/trade#sell')

    cy.get($.TRADER.SELL.BTN.ADD_PAYOUT_SETTING)
      .should('be.visible')

    cy.get($.TRADER.SELL.INPUT.SELL_AMOUNT)
      .typeAndAssertValue(allCharString, '..0123456789')

    cy.get($.TRADER.SELL.INPUT.RECEIVE_AMOUNT)
      .typeAndAssertValue(allCharString, '..0123456789')
  })

  it('[Mobile] Check sell & receive field whitespace validation', () => {
    cy.visit('/account/trader/trade#sell')

    cy.get($.TRADER.SELL.BTN.ADD_PAYOUT_SETTING)
      .should('be.visible')

    cy.selectCryptoCurrency($.TRADER.MOBILE.SELL.DROPDOWN.SELL_CURRENCY, sellCurrency)

    cy.get($.TRADER.SELL.INPUT.SELL_AMOUNT)
      .type('   ')
      .should('be.empty')

    cy.getExplainMessageUnderInputField($.TRADER.SELL.INPUT.SELL_AMOUNT)
      .should('contain', 'Required')

    cy.get($.TRADER.SELL.INPUT.SELL_AMOUNT)
      .typeAndAssertValue(`   ${amount}   `, amount)

    cy.wait('@getOrderDetails')

    cy.getExplainMessageUnderInputField($.TRADER.SELL.INPUT.SELL_AMOUNT)
      .should('not.exist')

    cy.reload()

    cy.wait('@getOrderDetails')

    cy.urlContains('/account/trader/trade#sell')

    cy.get($.TRADER.SELL.BTN.ADD_PAYOUT_SETTING)
      .should('be.visible')

    cy.selectCryptoCurrency($.TRADER.MOBILE.SELL.DROPDOWN.SELL_CURRENCY, sellCurrency)

    cy.get($.TRADER.SELL.INPUT.RECEIVE_AMOUNT)
      .type('   ')
      .should('be.empty')

    cy.getExplainMessageUnderInputField($.TRADER.SELL.INPUT.RECEIVE_AMOUNT)
      .should('contain', 'Required')

    cy.get($.TRADER.SELL.INPUT.RECEIVE_AMOUNT)
      .typeAndAssertValue(`   ${receiveAmount}   `, receiveAmount)

    cy.wait('@getOrderDetails')

    cy.getExplainMessageUnderInputField($.TRADER.SELL.INPUT.RECEIVE_AMOUNT)
      .should('not.exist')
  })

  it('[Mobile] Check if value of one field changes if the other is changed', () => {
    cy.visit('/account/trader/trade#sell')

    cy.get($.TRADER.SELL.BTN.ADD_PAYOUT_SETTING)
      .should('be.visible')

    cy.selectCryptoCurrency($.TRADER.MOBILE.SELL.DROPDOWN.SELL_CURRENCY, sellCurrency)

    cy.get($.TRADER.SELL.INPUT.SELL_AMOUNT)
      .typeAndAssertValue(amount)

    cy.wait('@getOrderDetails')

    cy.assertInputIsNotEmpty($.TRADER.SELL.INPUT.RECEIVE_AMOUNT)

    cy.wait('@getOrderDetails')

    cy.get($.TRADER.SELL.INPUT.RECEIVE_AMOUNT)
      .typeAndAssertValue(receiveAmount)

    cy.wait('@getOrderDetails')

    cy.get($.TRADER.SELL.INPUT.SELL_AMOUNT)
      .should('not.eq', amount)

    cy.reload()

    cy.wait('@getOrderDetails')

    cy.urlContains('/account/trader/trade#sell')

    cy.get($.TRADER.SELL.BTN.ADD_PAYOUT_SETTING)
      .should('be.visible')

    cy.selectCryptoCurrency($.TRADER.MOBILE.SELL.DROPDOWN.SELL_CURRENCY, sellCurrency)

    cy.get($.TRADER.SELL.INPUT.RECEIVE_AMOUNT)
      .typeAndAssertValue(receiveAmount)

    cy.wait('@getOrderDetails')

    cy.assertInputIsNotEmpty($.TRADER.SELL.INPUT.RECEIVE_AMOUNT)

    cy.get($.TRADER.SELL.INPUT.SELL_AMOUNT)
      .typeAndAssertValue(amount)

    cy.wait('@getOrderDetails')

    cy.get($.TRADER.SELL.INPUT.RECEIVE_AMOUNT)
      .should('not.eq', receiveAmount)
  })

  it('[Mobile] Check minimum sell amount validation', () => {
    const initialSellAmount = 0

    cy.visit('/account/trader/trade#sell')

    cy.get($.TRADER.SELL.BTN.ADD_PAYOUT_SETTING)
      .should('be.visible')

    cy.selectCryptoCurrency($.TRADER.MOBILE.SELL.DROPDOWN.SELL_CURRENCY, sellCurrency)

    cy.get($.TRADER.SELL.INPUT.SELL_AMOUNT)
      .typeAndAssertValue(initialSellAmount)

    cy.wait('@getOrderDetails')

    cy.mobileClickReceiveAmountLabelToShowOrderDetails()

    cy.assertOrderDetailsTotalAmount(initialSellAmount, currencySymbol)

    cy.getExplainMessageUnderInputField($.TRADER.SELL.INPUT.SELL_AMOUNT)
      .invoke('text')
      .then((errorMessage) => {
        const errorMessageValue = extractNumber(errorMessage)

        const decrementedErrorMessageValue = decrementToClosestDecimal(errorMessageValue)

        cy.get($.TRADER.SELL.INPUT.SELL_AMOUNT)
          .typeAndAssertValue(decrementedErrorMessageValue)

        cy.wait('@getOrderDetails')

        cy.mobileClickReceiveAmountLabelToShowOrderDetails()

        cy.assertOrderDetailsTotalAmount(decrementedErrorMessageValue, currencySymbol)

        cy.getExplainMessageUnderInputField($.TRADER.SELL.INPUT.SELL_AMOUNT)
          .should('not.be.empty')
          .and('not.contain', 'Required')

        cy.getExplainMessageUnderInputField($.TRADER.SELL.INPUT.SELL_AMOUNT)
          .should('contain', `Minimum is ${errorMessageValue} ${currencySymbol}`)

        cy.get($.TRADER.SELL.INPUT.SELL_AMOUNT)
          .typeAndAssertValue(errorMessageValue)

        cy.wait('@getOrderDetails')

        cy.getExplainMessageUnderInputField($.TRADER.SELL.INPUT.SELL_AMOUNT)
          .should('not.exist')
      })
  })

  it('[Mobile] Check maximum sell amount validation', () => {
    const initialSellAmount = 100000

    cy.visit('/account/trader/trade#sell')

    cy.get($.TRADER.SELL.BTN.ADD_PAYOUT_SETTING)
      .should('be.visible')

    cy.selectCryptoCurrency($.TRADER.MOBILE.SELL.DROPDOWN.SELL_CURRENCY, sellCurrency)

    cy.get($.TRADER.SELL.INPUT.SELL_AMOUNT)
      .typeAndAssertValue(initialSellAmount)

    cy.wait('@getOrderDetails')

    cy.mobileClickReceiveAmountLabelToShowOrderDetails()

    cy.assertOrderDetailsTotalAmount(initialSellAmount, currencySymbol)

    cy.getExplainMessageUnderInputField($.TRADER.SELL.INPUT.SELL_AMOUNT)
      .invoke('text')
      .then((errorMessage) => {
        const errorMessageValue = extractNumber(errorMessage)

        const incrementedErrorMessageValue = incrementToClosestDecimal(errorMessageValue)

        cy.get($.TRADER.SELL.INPUT.SELL_AMOUNT)
          .typeAndAssertValue(incrementedErrorMessageValue)

        cy.wait('@getOrderDetails')

        cy.mobileClickReceiveAmountLabelToShowOrderDetails()

        cy.assertOrderDetailsTotalAmount(incrementedErrorMessageValue, currencySymbol)

        cy.getExplainMessageUnderInputField($.TRADER.SELL.INPUT.SELL_AMOUNT)
          .should('not.be.empty')
          .and('not.contain', 'Required')

        cy.getExplainMessageUnderInputField($.TRADER.SELL.INPUT.SELL_AMOUNT)
          .should('contain', `Maximum is ${errorMessageValue} ${currencySymbol}`)

        cy.get($.TRADER.SELL.INPUT.SELL_AMOUNT)
          .typeAndAssertValue(errorMessageValue)

        cy.wait('@getOrderDetails')

        cy.getExplainMessageUnderInputField($.TRADER.SELL.INPUT.SELL_AMOUNT)
          .should('not.exist')
      })
  })

  it('[Mobile] Check minimum receive amount validation', () => {
    const initialReceiveAmount = 0

    cy.visit('/account/trader/trade#sell')

    cy.get($.TRADER.SELL.BTN.ADD_PAYOUT_SETTING)
      .should('be.visible')

    cy.selectTraderCountry(traderCountry)

    cy.selectTraderCurrency($.TRADER.MOBILE.SELL.DROPDOWN.RECEIVE_CURRENCY, traderCurrencyCode)

    cy.get($.TRADER.SELL.INPUT.RECEIVE_AMOUNT)
      .typeAndAssertValue(initialReceiveAmount)

    cy.wait('@getOrderDetails')

    cy.assertInputIsNotEmpty($.TRADER.SELL.INPUT.SELL_AMOUNT)

    cy.wait('@getOrderDetails')

    cy.mobileClickReceiveAmountLabelToShowOrderDetails()

    cy.mobileAssertReceiveAmountInInputAndOrderDetailsMatch($.TRADER.SELL.INPUT.RECEIVE_AMOUNT, traderCurrencySymbol)

    cy.getExplainMessageUnderInputField($.TRADER.SELL.INPUT.RECEIVE_AMOUNT)
      .invoke('text')
      .then((errorMessage) => {
        const errorMessageValue = extractNumber(errorMessage)

        const decrementedErrorMessageValue = errorMessageValue - 1

        cy.get($.TRADER.SELL.INPUT.RECEIVE_AMOUNT)
          .typeAndAssertValue(decrementedErrorMessageValue)

        cy.wait('@getOrderDetails')

        cy.mobileClickReceiveAmountLabelToShowOrderDetails()

        cy.mobileAssertReceiveAmountInInputAndOrderDetailsMatch($.TRADER.SELL.INPUT.RECEIVE_AMOUNT, traderCurrencySymbol)

        cy.getExplainMessageUnderInputField($.TRADER.SELL.INPUT.RECEIVE_AMOUNT)
          .should('not.be.empty')
          .and('not.contain', 'Required')

        cy.getExplainMessageUnderInputField($.TRADER.SELL.INPUT.RECEIVE_AMOUNT)
          .should('contain', `Minimum is ${errorMessageValue} ${traderCurrencyCode}`)

        cy.get($.TRADER.SELL.INPUT.RECEIVE_AMOUNT)
          .typeAndAssertValue(errorMessageValue)

        cy.wait('@getOrderDetails')

        cy.getExplainMessageUnderInputField($.TRADER.SELL.INPUT.RECEIVE_AMOUNT)
          .should('not.exist')
      })
  })

  it('[Mobile] Check maximum receive amount validation', () => {
    const initialReceiveAmount = 100000

    cy.visit('/account/trader/trade#sell')

    cy.get($.TRADER.SELL.BTN.ADD_PAYOUT_SETTING)
      .should('be.visible')

    cy.selectTraderCountry(traderCountry)

    cy.selectTraderCurrency($.TRADER.MOBILE.SELL.DROPDOWN.RECEIVE_CURRENCY, traderCurrencyCode)

    cy.get($.TRADER.SELL.INPUT.RECEIVE_AMOUNT)
      .typeAndAssertValue(initialReceiveAmount)

    cy.wait('@getOrderDetails')

    cy.assertInputIsNotEmpty($.TRADER.SELL.INPUT.SELL_AMOUNT)

    cy.wait('@getOrderDetails')

    cy.mobileClickReceiveAmountLabelToShowOrderDetails()

    cy.mobileAssertReceiveAmountInInputAndOrderDetailsMatch($.TRADER.SELL.INPUT.RECEIVE_AMOUNT, traderCurrencySymbol)

    cy.getExplainMessageUnderInputField($.TRADER.SELL.INPUT.RECEIVE_AMOUNT)
      .invoke('text')
      .then((errorMessage) => {
        const errorMessageValue = extractNumber(errorMessage)

        const incrementedErrorMessageValue = errorMessageValue + 1

        cy.get($.TRADER.SELL.INPUT.RECEIVE_AMOUNT)
          .typeAndAssertValue(incrementedErrorMessageValue)

        cy.wait('@getOrderDetails')

        cy.mobileClickReceiveAmountLabelToShowOrderDetails()

        cy.mobileAssertReceiveAmountInInputAndOrderDetailsMatch($.TRADER.SELL.INPUT.RECEIVE_AMOUNT, traderCurrencySymbol)

        cy.getExplainMessageUnderInputField($.TRADER.SELL.INPUT.RECEIVE_AMOUNT)
          .should('not.be.empty')
          .and('not.contain', 'Required')

        cy.getExplainMessageUnderInputField($.TRADER.SELL.INPUT.RECEIVE_AMOUNT)
          .should('contain', `Maximum is ${errorMessageValue} ${traderCurrencyCode}`)

        cy.get($.TRADER.SELL.INPUT.RECEIVE_AMOUNT)
          .typeAndAssertValue(errorMessageValue)

        cy.wait('@getOrderDetails')

        cy.getExplainMessageUnderInputField($.TRADER.SELL.INPUT.RECEIVE_AMOUNT)
          .should('not.exist')
      })
  })
})
