import $ from '@selectors/index'
import { extractNumber } from '@support/trader/limit-helper-functions'
import { fiatCurrency, fiatCurrencyCode } from '@fixtures/fiat-currency-info.json'
import { generateBusinessForAPI, generateTrader } from '@entity/entity-helper-functions'

describe('Mobile - Merchant - Payment Buttons - Dynamic - Limits', () => {
  const { email, password, countryCode } = generateTrader()

  const business = generateBusinessForAPI()

  const minAmount = 0.01
  const maxAmount = 10000000

  before(() => {
    cy.clearCookies()
    cy.setUpVerifiedPersonalAccount(email, password, countryCode)

    cy.visit('/account/dashboard')
    cy.setUpVerifiedBusinessAccount(business)
  })

  beforeEach(() => {
    cy.setMobileResolution()

    cy.loginViaAPI(email, password)

    cy.visit('/account/dashboard')
    cy.createDynamicPaymentButtonViaAPI(fiatCurrency, minAmount, maxAmount)
  })

  it('[Mobile] Check minimum pay amount validation', () => {
    cy.visit('/account/buttons')

    cy.visitFirstLinkInTable()

    cy.getPaymentButtonsViaAPI()
      .then((response) => {
        const paymentButtonNameID = response.body.data[0].name
        const paymentButtonTitle = response.body.data[0].title

        cy.urlContains(`/pay/${paymentButtonNameID}`)

        cy.get($.PAYMENT_BUTTONS.PANEL.PANEL)
          .should('be.visible')

        cy.contains('h1', paymentButtonTitle) // TODO: add selector
          .should('be.visible')
      })

    cy.getButtonWithText(`${maxAmount} ${fiatCurrencyCode}`) // TODO: add selector
      .should('be.visible')

    cy.getButtonWithText(`${minAmount} ${fiatCurrencyCode}`) // TODO: add selector
      .should('be.visible')
      .click()

    cy.contains('.text-center', `You will pay ${minAmount} ${fiatCurrencyCode}`) // TODO: add selector
      .should('be.visible')

    cy.getButtonWithText('Checkout') // TODO: add selector
      .should('be.visible')
      .click()

    cy.contains($.GENERAL.ALERT.DANGER, 'Price amount must be greater or equal to 0.10 EUR equivalent') // TODO: add selector
      .should('be.visible')
      .invoke('text')
      .then((alertText) => {
        const limitAmount = extractNumber(alertText)

        cy.visit('/account/dashboard')

        cy.createDynamicPaymentButtonViaAPI(fiatCurrency, limitAmount, maxAmount)

        cy.visit('/account/buttons')

        cy.visitFirstLinkInTable()

        cy.getPaymentButtonsViaAPI()
          .then((response) => {
            const paymentButtonNameID = response.body.data[0].name
            const paymentButtonTitle = response.body.data[0].title

            cy.urlContains(`/pay/${paymentButtonNameID}`)

            cy.get($.PAYMENT_BUTTONS.PANEL.PANEL)
              .should('be.visible')

            cy.contains('h1', paymentButtonTitle) // TODO: add selector
              .should('be.visible')
          })

        cy.getButtonWithText(`${maxAmount} ${fiatCurrencyCode}`) // TODO: add selector
          .should('be.visible')

        cy.getButtonWithText(`${limitAmount} ${fiatCurrencyCode}`) // TODO: add selector
          .should('be.visible')
          .click()

        cy.contains('.text-center', `You will pay ${limitAmount} ${fiatCurrencyCode}`) // TODO: add selector
          .should('be.visible')

        cy.getButtonWithText('Checkout') // TODO: add selector
          .should('be.visible')
          .click()

        cy.urlContains('/invoice')
      })
  })

  it('[Mobile] Check maximum pay amount validation', () => {
    cy.visit('/account/buttons')

    cy.visitFirstLinkInTable()

    cy.getPaymentButtonsViaAPI()
      .then((response) => {
        const paymentButtonNameID = response.body.data[0].name
        const paymentButtonTitle = response.body.data[0].title

        cy.urlContains(`/pay/${paymentButtonNameID}`)

        cy.get($.PAYMENT_BUTTONS.PANEL.PANEL)
          .should('be.visible')

        cy.contains('h1', paymentButtonTitle) // TODO: add selector
          .should('be.visible')
      })

    cy.getButtonWithText(`${minAmount} ${fiatCurrencyCode}`) // TODO: add selector
      .should('be.visible')

    cy.getButtonWithText(`${maxAmount} ${fiatCurrencyCode}`) // TODO: add selector
      .should('be.visible')
      .click()

    cy.contains('.text-center', `You will pay ${maxAmount} ${fiatCurrencyCode}`) // TODO: add selector
      .should('be.visible')

    cy.getButtonWithText('Checkout') // TODO: add selector
      .should('be.visible')
      .click()

    cy.contains($.GENERAL.ALERT.DANGER, 'Max allowed price amount is 100000 EUR. Contact support@coingate.com to increase limits') // TODO: add selector
      .should('be.visible')
      .invoke('text')
      .then((alertText) => {
        const limitAmount = extractNumber(alertText)

        cy.visit('/account/dashboard')

        cy.createDynamicPaymentButtonViaAPI(fiatCurrency, minAmount, limitAmount)

        cy.visit('/account/buttons')

        cy.visitFirstLinkInTable()

        cy.getPaymentButtonsViaAPI()
          .then((response) => {
            const paymentButtonNameID = response.body.data[0].name
            const paymentButtonTitle = response.body.data[0].title

            cy.urlContains(`/pay/${paymentButtonNameID}`)

            cy.get($.PAYMENT_BUTTONS.PANEL.PANEL)
              .should('be.visible')

            cy.contains('h1', paymentButtonTitle) // TODO: add selector
              .should('be.visible')
          })

        cy.getButtonWithText(`${minAmount} ${fiatCurrencyCode}`) // TODO: add selector
          .should('be.visible')

        cy.getButtonWithText(`${limitAmount} ${fiatCurrencyCode}`) // TODO: add selector
          .should('be.visible')
          .click()

        cy.contains('.text-center', `You will pay ${limitAmount} ${fiatCurrencyCode}`) // TODO: add selector
          .should('be.visible')

        cy.getButtonWithText('Checkout') // TODO: add selector
          .should('be.visible')
          .click()

        cy.urlContains('/invoice')
      })
  })

  afterEach(() => {
    cy.deleteAllPaymentButtons()
  })
})
