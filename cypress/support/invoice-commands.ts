import $ from '@selectors/index'
import Decimal from 'decimal.js'
import jsQR from 'jsqr'
import qs from 'querystringify'

declare global {
  namespace Cypress {
    interface Chainable {
      assertInvoiceHeaderContainsInvoiceAmountInputValue(cryptoCurrencySymbol: string): Chainable<Element>
      markOrderAsPaidInInvoice(cryptoCurrencySymbol: string): Chainable<Element>
      /** Decodes QR code and checks if displayed address matches */
      validateInvoice(options)
      markInvoiceAsPaidViaAPI(formattedPaymentURL: string): Chainable<Element>
      goToLoginPageThroughInvoice(): Chainable<Element>
      assertUserIsSignedInOnInvoice(): Chainable<Element>
      assertInvoiceElementsAreVisible(): Chainable<Element>
      selectCryptoCurrencyInInvoice(cryptoCurrencySymbol: string): Chainable<Element>
      selectCryptoNetworkInInvoice(cryptoCurrencySymbol: string): Chainable<Element>
    }
  }
}

Cypress.Commands.add('assertInvoiceHeaderContainsInvoiceAmountInputValue', (cryptoCurrencySymbol) => {
  cy.get('[data-test="invoice-amount-input"]') // FIXME: fix these steps after new invoice launch
    .invoke('val')
    .then((inputValue) => {
      cy.get('.invoice-header')
        .should('contain', `${inputValue} ${cryptoCurrencySymbol}`)
    })
})

Cypress.Commands.add('markOrderAsPaidInInvoice', (cryptoCurrencySymbol) => {
  cy.selectCryptoCurrencyInInvoice(cryptoCurrencySymbol)

  cy.get('#invoice-checkout-button') // FIXME: fix these steps after new invoice launch
    .click()

  cy.get('#invoice-qr-code')
    .should('be.visible')

  cy.get('[data-test="button-mark-as-paid"]')
    .click()

  cy.get('#invoice-paid h2')
    .should('contain', 'Paid and Confirmed')

  cy.getButtonWithText('Back')
    .click()
})

Cypress.Commands.add('validateInvoice', (options = {}) => {
  // decodes QR code and check if displayed address matches

  options.decimalsNumber = 0

  switch (options.currency) {
    case 'SRN':
      options.decimalsNumber = 18
      options.isEthToken = true
      break
    case 'DAI':
      options.decimalsNumber = 18
      options.isEthToken = true
      break
    case 'ETH':
      options.decimalsNumber = 18
      break
    case 'USDS':
      options.decimalsNumber = 6
      options.isEthToken = true
      break
    case 'TEL':
      options.decimalsNumber = 2
      options.isEthToken = true
      break
    case 'NANO':
      options.decimalsNumber = 30
      break
    default:
      break
  }

  cy.get('.ant-input-prefix > .addon', { timeout: 15000 }).contains(
    options.currency
  )

  cy.get<HTMLCanvasElement>('#invoice-qr-code canvas').then(($canvas) => {
    const canvas = $canvas[0]

    const imageData = canvas
      .getContext('2d')
      .getImageData(0, 0, canvas.width, canvas.height)

    const code = jsQR(imageData.data, imageData.width, imageData.height)

    const [ protocol_address, paramsQuery ] = code.data.split('?')
    const address = protocol_address.split(':').reverse()[0] // Might not have protocol

    const params: any = qs.parse(paramsQuery)

    if (
      Object.keys(options).includes('isEthToken') &&
      options.isEthToken === true
    ) {
      cy.get('#invoice-address-input').then(($invoiceAddressInput) => {
        expect(params.address).to.have.string(
          $invoiceAddressInput.val().toString()
        )
      })
    } else {
      cy.get('#invoice-address-input').then(($invoiceAddressInput) => {
        expect(address).to.have.string($invoiceAddressInput.val().toString())
      })
    }

    cy.get('#invoice-amount-input').should(
      ($input: JQuery<HTMLInputElement>) => {
        const amountFromQRCode = params.amount || params.uint256 || params.value

        if (amountFromQRCode) {
          const invoiceAmountNumber = new Decimal($input[0].value)

          const invoiceAmountPow = invoiceAmountNumber.times(
            10 ** options.decimalsNumber
          )

          expect(invoiceAmountPow.toNumber()).equals(
            new Decimal(amountFromQRCode).toNumber()
          )
        }
      }
    )
  })
})

Cypress.Commands.add('markInvoiceAsPaidViaAPI', (formattedPaymentURL) => {
  cy.logStep('API: Mark invoice as paid')

  cy.internalRequest({
    method: 'PATCH',
    url: formattedPaymentURL
  }).then((response) => {
    expect(response.status).to.be.eq(200)
  })
})

Cypress.Commands.add('goToLoginPageThroughInvoice', () => {
  cy.urlContains('coingate.com/invoice')

  cy.get('.business-name')
    .should('contain', 'CoinGate')

  cy.get('#sign-in-banner')
    .should('be.visible')

  cy.get('#sign-in-banner a')
    .first()
    .click()

  cy.contains('.login', 'Log In')
    .should('be.visible')
    .click()

  cy.contains('.top-text', 'Log in with one of your accounts')
    .should('be.visible')

  cy.contains('.action-button', 'CoinGate')
    .should('be.visible')
    .click()
})

Cypress.Commands.add('assertUserIsSignedInOnInvoice', () => {
  cy.urlContains('coingate.com/invoice')

  cy.get('.ant-avatar')
    .should('be.visible')
    .click()

  cy.get(`${$.GENERAL.DROPDOWN.DROPDOWN_MENU}:visible`)
    .should('contain', 'Forward invoice')
    .and('contain', 'Sign out')
})

Cypress.Commands.add('assertInvoiceElementsAreVisible', () => {
  cy.get('#sign-in-banner')
    .should('be.visible')

  cy.contains('h2', 'Select payment currency')
    .should('be.visible')

  cy.get('.currency-card')
    .should('be.visible')
    .and('have.length', 4)

  cy.get('.more-currencies')
    .should('be.visible')

  cy.get('#invoice-email')
    .should('be.visible')

  cy.get('#invoice-checkout-button')
    .should('be.visible')
    .and('be.disabled')

  cy.getButtonWithText('Cancel')
    .should('be.visible')
})

Cypress.Commands.add('selectCryptoCurrencyInInvoice', (cryptoCurrencySymbol) => {
  cy.contains('.currency-card', cryptoCurrencySymbol)
    .should('be.visible')
    .click()
    .should('have.class', 'active')

  cy.get('.invoice-header')
    .should('be.visible')
    .and('contain', cryptoCurrencySymbol)
})

Cypress.Commands.add('selectCryptoNetworkInInvoice', (platformTitle) => {
  cy.contains('.payment-info', 'Select Network')
    .should('be.visible')
    .within(() => {
      cy.contains('.currency-card', platformTitle)
        .should('be.visible')
        .click()
        .should('have.class', 'active')

      cy.get('#invoice-checkout-button')
        .should('be.visible')
        .click()
    })

  cy.get('.invoice-header')
    .should('be.visible')
    .and('contain', platformTitle)
})

/**
 * NEW INVOICE COMMANDS
 */

declare global {
  namespace Cypress {
    interface Chainable {
      assertInvoiceTitleContains(text: string): Chainable<Element>
      /** Currency name format: 'Bitcoin', 'Binance USD' */
      selectPayCurrencyInInvoice(currency: string): Chainable<Element>
      clickOnContinueInInvoice(): Chainable<Element>
      typeEmailInInvoice(email: string): Chainable<Element>
      assertWarningMessageInInvoiceContains(text: string): Chainable<Element>
      /** Network name format: 'Bitcoin', 'Binance Chain (BEP2)' */
      selectNetworkInInvoice(network: string): Chainable<Element>
      assertPayForOrderPageElementsAreVisibleInInvoice(): Chainable<Element>
      clickOnMarkAsPaidInInvoice(): Chainable<Element>
      clickOnInfoButtonInInvoice(): Chainable<Element>
    }
  }
}

Cypress.Commands.add('assertInvoiceTitleContains', (text) => {
  cy.get($.INVOICE.DIV.TITLE)
    .should('be.visible')
    .and('contain', text)
})

Cypress.Commands.add('selectPayCurrencyInInvoice', (currency) => {
  cy.get($.INVOICE.INPUT.SEARCH)
    .should('be.visible')
    .typeAndAssertValue(currency)

  cy.get(`[data-test="${currency}-currency"]`)
    .should('be.visible')
    .click()
    .should('have.class', 'selected')
})

Cypress.Commands.add('clickOnContinueInInvoice', () => {
  cy.get($.INVOICE.BTN.CONTINUE)
    .should('be.visible')
    .click()
})

Cypress.Commands.add('typeEmailInInvoice', (email) => {
  cy.get($.INVOICE.INPUT.EMAIL)
    .should('be.visible')
    .typeAndAssertValue(email)
})

Cypress.Commands.add('assertWarningMessageInInvoiceContains', (text) => {
  cy.get($.INVOICE.DIV.WARNING_MESSAGE)
    .should('be.visible')
    .and('contain', text)
})

Cypress.Commands.add('selectNetworkInInvoice', (network) => {
  cy.get(`[data-test="${network}-currency"]`)
    .should('be.visible')
    .click()
    .should('have.class', 'selected')
})

Cypress.Commands.add('assertPayForOrderPageElementsAreVisibleInInvoice', () => {
  cy.assertInvoiceTitleContains('Pay for\nYour Order')

  cy.assertWarningMessageInInvoiceContains('The “Pay in wallet“ button might not work')

  cy.get($.INVOICE.BTN.PAY_IN_WALLET)
    .should('be.visible')

  cy.get($.INVOICE.IMG.QR_CODE)
    .should('be.visible')

  cy.contains('a', 'How to pay with crypto')
    .should('be.visible')

  cy.get($.INVOICE.DIV.AMOUNT_FIELD)
    .should('be.visible')

  cy.get($.INVOICE.DIV.ADDRESS_FIELD)
    .should('be.visible')

  cy.get($.INVOICE.BTN.COPY)
    .should('be.visible')
    .and('have.length', 2)

  cy.get($.INVOICE.BTN.QR_CODE)
    .should('be.visible')
    .and('have.length', 2)

  cy.contains('a', 'Here is why')
    .should('be.visible')

  cy.contains('a', 'Disclaimer applies')
    .should('be.visible')
})

Cypress.Commands.add('clickOnMarkAsPaidInInvoice', () => {
  cy.contains('button', 'Mark as paid')
    .should('be.visible')
    .click()
})

Cypress.Commands.add('clickOnInfoButtonInInvoice', () => {
  cy.get($.INVOICE.BTN.INFO)
    .should('be.visible')
    .click()
})
