import $ from '@selectors/index'
import cryptoPayoutCurrencyInfo from '@fixtures/crypto-payout-settings.json'
import { decrementToClosestDecimal, extractNumber, incrementToClosestDecimal } from '@support/trader/limit-helper-functions'
import { generateTrader } from '@entity/entity-helper-functions'
import { traderCountry, traderCurrencyCode, traderCurrencySymbol } from '@fixtures/trader-currency-and-country.json'

describe('Mobile - Trader - Buy - Input Validation', () => {
  const { email, password, countryCode } = generateTrader()

  const receiveCurrency = cryptoPayoutCurrencyInfo.BTC
  const { currencySymbol, amount } = receiveCurrency

  const payAmount = 100

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

  it('[Mobile] Check if only digits & dots are allowed in pay & receive fields', () => {
    const allCharString = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcdefghijklmnopqrstuvwxyz{|}~'

    cy.visit('/account/trader/trade#buy')

    cy.get($.TRADER.MOBILE.BUY.DROPDOWN.PAYMENT_METHOD)
      .should('be.visible')

    cy.mobileSelectPaymentMethod($.TRADER.BUY.BTN.SEPA)

    cy.wait('@getOrderDetails')

    cy.get($.TRADER.BUY.INPUT.PAY_AMOUNT)
      .typeAndAssertValue(allCharString, '..0123456789')

    cy.get($.TRADER.BUY.INPUT.RECEIVE_AMOUNT)
      .typeAndAssertValue(allCharString, '..0123456789')
  })

  it('[Mobile] Check pay & receive field whitespace validation', () => {
    cy.visit('/account/trader/trade#buy')

    cy.get($.TRADER.MOBILE.BUY.DROPDOWN.PAYMENT_METHOD)
      .should('be.visible')

    cy.mobileSelectPaymentMethod($.TRADER.BUY.BTN.SEPA)

    cy.wait('@getOrderDetails')

    cy.selectCryptoCurrency($.TRADER.MOBILE.BUY.DROPDOWN.RECEIVE_CURRENCY, receiveCurrency)

    cy.get($.TRADER.BUY.INPUT.PAY_AMOUNT)
      .type('   ')
      .should('be.empty')

    cy.getExplainMessageUnderInputField($.TRADER.BUY.INPUT.PAY_AMOUNT)
      .should('contain', 'Required')

    cy.get($.TRADER.BUY.INPUT.PAY_AMOUNT)
      .typeAndAssertValue(`   ${payAmount}   `, payAmount)

    cy.wait('@getOrderDetails')

    cy.getExplainMessageUnderInputField($.TRADER.BUY.INPUT.PAY_AMOUNT)
      .should('not.exist')

    cy.reload()

    cy.urlContains('/account/trader/trade#buy')

    cy.get($.TRADER.MOBILE.BUY.DROPDOWN.PAYMENT_METHOD)
      .should('be.visible')

    cy.selectCryptoCurrency($.TRADER.MOBILE.BUY.DROPDOWN.RECEIVE_CURRENCY, receiveCurrency)

    cy.mobileSelectPaymentMethod($.TRADER.BUY.BTN.SEPA)

    cy.wait('@getOrderDetails')

    cy.get($.TRADER.BUY.INPUT.RECEIVE_AMOUNT)
      .type('   ')
      .should('be.empty')

    cy.getExplainMessageUnderInputField($.TRADER.BUY.INPUT.RECEIVE_AMOUNT)
      .should('contain', 'Required')

    cy.get($.TRADER.BUY.INPUT.RECEIVE_AMOUNT)
      .typeAndAssertValue(`   ${amount}   `, amount)

    cy.wait('@getOrderDetails')

    cy.getExplainMessageUnderInputField($.TRADER.BUY.INPUT.RECEIVE_AMOUNT)
      .should('not.exist')
  })

  it('[Mobile] Check if value of one field changes if the other is changed', () => {
    cy.visit('/account/trader/trade#buy')

    cy.get($.TRADER.MOBILE.BUY.DROPDOWN.PAYMENT_METHOD)
      .should('be.visible')

    cy.mobileSelectPaymentMethod($.TRADER.BUY.BTN.SEPA)

    cy.wait('@getOrderDetails')

    cy.selectCryptoCurrency($.TRADER.MOBILE.BUY.DROPDOWN.RECEIVE_CURRENCY, receiveCurrency)

    cy.get($.TRADER.BUY.INPUT.PAY_AMOUNT)
      .typeAndAssertValue(payAmount)

    cy.wait('@getOrderDetails')

    cy.assertInputIsNotEmpty($.TRADER.BUY.INPUT.RECEIVE_AMOUNT)

    cy.get($.TRADER.BUY.INPUT.RECEIVE_AMOUNT)
      .typeAndAssertValue(amount)

    cy.wait('@getOrderDetails')

    cy.get($.TRADER.BUY.INPUT.PAY_AMOUNT)
      .should('not.eq', payAmount)

    cy.reload()

    cy.urlContains('/account/trader/trade#buy')

    cy.get($.TRADER.MOBILE.BUY.DROPDOWN.PAYMENT_METHOD)
      .should('be.visible')

    cy.selectCryptoCurrency($.TRADER.MOBILE.BUY.DROPDOWN.RECEIVE_CURRENCY, receiveCurrency)

    cy.mobileSelectPaymentMethod($.TRADER.BUY.BTN.SEPA)

    cy.wait('@getOrderDetails')

    cy.get($.TRADER.BUY.INPUT.RECEIVE_AMOUNT)
      .typeAndAssertValue(amount)

    cy.wait('@getOrderDetails')

    cy.assertInputIsNotEmpty($.TRADER.BUY.INPUT.PAY_AMOUNT)

    cy.get($.TRADER.BUY.INPUT.PAY_AMOUNT)
      .typeAndAssertValue(payAmount)

    cy.wait('@getOrderDetails')

    cy.get($.TRADER.BUY.INPUT.RECEIVE_AMOUNT)
      .should('not.eq', amount)
  })

  it('[Mobile] Check minimum pay amount validation', () => {
    const initialPayAmount = 0

    cy.visit('/account/trader/trade#buy')

    cy.get($.TRADER.MOBILE.BUY.DROPDOWN.PAYMENT_METHOD)
      .should('be.visible')

    cy.selectTraderCountry(traderCountry)

    cy.selectTraderCurrency($.TRADER.MOBILE.BUY.DROPDOWN.SELL_CURRENCY, traderCurrencyCode)

    cy.get($.TRADER.BUY.INPUT.PAY_AMOUNT)
      .typeAndAssertValue(initialPayAmount)

    cy.mobileSelectPaymentMethod($.TRADER.BUY.BTN.SEPA)

    cy.wait('@getOrderDetails')

    cy.assertOrderDetailsTotalAmount(initialPayAmount, traderCurrencySymbol)

    cy.getExplainMessageUnderInputField($.TRADER.BUY.INPUT.PAY_AMOUNT)
      .invoke('text')
      .then((errorMessage) => {
        const errorMessageValue = extractNumber(errorMessage)

        const decrementedErrorMessageValue = errorMessageValue - 1

        cy.get($.TRADER.BUY.INPUT.PAY_AMOUNT)
          .typeAndAssertValue(decrementedErrorMessageValue)

        cy.wait('@getOrderDetails')

        cy.mobileClickReceiveAmountLabelToShowOrderDetails()

        cy.assertOrderDetailsTotalAmount(decrementedErrorMessageValue, traderCurrencySymbol)

        cy.getExplainMessageUnderInputField($.TRADER.BUY.INPUT.PAY_AMOUNT)
          .should('not.be.empty')
          .and('not.contain', 'Required')

        cy.getExplainMessageUnderInputField($.TRADER.BUY.INPUT.PAY_AMOUNT)
          .should('contain', `Minimum is ${errorMessageValue} ${traderCurrencyCode}`)

        cy.get($.TRADER.BUY.INPUT.PAY_AMOUNT)
          .typeAndAssertValue(errorMessageValue)

        cy.wait('@getOrderDetails')

        cy.getExplainMessageUnderInputField($.TRADER.BUY.INPUT.PAY_AMOUNT)
          .should('not.exist')
      })
  })

  it('[Mobile] Check maximum pay amount validation', () => {
    const initialPayAmount = 100000

    cy.visit('/account/trader/trade#buy')

    cy.get($.TRADER.MOBILE.BUY.DROPDOWN.PAYMENT_METHOD)
      .should('be.visible')

    cy.selectTraderCountry(traderCountry)

    cy.selectTraderCurrency($.TRADER.MOBILE.BUY.DROPDOWN.SELL_CURRENCY, traderCurrencyCode)

    cy.get($.TRADER.BUY.INPUT.PAY_AMOUNT)
      .typeAndAssertValue(initialPayAmount)

    cy.mobileSelectPaymentMethod($.TRADER.BUY.BTN.SEPA)

    cy.wait('@getOrderDetails')

    cy.assertOrderDetailsTotalAmount(initialPayAmount, traderCurrencySymbol)

    cy.getExplainMessageUnderInputField($.TRADER.BUY.INPUT.PAY_AMOUNT)
      .invoke('text')
      .then((errorMessage) => {
        const errorMessageValue = extractNumber(errorMessage)

        const incrementedErrorMessageValue = errorMessageValue + 1

        cy.get($.TRADER.BUY.INPUT.PAY_AMOUNT)
          .typeAndAssertValue(incrementedErrorMessageValue)

        cy.wait('@getOrderDetails')

        cy.mobileClickReceiveAmountLabelToShowOrderDetails()

        cy.assertOrderDetailsTotalAmount(incrementedErrorMessageValue, traderCurrencySymbol)

        cy.getExplainMessageUnderInputField($.TRADER.BUY.INPUT.PAY_AMOUNT)
          .should('not.be.empty')
          .and('not.contain', 'Required')

        cy.getExplainMessageUnderInputField($.TRADER.BUY.INPUT.PAY_AMOUNT)
          .should('contain', `Maximum is ${errorMessageValue} ${traderCurrencyCode}`)

        cy.get($.TRADER.BUY.INPUT.PAY_AMOUNT)
          .typeAndAssertValue(errorMessageValue)

        cy.wait('@getOrderDetails')

        cy.getExplainMessageUnderInputField($.TRADER.BUY.INPUT.PAY_AMOUNT)
          .should('not.exist')
      })
  })

  it('[Mobile] Check minimum receive amount validation', () => {
    const initialReceiveAmount = 0

    cy.visit('/account/trader/trade#buy')

    cy.get($.TRADER.MOBILE.BUY.DROPDOWN.PAYMENT_METHOD)
      .should('be.visible')

    cy.selectCryptoCurrency($.TRADER.MOBILE.BUY.DROPDOWN.RECEIVE_CURRENCY, receiveCurrency)

    cy.get($.TRADER.BUY.INPUT.RECEIVE_AMOUNT)
      .typeAndAssertValue(initialReceiveAmount)

    cy.mobileSelectPaymentMethod($.TRADER.BUY.BTN.SEPA)

    cy.wait('@getOrderDetails')

    cy.mobileAssertReceiveAmountInInputAndOrderDetailsMatch($.TRADER.BUY.INPUT.RECEIVE_AMOUNT, currencySymbol)

    cy.getExplainMessageUnderInputField($.TRADER.BUY.INPUT.RECEIVE_AMOUNT)
      .invoke('text')
      .then((errorMessage) => {
        const errorMessageValue = extractNumber(errorMessage)

        const decrementedErrorMessageValue = decrementToClosestDecimal(errorMessageValue)

        cy.get($.TRADER.BUY.INPUT.RECEIVE_AMOUNT)
          .typeAndAssertValue(decrementedErrorMessageValue)

        cy.wait('@getOrderDetails')

        cy.mobileClickReceiveAmountLabelToShowOrderDetails()

        cy.mobileAssertReceiveAmountInInputAndOrderDetailsMatch($.TRADER.BUY.INPUT.RECEIVE_AMOUNT, currencySymbol)

        cy.getExplainMessageUnderInputField($.TRADER.BUY.INPUT.RECEIVE_AMOUNT)
          .should('not.be.empty')
          .and('not.contain', 'Required')

        cy.getExplainMessageUnderInputField($.TRADER.BUY.INPUT.RECEIVE_AMOUNT)
          .should('contain', `Minimum is ${errorMessageValue} ${currencySymbol}`)

        cy.get($.TRADER.BUY.INPUT.RECEIVE_AMOUNT)
          .typeAndAssertValue(errorMessageValue)

        cy.wait('@getOrderDetails')

        cy.getExplainMessageUnderInputField($.TRADER.BUY.INPUT.RECEIVE_AMOUNT)
          .should('not.exist')
      })
  })

  it('[Mobile] Check maximum receive amount validation', () => {
    const initialReceiveAmount = 100000

    cy.visit('/account/trader/trade#buy')

    cy.get($.TRADER.MOBILE.BUY.DROPDOWN.PAYMENT_METHOD)
      .should('be.visible')

    cy.selectCryptoCurrency($.TRADER.MOBILE.BUY.DROPDOWN.RECEIVE_CURRENCY, receiveCurrency)

    cy.get($.TRADER.BUY.INPUT.RECEIVE_AMOUNT)
      .typeAndAssertValue(initialReceiveAmount)

    cy.mobileSelectPaymentMethod($.TRADER.BUY.BTN.SEPA)

    cy.wait('@getOrderDetails')

    cy.mobileAssertReceiveAmountInInputAndOrderDetailsMatch($.TRADER.BUY.INPUT.RECEIVE_AMOUNT, currencySymbol)

    cy.getExplainMessageUnderInputField($.TRADER.BUY.INPUT.RECEIVE_AMOUNT)
      .invoke('text')
      .then((errorMessage) => {
        const errorMessageValue = extractNumber(errorMessage)

        const incrementedErrorMessageValue = incrementToClosestDecimal(errorMessageValue)

        cy.get($.TRADER.BUY.INPUT.RECEIVE_AMOUNT)
          .typeAndAssertValue(incrementedErrorMessageValue)

        cy.wait('@getOrderDetails')

        cy.mobileClickReceiveAmountLabelToShowOrderDetails()

        cy.mobileAssertReceiveAmountInInputAndOrderDetailsMatch($.TRADER.BUY.INPUT.RECEIVE_AMOUNT, currencySymbol)

        cy.getExplainMessageUnderInputField($.TRADER.BUY.INPUT.RECEIVE_AMOUNT)
          .should('not.be.empty')
          .and('not.contain', 'Required')

        cy.getExplainMessageUnderInputField($.TRADER.BUY.INPUT.RECEIVE_AMOUNT)
          .should('contain', `Maximum is ${errorMessageValue} ${currencySymbol}`)

        cy.get($.TRADER.BUY.INPUT.RECEIVE_AMOUNT)
          .typeAndAssertValue(errorMessageValue)

        cy.wait('@getOrderDetails')

        cy.getExplainMessageUnderInputField($.TRADER.BUY.INPUT.RECEIVE_AMOUNT)
          .should('not.exist')
      })
  })
})
