import $ from '@selectors/index'
import { extractNumber } from '@support/trader/limit-helper-functions'
import { fiatCurrency, fiatCurrencyCode, fiatSliderStep } from '@fixtures/fiat-currency-info.json'
import { generateBusinessForAPI, generateTrader } from '@entity/entity-helper-functions'

describe('Merchant - Payment Buttons - Slider - Limits', () => {
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
    cy.loginViaAPI(email, password)

    cy.visit('/account/dashboard')
    cy.createSliderPaymentButtonViaAPI(fiatCurrency, minAmount, maxAmount, fiatSliderStep)
  })

  it('Check minimum pay amount validation', () => {
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

    cy.get($.GENERAL.SLIDER.SLIDER)
      .should('be.visible')
      .and('contain', `${minAmount} ${fiatCurrencyCode}`)
      .and('contain', `${maxAmount}.0 ${fiatCurrencyCode}`)

    cy.get($.GENERAL.INPUT.GROUP)
      .should('be.visible')
      .within(() => {
        cy.get($.GENERAL.INPUT.GROUP_ADDON)
          .should('contain', fiatCurrencyCode)

        cy.get('input') // TODO: add selector
          .typeAndAssertValue(minAmount)
      })

    cy.getButtonWithText('Checkout') // TODO: add selector
      .should('be.visible')
      .click()

    cy.get($.GENERAL.ALERT.DANGER)
      .should('contain', 'Price amount must be greater or equal to 0.10 EUR equivalent')
      .invoke('text')
      .then((alertText) => {
        const limitAmount = extractNumber(alertText)

        cy.visit('/account/dashboard')

        cy.createSliderPaymentButtonViaAPI(fiatCurrency, limitAmount, maxAmount, fiatSliderStep)

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

        cy.get($.GENERAL.SLIDER.SLIDER)
          .should('be.visible')
          .and('contain', `${limitAmount} ${fiatCurrencyCode}`)
          .and('contain', `${maxAmount}.0 ${fiatCurrencyCode}`)

        cy.get($.GENERAL.INPUT.GROUP)
          .should('be.visible')
          .within(() => {
            cy.get($.GENERAL.INPUT.GROUP_ADDON)
              .should('contain', fiatCurrencyCode)

            cy.get('input') // TODO: add selector
              .typeAndAssertValue(limitAmount)
          })

        cy.getButtonWithText('Checkout') // TODO: add selector
          .should('be.visible')
          .click()

        cy.urlContains('/invoice')
      })
  })

  it('Check maximum pay amount validation', () => {
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

    cy.get($.GENERAL.SLIDER.SLIDER)
      .should('be.visible')
      .and('contain', `${minAmount} ${fiatCurrencyCode}`)
      .and('contain', `${maxAmount}.0 ${fiatCurrencyCode}`)

    cy.get($.GENERAL.INPUT.GROUP)
      .should('be.visible')
      .within(() => {
        cy.get($.GENERAL.INPUT.GROUP_ADDON)
          .should('contain', fiatCurrencyCode)

        cy.get('input') // TODO: add selector
          .typeAndAssertValue(maxAmount)
      })

    cy.getButtonWithText('Checkout') // TODO: add selector
      .should('be.visible')
      .click()

    cy.get($.GENERAL.ALERT.DANGER)
      .should('contain', 'Max allowed price amount is 100000 EUR. Contact support@coingate.com to increase limits.')
      .invoke('text')
      .then((alertText) => {
        // removing any dots from `alertText`, otherwise they get extracted with amount & `limitAmount` becomes NaN
        const limitAmount = extractNumber(alertText.split('.')[0])

        cy.visit('/account/dashboard')

        cy.createSliderPaymentButtonViaAPI(fiatCurrency, minAmount, limitAmount, fiatSliderStep)

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

        cy.get($.GENERAL.SLIDER.SLIDER)
          .should('be.visible')
          .and('contain', `${minAmount} ${fiatCurrencyCode}`)
          .and('contain', `${limitAmount}.0 ${fiatCurrencyCode}`)

        cy.get($.GENERAL.INPUT.GROUP)
          .should('be.visible')
          .within(() => {
            cy.get($.GENERAL.INPUT.GROUP_ADDON)
              .should('contain', fiatCurrencyCode)

            cy.get('input') // TODO: add selector
              .typeAndAssertValue(limitAmount)
          })

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
