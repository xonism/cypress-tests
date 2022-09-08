import $ from '@selectors/index'

declare global {
  namespace Cypress {
    interface Chainable {
      mobileSelectPaymentMethod(paymentMethodSelector: string): Chainable<Element>
      mobileAssertCorrectPayoutSettingIsSelected(payoutAddress: string): Chainable<Element>
      mobileAssertReceiveAmountInInputAndOrderDetailsMatch(receiveInputSelector: string, currencySymbol: string): Chainable<Element>
      mobileAssertBusinessAccount(businessTitle: string): Chainable<Element>
      mobileClickReceiveAmountLabelToShowOrderDetails(): Chainable<Element>
      mobileClickOnMenu(): Chainable<Element>
      mobileAssertOrderPreviewIsVisible(): Chainable<Element>
      mobileAssertExchangeOrderPreviewIsVisible(): Chainable<Element>
    }
  }
}

Cypress.Commands.add('mobileSelectPaymentMethod', (paymentMethodSelector) => {
  cy.get($.TRADER.MOBILE.BUY.DROPDOWN.PAYMENT_METHOD)
    .should('be.visible')
    .click()

  cy.get(paymentMethodSelector)
    .should('be.visible')
    .click()

  switch (paymentMethodSelector) {
    case $.TRADER.BUY.BTN.EASY_BANK_TRANSFER:
      cy.get($.TRADER.MOBILE.BUY.DROPDOWN.PAYMENT_METHOD)
        .should('be.visible')
        .and('contain', 'Easy bank transfer')
      break

    case $.TRADER.BUY.BTN.SEPA:
      cy.get($.TRADER.MOBILE.BUY.DROPDOWN.PAYMENT_METHOD)
        .should('be.visible')
        .and('contain', 'SEPA')
      break

    case $.TRADER.BUY.BTN.MOONPAY:
      cy.get($.TRADER.MOBILE.BUY.DROPDOWN.PAYMENT_METHOD)
        .should('be.visible')
        .and('contain', 'Credit Card')
      break
  }
})

Cypress.Commands.add('mobileAssertCorrectPayoutSettingIsSelected', (payoutAddress) => {
  cy.get($.TRADER.MOBILE.SELL.DROPDOWN.PAYOUT_SETTING)
    .click()

  cy.get($.GENERAL.RADIO_WRAPPER_CHECKED)
    .should('contain', payoutAddress)

  cy.get(`${$.GENERAL.DRAWER.CLOSE}:visible`)
    .click()
})

Cypress.Commands.add('mobileAssertReceiveAmountInInputAndOrderDetailsMatch', (receiveInputSelector, currencySymbol) => {
  cy.get(receiveInputSelector)
    .invoke('val')
    .then((receiveInputValue) => {
      cy.get($.TRADER.MOBILE.BTN.ORDER_INFO)
        .click()

      cy.assertOrderDetailsReceiveAmount(receiveInputValue, currencySymbol)
    })
})

Cypress.Commands.add('mobileAssertBusinessAccount', (businessTitle) => {
  cy.mobileClickOnMenu()

  cy.get($.MENU.MERCHANT)
    .should('be.visible')
    .and('contain', 'Merchant')

  cy.get($.MENU.CREATE_INSTANT_BILL)
    .should('be.visible')
    .and('contain', 'Create an Instant Bill')

  cy.mobileClickOnMenu()

  cy.get($.ACCOUNT.TYPE)
    .and('contain', 'business')

  cy.get($.ACCOUNT.HEADER_MENU)
    .should('be.visible')
    .and('contain', businessTitle)
})

Cypress.Commands.add('mobileClickReceiveAmountLabelToShowOrderDetails', () => {
  cy.contains($.GENERAL.FIELD_LABEL, 'Receive Amount')
    .should('be.visible')
    .click()
})

Cypress.Commands.add('mobileClickOnMenu', () => {
  cy.get($.GENERAL.ICON.BARS)
    .should('be.visible')
    .click()
})

Cypress.Commands.add('mobileAssertOrderPreviewIsVisible', () => {
  cy.get($.TRADER.MOBILE.DIV.ORDER_PREVIEW)
    .should('be.visible')
    .within(() => {
      cy.get($.GENERAL.HEADER)
        .should('contain', 'Order preview')

      cy.get($.TRADER.MOBILE.DIV.CUSTOM_DETAILS)
        .should('be.visible')

      cy.get($.TRADER.MOBILE.DIV.ORDER_DETAILS)
        .should('be.visible')
    })
})

Cypress.Commands.add('mobileAssertExchangeOrderPreviewIsVisible', () => {
  cy.get($.TRADER.MOBILE.DIV.ORDER_PREVIEW)
    .should('be.visible')
    .within(() => {
      cy.get($.GENERAL.HEADER)
        .should('contain', 'Order preview')

      cy.get($.TRADER.MOBILE.DIV.ORDER_DETAILS)
        .should('be.visible')
    })
})
