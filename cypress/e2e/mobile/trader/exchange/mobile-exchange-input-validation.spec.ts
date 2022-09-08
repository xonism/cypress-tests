import $ from '@selectors/index'
import cryptoPayoutCurrencyInfo from '@fixtures/crypto-payout-settings.json'
import { decrementToClosestDecimal, extractNumber, incrementToClosestDecimal } from '@support/trader/limit-helper-functions'
import { generateTrader } from '@entity/entity-helper-functions'

describe('Mobile - Trader - Exchange - Input Validation', () => {
  const { email, password, countryCode } = generateTrader()

  const sellCurrency = cryptoPayoutCurrencyInfo.BTC
  const receiveCurrency = cryptoPayoutCurrencyInfo.LTC

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

    cy.visit('/account/trader/trade#swap')

    cy.get($.TRADER.EXCHANGE.INPUT.SELL_AMOUNT)
      .typeAndAssertValue(allCharString, '..0123456789')

    cy.get($.TRADER.EXCHANGE.INPUT.RECEIVE_AMOUNT)
      .typeAndAssertValue(allCharString, '..0123456789')
  })

  it('[Mobile] Check sell & receive field whitespace validation', () => {
    cy.visit('/account/trader/trade#swap')

    cy.selectCryptoCurrency($.TRADER.MOBILE.EXCHANGE.DROPDOWN.SELL_CURRENCY, sellCurrency)

    cy.selectCryptoCurrency($.TRADER.MOBILE.EXCHANGE.DROPDOWN.RECEIVE_CURRENCY, receiveCurrency)

    cy.wait('@getOrderDetails')

    cy.get($.TRADER.EXCHANGE.INPUT.SELL_AMOUNT)
      .type('   ')
      .should('be.empty')

    cy.getExplainMessageUnderInputField($.TRADER.EXCHANGE.INPUT.SELL_AMOUNT)
      .should('contain', 'Required')

    cy.get($.TRADER.EXCHANGE.INPUT.SELL_AMOUNT)
      .typeAndAssertValue(`   ${sellCurrency.amount}   `, sellCurrency.amount)

    cy.wait('@getOrderDetails')

    cy.getExplainMessageUnderInputField($.TRADER.EXCHANGE.INPUT.SELL_AMOUNT)
      .should('not.exist')

    cy.reload()

    cy.wait('@getOrderDetails')

    cy.urlContains('/account/trader/trade#swap')

    cy.selectCryptoCurrency($.TRADER.MOBILE.EXCHANGE.DROPDOWN.SELL_CURRENCY, sellCurrency)

    cy.selectCryptoCurrency($.TRADER.MOBILE.EXCHANGE.DROPDOWN.RECEIVE_CURRENCY, receiveCurrency)

    cy.wait('@getOrderDetails')

    cy.get($.TRADER.EXCHANGE.INPUT.RECEIVE_AMOUNT)
      .type('   ')
      .should('be.empty')

    cy.getExplainMessageUnderInputField($.TRADER.EXCHANGE.INPUT.RECEIVE_AMOUNT)
      .should('contain', 'Required')

    cy.get($.TRADER.EXCHANGE.INPUT.RECEIVE_AMOUNT)
      .typeAndAssertValue(`   ${receiveCurrency.amount}   `, receiveCurrency.amount)

    cy.wait('@getOrderDetails')

    cy.getExplainMessageUnderInputField($.TRADER.EXCHANGE.INPUT.RECEIVE_AMOUNT)
      .should('not.exist')
  })

  it('[Mobile] Check if value of one field changes if the other is changed', () => {
    cy.visit('/account/trader/trade#swap')

    cy.selectCryptoCurrency($.TRADER.MOBILE.EXCHANGE.DROPDOWN.SELL_CURRENCY, sellCurrency)

    cy.selectCryptoCurrency($.TRADER.MOBILE.EXCHANGE.DROPDOWN.RECEIVE_CURRENCY, receiveCurrency)

    cy.wait('@getOrderDetails')

    cy.get($.TRADER.EXCHANGE.INPUT.SELL_AMOUNT)
      .typeAndAssertValue(sellCurrency.amount)

    cy.wait('@getOrderDetails')

    cy.assertInputIsNotEmpty($.TRADER.EXCHANGE.INPUT.RECEIVE_AMOUNT)

    cy.get($.TRADER.EXCHANGE.INPUT.RECEIVE_AMOUNT)
      .typeAndAssertValue(receiveCurrency.amount)

    cy.wait('@getOrderDetails')

    cy.get($.TRADER.EXCHANGE.INPUT.SELL_AMOUNT)
      .should('not.eq', sellCurrency.amount)

    cy.reload()

    cy.wait('@getOrderDetails')

    cy.urlContains('/account/trader/trade#swap')

    cy.selectCryptoCurrency($.TRADER.MOBILE.EXCHANGE.DROPDOWN.SELL_CURRENCY, sellCurrency)

    cy.selectCryptoCurrency($.TRADER.MOBILE.EXCHANGE.DROPDOWN.RECEIVE_CURRENCY, receiveCurrency)

    cy.get($.TRADER.EXCHANGE.INPUT.RECEIVE_AMOUNT)
      .typeAndAssertValue(receiveCurrency.amount)

    cy.wait('@getOrderDetails')

    cy.assertInputIsNotEmpty($.TRADER.EXCHANGE.INPUT.SELL_AMOUNT)

    cy.get($.TRADER.EXCHANGE.INPUT.SELL_AMOUNT)
      .typeAndAssertValue(sellCurrency.amount)

    cy.wait('@getOrderDetails')

    cy.get($.TRADER.EXCHANGE.INPUT.RECEIVE_AMOUNT)
      .should('not.eq', receiveCurrency.amount)
  })

  it('[Mobile] Check minimum sell amount validation', () => {
    const initialSellAmount = 0

    cy.visit('/account/trader/trade#swap')

    cy.selectCryptoCurrency($.TRADER.MOBILE.EXCHANGE.DROPDOWN.SELL_CURRENCY, sellCurrency)

    cy.selectCryptoCurrency($.TRADER.MOBILE.EXCHANGE.DROPDOWN.RECEIVE_CURRENCY, receiveCurrency)

    cy.wait('@getOrderDetails')

    cy.get($.TRADER.EXCHANGE.INPUT.SELL_AMOUNT)
      .typeAndAssertValue(initialSellAmount)

    cy.wait('@getOrderDetails')

    cy.mobileClickReceiveAmountLabelToShowOrderDetails()

    cy.assertOrderDetailsTotalAmount(initialSellAmount, sellCurrency.currencySymbol)

    cy.getExplainMessageUnderInputField($.TRADER.EXCHANGE.INPUT.SELL_AMOUNT)
      .invoke('text')
      .then((errorMessage) => {
        const errorMessageValue = extractNumber(errorMessage)

        const decrementedErrorMessageValue = decrementToClosestDecimal(errorMessageValue)

        cy.get($.TRADER.EXCHANGE.INPUT.SELL_AMOUNT)
          .typeAndAssertValue(decrementedErrorMessageValue)

        cy.wait('@getOrderDetails')

        cy.mobileClickReceiveAmountLabelToShowOrderDetails()

        cy.assertOrderDetailsTotalAmount(decrementedErrorMessageValue, sellCurrency.currencySymbol)

        cy.getExplainMessageUnderInputField($.TRADER.EXCHANGE.INPUT.SELL_AMOUNT)
          .should('not.be.empty')
          .and('not.contain', 'Required')

        cy.getExplainMessageUnderInputField($.TRADER.EXCHANGE.INPUT.SELL_AMOUNT)
          .should('contain', `Minimum is ${errorMessageValue} ${sellCurrency.currencySymbol}`)

        cy.get($.TRADER.EXCHANGE.INPUT.SELL_AMOUNT)
          .typeAndAssertValue(errorMessageValue)

        cy.wait('@getOrderDetails')

        cy.getExplainMessageUnderInputField($.TRADER.EXCHANGE.INPUT.SELL_AMOUNT)
          .should('not.exist')
      })
  })

  it('[Mobile] Check maximum sell amount validation', () => {
    const initialSellAmount = 100000

    cy.visit('/account/trader/trade#swap')

    cy.selectCryptoCurrency($.TRADER.MOBILE.EXCHANGE.DROPDOWN.SELL_CURRENCY, sellCurrency)

    cy.selectCryptoCurrency($.TRADER.MOBILE.EXCHANGE.DROPDOWN.RECEIVE_CURRENCY, receiveCurrency)

    cy.wait('@getOrderDetails')

    cy.get($.TRADER.EXCHANGE.INPUT.SELL_AMOUNT)
      .typeAndAssertValue(initialSellAmount)

    cy.wait('@getOrderDetails')

    cy.mobileClickReceiveAmountLabelToShowOrderDetails()

    cy.assertOrderDetailsTotalAmount(initialSellAmount, sellCurrency.currencySymbol)

    cy.getExplainMessageUnderInputField($.TRADER.EXCHANGE.INPUT.SELL_AMOUNT)
      .invoke('text')
      .then((errorMessage) => {
        const errorMessageValue = extractNumber(errorMessage)

        const incrementedErrorMessageValue = incrementToClosestDecimal(errorMessageValue)

        cy.get($.TRADER.EXCHANGE.INPUT.SELL_AMOUNT)
          .typeAndAssertValue(incrementedErrorMessageValue)

        cy.wait('@getOrderDetails')

        cy.mobileClickReceiveAmountLabelToShowOrderDetails()

        cy.assertOrderDetailsTotalAmount(incrementedErrorMessageValue, sellCurrency.currencySymbol)

        cy.getExplainMessageUnderInputField($.TRADER.EXCHANGE.INPUT.SELL_AMOUNT)
          .should('not.be.empty')
          .and('not.contain', 'Required')

        cy.getExplainMessageUnderInputField($.TRADER.EXCHANGE.INPUT.SELL_AMOUNT)
          .should('contain', `Maximum is ${errorMessageValue} ${sellCurrency.currencySymbol}`)

        cy.get($.TRADER.EXCHANGE.INPUT.SELL_AMOUNT)
          .typeAndAssertValue(errorMessageValue)

        cy.wait('@getOrderDetails')

        cy.getExplainMessageUnderInputField($.TRADER.EXCHANGE.INPUT.SELL_AMOUNT)
          .should('not.exist')
      })
  })

  it('[Mobile] Check minimum receive amount validation', () => {
    const initialReceiveAmount = 0

    cy.visit('/account/trader/trade#swap')

    cy.selectCryptoCurrency($.TRADER.MOBILE.EXCHANGE.DROPDOWN.SELL_CURRENCY, sellCurrency)

    cy.selectCryptoCurrency($.TRADER.MOBILE.EXCHANGE.DROPDOWN.RECEIVE_CURRENCY, receiveCurrency)

    cy.get($.TRADER.EXCHANGE.INPUT.RECEIVE_AMOUNT)
      .typeAndAssertValue(initialReceiveAmount)

    cy.wait('@getOrderDetails')

    cy.assertInputIsNotEmpty($.TRADER.EXCHANGE.INPUT.SELL_AMOUNT)

    cy.wait('@getOrderDetails')

    cy.mobileClickReceiveAmountLabelToShowOrderDetails()

    cy.mobileAssertReceiveAmountInInputAndOrderDetailsMatch($.TRADER.EXCHANGE.INPUT.RECEIVE_AMOUNT, receiveCurrency.currencySymbol)

    cy.getExplainMessageUnderInputField($.TRADER.EXCHANGE.INPUT.RECEIVE_AMOUNT)
      .invoke('text')
      .then((errorMessage) => {
        const errorMessageValue = extractNumber(errorMessage)

        const decrementedErrorMessageValue = decrementToClosestDecimal(errorMessageValue)

        cy.get($.TRADER.EXCHANGE.INPUT.RECEIVE_AMOUNT)
          .typeAndAssertValue(decrementedErrorMessageValue)

        cy.wait('@getOrderDetails')

        cy.mobileClickReceiveAmountLabelToShowOrderDetails()

        cy.mobileAssertReceiveAmountInInputAndOrderDetailsMatch($.TRADER.EXCHANGE.INPUT.RECEIVE_AMOUNT, receiveCurrency.currencySymbol)

        cy.getExplainMessageUnderInputField($.TRADER.EXCHANGE.INPUT.RECEIVE_AMOUNT)
          .should('not.be.empty')
          .and('not.contain', 'Required')

        cy.getExplainMessageUnderInputField($.TRADER.EXCHANGE.INPUT.RECEIVE_AMOUNT)
          .should('contain', `Minimum is ${errorMessageValue} ${receiveCurrency.currencySymbol}`)

        cy.get($.TRADER.EXCHANGE.INPUT.RECEIVE_AMOUNT)
          .typeAndAssertValue(errorMessageValue)

        cy.wait('@getOrderDetails')

        cy.getExplainMessageUnderInputField($.TRADER.EXCHANGE.INPUT.RECEIVE_AMOUNT)
          .should('not.exist')
      })
  })

  it('[Mobile] Check maximum receive amount validation', () => {
    const initialReceiveAmount = 100000

    cy.visit('/account/trader/trade#swap')

    cy.selectCryptoCurrency($.TRADER.MOBILE.EXCHANGE.DROPDOWN.SELL_CURRENCY, sellCurrency)

    cy.selectCryptoCurrency($.TRADER.MOBILE.EXCHANGE.DROPDOWN.RECEIVE_CURRENCY, receiveCurrency)

    cy.wait('@getOrderDetails')

    cy.get($.TRADER.EXCHANGE.INPUT.RECEIVE_AMOUNT)
      .typeAndAssertValue(initialReceiveAmount)

    cy.wait('@getOrderDetails')

    cy.assertInputIsNotEmpty($.TRADER.EXCHANGE.INPUT.SELL_AMOUNT)

    cy.wait('@getOrderDetails')

    cy.mobileClickReceiveAmountLabelToShowOrderDetails()

    cy.mobileAssertReceiveAmountInInputAndOrderDetailsMatch($.TRADER.EXCHANGE.INPUT.RECEIVE_AMOUNT, receiveCurrency.currencySymbol)

    cy.getExplainMessageUnderInputField($.TRADER.EXCHANGE.INPUT.RECEIVE_AMOUNT)
      .invoke('text')
      .then((errorMessage) => {
        const errorMessageValue = extractNumber(errorMessage)

        const incrementedErrorMessageValue = incrementToClosestDecimal(errorMessageValue)

        cy.get($.TRADER.EXCHANGE.INPUT.RECEIVE_AMOUNT)
          .typeAndAssertValue(incrementedErrorMessageValue)

        cy.wait('@getOrderDetails')

        cy.mobileClickReceiveAmountLabelToShowOrderDetails()

        cy.mobileAssertReceiveAmountInInputAndOrderDetailsMatch($.TRADER.EXCHANGE.INPUT.RECEIVE_AMOUNT, receiveCurrency.currencySymbol)

        cy.getExplainMessageUnderInputField($.TRADER.EXCHANGE.INPUT.RECEIVE_AMOUNT)
          .should('not.be.empty')
          .and('not.contain', 'Required')

        cy.getExplainMessageUnderInputField($.TRADER.EXCHANGE.INPUT.RECEIVE_AMOUNT)
          .should('contain', `Maximum is ${errorMessageValue} ${receiveCurrency.currencySymbol}`)

        cy.get($.TRADER.EXCHANGE.INPUT.RECEIVE_AMOUNT)
          .typeAndAssertValue(errorMessageValue)

        cy.wait('@getOrderDetails')

        cy.getExplainMessageUnderInputField($.TRADER.EXCHANGE.INPUT.RECEIVE_AMOUNT)
          .should('not.exist')
      })
  })
})
