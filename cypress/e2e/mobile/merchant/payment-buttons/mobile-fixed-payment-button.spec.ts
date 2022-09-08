import $ from '@selectors/index'
import { cryptoCurrencySymbol } from '@fixtures/crypto-currency-info.json'
import { fiatCurrency, fiatCurrencyCode, fiatMinAmount } from '@fixtures/fiat-currency-info.json'
import { generateBusinessForAPI, generateTrader } from '@entity/entity-helper-functions'

describe('Mobile - Merchant - Payment Buttons - Fixed', () => {
  const { email, password, countryCode } = generateTrader()

  const business = generateBusinessForAPI()

  before(() => {
    cy.clearCookies()
    cy.setUpVerifiedPersonalAccount(email, password, countryCode)

    cy.visit('/account/dashboard')
    cy.setUpVerifiedBusinessAccount(business)

    cy.createFixedPaymentButtonViaAPI(fiatCurrency, fiatMinAmount)
  })

  beforeEach(() => {
    cy.setMobileResolution()

    cy.loginViaAPI(email, password)

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

    cy.contains('h3', `${fiatMinAmount} ${fiatCurrencyCode}`)
      .should('be.visible')

    cy.getButtonWithText('Checkout') // TODO: add selector
      .should('be.visible')
      .click()
  })

  it('[Mobile] Create pending order with fixed payment button', () => {
    cy.urlContains('/invoice')

    cy.get('.business-name')// FIXME: fix these steps after new invoice launch
      .should('contain', business.businessTitle)

    cy.assertInvoiceElementsAreVisible()

    cy.get('.invoice-header')
      .should('contain', fiatMinAmount)
      .and('contain', fiatCurrencyCode)

    cy.selectCryptoCurrencyInInvoice(cryptoCurrencySymbol)

    cy.get('#invoice-checkout-button')
      .should('be.visible')
      .click()

    cy.get('.invoice-header')
      .should('contain', fiatMinAmount)
      .and('contain', fiatCurrencyCode)

    cy.assertInvoiceHeaderContainsInvoiceAmountInputValue(cryptoCurrencySymbol)

    cy.get('[data-test="invoice-amount-input"]')
      .siblings('.ant-input-prefix')
      .should('be.visible')
      .and('contain', cryptoCurrencySymbol)

    cy.get('.invoice-progress-bar')
      .should('be.visible')

    cy.get('#invoice-qr-code')
      .should('be.visible')

    cy.validateInvoice({ currency: cryptoCurrencySymbol })

    cy.get('[data-test="invoice-amount-input"]')
      .should('be.visible')
      .invoke('val')
      .then((amountInputValue) => {
        cy.visit('/account/orders')

        cy.breadcrumbContains('/Account/Merchant/Orders')

        cy.headerContains('Merchant Orders')

        cy.getMerchantOrdersViaAPI()
          .then((response) => {
            const latestMerchantOrder = response.body.data[0]
            const orderID = latestMerchantOrder.id
            const orderTypeInfo = latestMerchantOrder.orderable_info
            const orderTitle = latestMerchantOrder.title

            cy.get('tbody tr')
              .first()
              .within(() => {
                cy.assertTableDataCellContains(0, orderID)
                cy.assertTableDataCellContains(1, `${orderTypeInfo.name} #${orderTypeInfo.id}`)
                cy.assertTableDataCellContains(2, orderTitle)
                cy.assertTableDataCellContains(3, `${fiatMinAmount} ${fiatCurrencyCode}`)
                cy.assertTableDataCellContains(4, `${amountInputValue} ${cryptoCurrencySymbol}`)
                cy.assertTableDataCellContains(5, 'Pending')

                cy.assertTableDataCellIsNotEmpty(6)

                cy.assertTableDataCellIsEmpty(7)
                cy.assertTableDataCellIsEmpty(8)
                cy.assertTableDataCellIsEmpty(9)
                cy.assertTableDataCellIsEmpty(10)
              })
          })
      })
  })

  it('[Mobile] Create paid order with fixed payment button', () => {
    cy.urlContains('/invoice')

    cy.get('.business-name')// FIXME: fix these steps after new invoice launch
      .should('be.visible')
      .and('contain', business.businessTitle)

    cy.get('.invoice-header')
      .should('contain', fiatMinAmount)
      .and('contain', fiatCurrencyCode)

    cy.get('#invoice-checkout-button')
      .should('be.disabled')

    cy.selectCryptoCurrencyInInvoice(cryptoCurrencySymbol)

    cy.get('#invoice-checkout-button')
      .click()

    cy.get('.invoice-header')
      .should('contain', fiatMinAmount)
      .and('contain', fiatCurrencyCode)

    cy.assertInvoiceHeaderContainsInvoiceAmountInputValue(cryptoCurrencySymbol)

    cy.validateInvoice({ currency: cryptoCurrencySymbol })

    cy.get('[data-test="invoice-amount-input"]')
      .siblings('.ant-input-prefix')
      .should('contain', cryptoCurrencySymbol)

    cy.get('[data-test="invoice-amount-input"]')
      .invoke('val')
      .then((amountInputValue) => {
        cy.get('[data-test="button-mark-as-paid"]')
          .click()

        cy.get('#invoice-paid h2')
          .should('contain', 'Paid and Confirmed')

        cy.getButtonWithText('Back')
          .click()

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

        cy.get('.panel-body h3')
          .should('contain', `${fiatMinAmount} ${fiatCurrencyCode}`)

        cy.visit('/account/orders')

        cy.breadcrumbContains('/Account/Merchant/Orders')

        cy.headerContains('Merchant Orders')

        cy.getMerchantOrdersViaAPI()
          .then((response) => {
            const latestMerchantOrder = response.body.data[0]
            const orderID = latestMerchantOrder.id
            const orderTypeInfo = latestMerchantOrder.orderable_info
            const orderTitle = latestMerchantOrder.title
            const orderReceiveAmount = latestMerchantOrder.receive_amount

            cy.get('tbody tr')
              .first()
              .within(() => {
                cy.assertTableDataCellContains(0, orderID)
                cy.assertTableDataCellContains(1, `${orderTypeInfo.name} #${orderTypeInfo.id}`)
                cy.assertTableDataCellContains(2, orderTitle)
                cy.assertTableDataCellContains(3, `${fiatMinAmount} ${fiatCurrencyCode}`)
                cy.assertTableDataCellContains(4, `${amountInputValue} ${cryptoCurrencySymbol}`)
                cy.assertTableDataCellContains(5, 'Paid')

                cy.assertTableDataCellIsNotEmpty(6)
                cy.assertTableDataCellIsNotEmpty(7)

                cy.assertTableDataCellContains(8, `${orderReceiveAmount} USDT`)

                cy.assertTableDataCellIsNotEmpty(9)
                cy.assertTableDataCellIsNotEmpty(10)
              })
          })
      })
  })

  after(() => {
    cy.deleteAllPaymentButtons()
  })
})
