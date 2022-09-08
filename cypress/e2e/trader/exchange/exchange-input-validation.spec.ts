import $ from '@selectors/index'
import cryptoPayoutCurrencyInfo from '@fixtures/crypto-payout-settings.json'
import { decrementToClosestDecimal, extractNumber, incrementToClosestDecimal } from '@support/trader/limit-helper-functions'
import { generateTrader } from '@entity/entity-helper-functions'

describe('Trader - Exchange - Input Validation', () => {
  const { email, password, countryCode } = generateTrader()

  const sellCurrency = cryptoPayoutCurrencyInfo.BTC
  const receiveCurrency = cryptoPayoutCurrencyInfo.LTC

  before(() => {
    cy.clearCookies()
    cy.setUpVerifiedPersonalAccount(email, password, countryCode)
  })

  beforeEach(() => {
    cy.loginViaAPI(email, password)

    cy.intercept('/account/trader/trade/order_details?*')
      .as('getOrderDetails')
  })

  it('Check if only digits & dots are allowed in sell & receive fields', () => {
    const allCharString = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcdefghijklmnopqrstuvwxyz{|}~'

    cy.visit('/account/trader/trade#swap')

    cy.wait('@getOrderDetails')

    cy.get($.TRADER.EXCHANGE.INPUT.SELL_AMOUNT)
      .typeAndAssertValue(allCharString, '..0123456789')

    cy.get($.TRADER.EXCHANGE.INPUT.RECEIVE_AMOUNT)
      .typeAndAssertValue(allCharString, '..0123456789')
  })

  it('Check sell & receive field whitespace validation', () => {
    cy.visit('/account/trader/trade#swap')

    cy.wait('@getOrderDetails')

    cy.selectCryptoCurrency($.TRADER.EXCHANGE.DROPDOWN.SELL_CURRENCY, sellCurrency)

    cy.selectCryptoCurrency($.TRADER.EXCHANGE.DROPDOWN.RECEIVE_CURRENCY, receiveCurrency)

    cy.wait('@getOrderDetails')

    cy.get($.TRADER.EXCHANGE.INPUT.SELL_AMOUNT)
      .type('   ')
      .should('be.empty')

    cy.getExplainMessageUnderInputField($.TRADER.EXCHANGE.INPUT.SELL_AMOUNT)
      .should('contain', 'Required')

    cy.get($.TRADER.EXCHANGE.INPUT.SELL_AMOUNT)
      .typeAndAssertValueWithPulseCheck(`   ${sellCurrency.amount}   `, sellCurrency.amount)

    cy.wait('@getOrderDetails')

    cy.getExplainMessageUnderInputField($.TRADER.EXCHANGE.INPUT.SELL_AMOUNT)
      .should('not.exist')

    cy.reload()

    cy.wait('@getOrderDetails')

    cy.urlContains('/account/trader/trade#swap')

    cy.selectCryptoCurrency($.TRADER.EXCHANGE.DROPDOWN.SELL_CURRENCY, sellCurrency)

    cy.selectCryptoCurrency($.TRADER.EXCHANGE.DROPDOWN.RECEIVE_CURRENCY, receiveCurrency)

    cy.wait('@getOrderDetails')

    cy.get($.TRADER.EXCHANGE.INPUT.RECEIVE_AMOUNT)
      .type('   ')
      .should('be.empty')

    cy.getExplainMessageUnderInputField($.TRADER.EXCHANGE.INPUT.RECEIVE_AMOUNT)
      .should('contain', 'Required')

    cy.get($.TRADER.EXCHANGE.INPUT.RECEIVE_AMOUNT)
      .typeAndAssertValueWithPulseCheck(`   ${receiveCurrency.amount}   `, receiveCurrency.amount)

    cy.wait('@getOrderDetails')

    cy.getExplainMessageUnderInputField($.TRADER.EXCHANGE.INPUT.RECEIVE_AMOUNT)
      .should('not.exist')
  })

  it('Check if value of one field changes if the other is changed', () => {
    cy.visit('/account/trader/trade#swap')

    cy.wait('@getOrderDetails')

    cy.selectCryptoCurrency($.TRADER.EXCHANGE.DROPDOWN.SELL_CURRENCY, sellCurrency)

    cy.selectCryptoCurrency($.TRADER.EXCHANGE.DROPDOWN.RECEIVE_CURRENCY, receiveCurrency)

    cy.wait('@getOrderDetails')

    cy.get($.TRADER.EXCHANGE.INPUT.SELL_AMOUNT)
      .typeAndAssertValueWithPulseCheck(sellCurrency.amount)

    cy.wait('@getOrderDetails')

    cy.assertInputIsNotEmpty($.TRADER.EXCHANGE.INPUT.RECEIVE_AMOUNT)

    cy.get($.TRADER.EXCHANGE.INPUT.RECEIVE_AMOUNT)
      .typeAndAssertValueWithPulseCheck(receiveCurrency.amount)

    cy.wait('@getOrderDetails')

    cy.get($.TRADER.EXCHANGE.INPUT.SELL_AMOUNT)
      .should('not.eq', sellCurrency.amount)

    cy.reload()

    cy.wait('@getOrderDetails')

    cy.urlContains('/account/trader/trade#swap')

    cy.selectCryptoCurrency($.TRADER.EXCHANGE.DROPDOWN.SELL_CURRENCY, sellCurrency)

    cy.selectCryptoCurrency($.TRADER.EXCHANGE.DROPDOWN.RECEIVE_CURRENCY, receiveCurrency)

    cy.get($.TRADER.EXCHANGE.INPUT.RECEIVE_AMOUNT)
      .typeAndAssertValueWithPulseCheck(receiveCurrency.amount)

    cy.wait('@getOrderDetails')

    cy.assertInputIsNotEmpty($.TRADER.EXCHANGE.INPUT.SELL_AMOUNT)

    cy.get($.TRADER.EXCHANGE.INPUT.SELL_AMOUNT)
      .typeAndAssertValueWithPulseCheck(sellCurrency.amount)

    cy.wait('@getOrderDetails')

    cy.get($.TRADER.EXCHANGE.INPUT.RECEIVE_AMOUNT)
      .should('not.eq', receiveCurrency.amount)
  })

  it('Check minimum sell amount validation', () => {
    const initialSellAmount = 0

    cy.visit('/account/trader/trade#swap')

    cy.wait('@getOrderDetails')

    cy.selectCryptoCurrency($.TRADER.EXCHANGE.DROPDOWN.SELL_CURRENCY, sellCurrency)

    cy.selectCryptoCurrency($.TRADER.EXCHANGE.DROPDOWN.RECEIVE_CURRENCY, receiveCurrency)

    cy.wait('@getOrderDetails')

    cy.get($.TRADER.EXCHANGE.INPUT.SELL_AMOUNT)
      .typeAndAssertValueWithPulseCheck(initialSellAmount)

    cy.wait('@getOrderDetails')

    cy.assertOrderDetailsTotalAmount(initialSellAmount, sellCurrency.currencySymbol)

    cy.getExplainMessageUnderInputField($.TRADER.EXCHANGE.INPUT.SELL_AMOUNT)
      .invoke('text')
      .then((errorMessage) => {
        const errorMessageValue = extractNumber(errorMessage)

        const decrementedErrorMessageValue = decrementToClosestDecimal(errorMessageValue)

        cy.get($.TRADER.EXCHANGE.INPUT.SELL_AMOUNT)
          .typeAndAssertValueWithPulseCheck(decrementedErrorMessageValue)

        cy.wait('@getOrderDetails')

        cy.assertOrderDetailsTotalAmount(decrementedErrorMessageValue, sellCurrency.currencySymbol)

        cy.getExplainMessageUnderInputField($.TRADER.EXCHANGE.INPUT.SELL_AMOUNT)
          .should('not.be.empty')
          .and('not.contain', 'Required')

        cy.getExplainMessageUnderInputField($.TRADER.EXCHANGE.INPUT.SELL_AMOUNT)
          .should('contain', `Minimum is ${errorMessageValue} ${sellCurrency.currencySymbol}`)

        cy.get($.TRADER.EXCHANGE.INPUT.SELL_AMOUNT)
          .typeAndAssertValueWithPulseCheck(errorMessageValue)

        cy.wait('@getOrderDetails')

        cy.getExplainMessageUnderInputField($.TRADER.EXCHANGE.INPUT.SELL_AMOUNT)
          .should('not.exist')
      })
  })

  it('Check maximum sell amount validation', () => {
    const initialSellAmount = 100000

    cy.visit('/account/trader/trade#swap')

    cy.wait('@getOrderDetails')

    cy.selectCryptoCurrency($.TRADER.EXCHANGE.DROPDOWN.SELL_CURRENCY, sellCurrency)

    cy.selectCryptoCurrency($.TRADER.EXCHANGE.DROPDOWN.RECEIVE_CURRENCY, receiveCurrency)

    cy.wait('@getOrderDetails')

    cy.get($.TRADER.EXCHANGE.INPUT.SELL_AMOUNT)
      .typeAndAssertValueWithPulseCheck(initialSellAmount)

    cy.wait('@getOrderDetails')

    cy.assertOrderDetailsTotalAmount(initialSellAmount, sellCurrency.currencySymbol)

    cy.getExplainMessageUnderInputField($.TRADER.EXCHANGE.INPUT.SELL_AMOUNT)
      .invoke('text')
      .then((errorMessage) => {
        const errorMessageValue = extractNumber(errorMessage)

        const incrementedErrorMessageValue = incrementToClosestDecimal(errorMessageValue)

        cy.get($.TRADER.EXCHANGE.INPUT.SELL_AMOUNT)
          .typeAndAssertValueWithPulseCheck(incrementedErrorMessageValue)

        cy.wait('@getOrderDetails')

        cy.assertOrderDetailsTotalAmount(incrementedErrorMessageValue, sellCurrency.currencySymbol)

        cy.getExplainMessageUnderInputField($.TRADER.EXCHANGE.INPUT.SELL_AMOUNT)
          .should('not.be.empty')
          .and('not.contain', 'Required')

        cy.getExplainMessageUnderInputField($.TRADER.EXCHANGE.INPUT.SELL_AMOUNT)
          .should('contain', `Maximum is ${errorMessageValue} ${sellCurrency.currencySymbol}`)

        cy.get($.TRADER.EXCHANGE.INPUT.SELL_AMOUNT)
          .typeAndAssertValueWithPulseCheck(errorMessageValue)

        cy.wait('@getOrderDetails')

        cy.getExplainMessageUnderInputField($.TRADER.EXCHANGE.INPUT.SELL_AMOUNT)
          .should('not.exist')
      })
  })

  it.only('Check minimum receive amount validation', () => {
    const initialReceiveAmount = 0

    cy.visit('/account/trader/trade#swap')

    cy.wait('@getOrderDetails')

    cy.selectCryptoCurrency($.TRADER.EXCHANGE.DROPDOWN.SELL_CURRENCY, sellCurrency)

    cy.selectCryptoCurrency($.TRADER.EXCHANGE.DROPDOWN.RECEIVE_CURRENCY, receiveCurrency)

    cy.wait('@getOrderDetails')

    cy.get($.TRADER.EXCHANGE.INPUT.RECEIVE_AMOUNT)
      .typeAndAssertValueWithPulseCheck(initialReceiveAmount)

    cy.wait('@getOrderDetails')

    cy.assertOrderDetailsReceiveAmount(initialReceiveAmount, receiveCurrency.currencySymbol)

    cy.getExplainMessageUnderInputField($.TRADER.EXCHANGE.INPUT.RECEIVE_AMOUNT)
      .invoke('text')
      .then((errorMessage) => {
        const errorMessageValue = extractNumber(errorMessage)

        const decrementedErrorMessageValue = decrementToClosestDecimal(errorMessageValue)

        cy.get($.TRADER.EXCHANGE.INPUT.RECEIVE_AMOUNT)
          .typeAndAssertValueWithPulseCheck(decrementedErrorMessageValue)

        cy.wait('@getOrderDetails')

        cy.assertOrderDetailsReceiveAmount(decrementedErrorMessageValue, receiveCurrency.currencySymbol)

        cy.getExplainMessageUnderInputField($.TRADER.EXCHANGE.INPUT.RECEIVE_AMOUNT)
          .should('not.be.empty')
          .and('not.contain', 'Required')

        cy.getExplainMessageUnderInputField($.TRADER.EXCHANGE.INPUT.RECEIVE_AMOUNT)
          .should('contain', `Minimum is ${errorMessageValue} ${receiveCurrency.currencySymbol}`)

        cy.get($.TRADER.EXCHANGE.INPUT.RECEIVE_AMOUNT)
          .typeAndAssertValueWithPulseCheck(errorMessageValue)

        cy.wait('@getOrderDetails')

        cy.getExplainMessageUnderInputField($.TRADER.EXCHANGE.INPUT.RECEIVE_AMOUNT)
          .should('not.exist')
      })
  })

  it.only('Check maximum receive amount validation', () => {
    const initialReceiveAmount = 100000

    cy.visit('/account/trader/trade#swap')

    cy.wait('@getOrderDetails')

    cy.selectCryptoCurrency($.TRADER.EXCHANGE.DROPDOWN.SELL_CURRENCY, sellCurrency)

    cy.selectCryptoCurrency($.TRADER.EXCHANGE.DROPDOWN.RECEIVE_CURRENCY, receiveCurrency)

    cy.wait('@getOrderDetails')

    cy.get($.TRADER.EXCHANGE.INPUT.RECEIVE_AMOUNT)
      .typeAndAssertValueWithPulseCheck(initialReceiveAmount)

    cy.wait('@getOrderDetails')

    cy.assertOrderDetailsReceiveAmount(initialReceiveAmount, receiveCurrency.currencySymbol)

    cy.getExplainMessageUnderInputField($.TRADER.EXCHANGE.INPUT.RECEIVE_AMOUNT)
      .invoke('text')
      .then((errorMessage) => {
        const errorMessageValue = extractNumber(errorMessage)

        const incrementedErrorMessageValue = incrementToClosestDecimal(errorMessageValue)

        cy.get($.TRADER.EXCHANGE.INPUT.RECEIVE_AMOUNT)
          .typeAndAssertValueWithPulseCheck(incrementedErrorMessageValue)

        cy.wait('@getOrderDetails')

        cy.assertOrderDetailsReceiveAmount(incrementedErrorMessageValue, receiveCurrency.currencySymbol)

        cy.getExplainMessageUnderInputField($.TRADER.EXCHANGE.INPUT.RECEIVE_AMOUNT)
          .should('not.be.empty')
          .and('not.contain', 'Required')

        cy.getExplainMessageUnderInputField($.TRADER.EXCHANGE.INPUT.RECEIVE_AMOUNT)
          .should('contain', `Maximum is ${errorMessageValue} ${receiveCurrency.currencySymbol}`)

        cy.get($.TRADER.EXCHANGE.INPUT.RECEIVE_AMOUNT)
          .typeAndAssertValueWithPulseCheck(errorMessageValue)

        cy.wait('@getOrderDetails')

        cy.getExplainMessageUnderInputField($.TRADER.EXCHANGE.INPUT.RECEIVE_AMOUNT)
          .should('not.exist')
      })
  })
})
