import { fiatCurrency, fiatMaxAmount, fiatMinAmount, fiatSliderStep, fiatTargetAmount } from '@fixtures/fiat-currency-info.json'
import { generateBusinessForAPI, generateTrader } from '@entity/entity-helper-functions'

describe('Mobile - Merchant - Payment Buttons - Display', () => {
  const { email, password, countryCode } = generateTrader()

  const business = generateBusinessForAPI()

  before(() => {
    cy.clearCookies()
    cy.setUpVerifiedPersonalAccount(email, password, countryCode)

    cy.visit('/account/dashboard')
    cy.setUpVerifiedBusinessAccount(business)
  })

  beforeEach(() => {
    cy.setMobileResolution()

    cy.loginViaAPI(email, password)

    cy.visit('/account/dashboard') // for being able to create payment buttons via API
  })

  it('[Mobile] Check fixed payment button display', () => {
    cy.createFixedPaymentButtonViaAPI(fiatCurrency, fiatMinAmount)

    cy.visit('/account/buttons')

    cy.breadcrumbContains('/Account/Merchant/Buttons')

    cy.headerContains('Payment Buttons')

    cy.getPaymentButtonsViaAPI()
      .then((response) => {
        const paymentButtonID = response.body.data[0].id
        const paymentButtonNameID = response.body.data[0].name

        cy.get('tbody tr')
          .first()
          .within(() => {
            cy.assertTableDataCellContains(0, paymentButtonID)

            cy.get('td')
              .eq(1)
              .find('a')
              .invoke('attr', 'href')
              .should('contain', `/pay/${paymentButtonNameID}`)

            cy.assertTableDataCellContains(2, paymentButtonNameID)
            cy.assertTableDataCellContains(3, 'Fixed Price')
            cy.assertTableDataCellContains(4, fiatMinAmount)
            cy.assertTableDataCellContains(5, fiatCurrency)

            cy.assertTableDataCellIsNotEmpty(6)
          })
      })
  })

  it('[Mobile] Check slider payment button display', () => {
    cy.createSliderPaymentButtonViaAPI(fiatCurrency, fiatMinAmount, fiatMaxAmount, fiatSliderStep)

    cy.visit('/account/buttons')

    cy.breadcrumbContains('/Account/Merchant/Buttons')

    cy.headerContains('Payment Buttons')

    cy.getPaymentButtonsViaAPI()
      .then((response) => {
        const paymentButtonID = response.body.data[0].id
        const paymentButtonNameID = response.body.data[0].name

        cy.get('tbody tr')
          .first()
          .within(() => {
            cy.assertTableDataCellContains(0, paymentButtonID)

            cy.get('td')
              .eq(1)
              .find('a')
              .invoke('attr', 'href')
              .should('contain', `/pay/${paymentButtonNameID}`)

            cy.assertTableDataCellContains(2, paymentButtonNameID)
            cy.assertTableDataCellContains(3, 'Slider')
            cy.assertTableDataCellContains(4, `Min: ${fiatMinAmount}, Max: ${fiatMaxAmount}, Step: ${fiatSliderStep}`)
            cy.assertTableDataCellContains(5, fiatCurrency)

            cy.assertTableDataCellIsNotEmpty(6)
          })
      })
  })

  it('[Mobile] Check dynamic payment button display', () => {
    cy.createDynamicPaymentButtonViaAPI(fiatCurrency, fiatMinAmount, fiatTargetAmount, fiatMaxAmount)

    cy.visit('/account/buttons')

    cy.breadcrumbContains('/Account/Merchant/Buttons')

    cy.headerContains('Payment Buttons')

    cy.getPaymentButtonsViaAPI()
      .then((response) => {
        const paymentButtonID = response.body.data[0].id
        const paymentButtonNameID = response.body.data[0].name

        cy.get('tbody tr')
          .first()
          .within(() => {
            cy.assertTableDataCellContains(0, paymentButtonID)

            cy.get('td')
              .eq(1)
              .find('a')
              .invoke('attr', 'href')
              .should('contain', `/pay/${paymentButtonNameID}`)

            cy.assertTableDataCellContains(2, paymentButtonNameID)
            cy.assertTableDataCellContains(3, 'Dynamic Price')

            cy.get('td')
              .eq(4)
              .should('contain', fiatMinAmount)
              .and('contain', fiatTargetAmount)
              .and('contain', fiatMaxAmount)

            cy.assertTableDataCellContains(5, fiatCurrency)

            cy.assertTableDataCellIsNotEmpty(6)
          })
      })
  })

  afterEach(() => {
    cy.deleteAllPaymentButtons()
  })
})
