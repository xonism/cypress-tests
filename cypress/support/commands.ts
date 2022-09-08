import $ from '@selectors/index'
import { getStage } from './helper-functions'

declare global {
  interface Window {
    App: any
  }

  namespace Cypress {
    interface Chainable {
      setMobileResolution(): Chainable<Element>
      logStep(text: string): Chainable<Element>
      breadcrumbContains(value: string): Chainable<Element>
      urlContains(value: string): Chainable<Element>
      headerContains(value: string): Chainable<Element>
      assertNumberOfExplainMessages(number: number): Chainable<Element>
      assertBusinessAccount(businessTitle: string): Chainable<Element>
      internalRequest(params): Chainable<Cypress.Response<any>>
      visitTestButtonUrl(): Chainable<Element>
      assertTabIsActive(tabName: string): Chainable<Element>
      clickOnMenuItem(menuItemSelector: string): Chainable<Element>
      assertMenuItemIsSelected(menuItemSelector: string): Chainable<Element>
      getButtonWithText(buttonText: string): Chainable<Element>
      waitForSpinAnimationToDisappear(): Chainable<Element>
      formHeaderContains(value: string): Chainable<Element>
      linkHrefContains(linkSelector: string, value: string): Chainable<Element>
      assertTicketFormIsDisplayed(): Chainable<Element>
    }
  }
}

Cypress.Commands.add('setMobileResolution', () => {
  cy.viewport('iphone-x')
})

Cypress.Commands.add('logStep', (text) => {
  cy.log(`🪙🪙🪙 **${text}**`)
})

Cypress.Commands.add('breadcrumbContains', (value) => {
  cy.get($.GENERAL.BREADCRUMB)
    .should('be.visible')
    .and('contain', value)
})

Cypress.Commands.add('urlContains', (value) => {
  cy.url()
    .should('contain', value)
})

Cypress.Commands.add('headerContains', (value) => {
  cy.get($.GENERAL.HEADER)
    .should('be.visible')
    .and('contain', value)
})

Cypress.Commands.add('assertNumberOfExplainMessages', (number) => {
  cy.get($.GENERAL.FORM.EXPLAIN)
    .should('be.visible')
    .and('have.length', number)
    .each((explainMessage) => {
      expect(explainMessage).to.have.text('Required')
    })
})

Cypress.Commands.add('assertBusinessAccount', (businessTitle) => {
  cy.get($.MENU.MERCHANT)
    .should('be.visible')
    .and('contain', 'Merchant')

  cy.get($.MENU.CREATE_INSTANT_BILL)
    .should('be.visible')
    .and('contain', 'Create an Instant Bill')

  cy.get($.ACCOUNT.TYPE)
    .should('be.visible')
    .should('contain', 'business')

  cy.get($.ACCOUNT.BUSINESS.BTN.CREATE_BUSINESS_ACCOUNT)
    .should('not.exist')

  cy.get($.ACCOUNT.HEADER_MENU)
    .should('be.visible')
    .and('contain', businessTitle)
})

Cypress.Commands.add('internalRequest',
  (
    params = {
      method: 'GET',
    }
  ) => {
    return cy.window().then((window) => {
      return cy.request({
        headers: {
          'X-CSRF-Token': window.App?.State?.authenticityToken,
        },
        ...params,
      })
    })
  }
)

Cypress.Commands.add('visitTestButtonUrl', () => {
  cy.visit('')

  cy.get($.PAYMENT_BUTTONS.PANEL.PANEL)
    .should('be.visible')

  cy.contains('h1', 'coingate-test-button')
    .should('be.visible')

  cy.contains('h3', '100.0 EUR')
    .should('be.visible')
})

Cypress.Commands.add('assertTabIsActive', (tabName) => {
  cy.contains($.GENERAL.TAB, tabName)
    .should('be.visible')
    .and('have.class', 'ant-tabs-tab-active')
})

Cypress.Commands.add('clickOnMenuItem', (menuItemSelector) => {
  cy.get(menuItemSelector)
    .should('be.visible')
    .click()
})

Cypress.Commands.add('assertMenuItemIsSelected', (menuItemSelector) => {
  cy.get(menuItemSelector)
    .should('be.visible')
    .and('have.class', 'ant-menu-item-selected')
})

Cypress.Commands.add('getButtonWithText', (buttonText) => {
  cy.contains('button', buttonText)
    .should('be.visible')
})

Cypress.Commands.add('waitForSpinAnimationToDisappear', () => {
  cy.get($.GENERAL.SPIN_DOT, { timeout: 20000 })
    .should('not.exist')
})

Cypress.Commands.add('formHeaderContains', (value) => {
  cy.get($.GENERAL.FORM.HEADER)
    .should('be.visible')
    .and('contain', value)
})

Cypress.Commands.add('linkHrefContains', (linkSelector, value) => {
  cy.get(linkSelector)
    .should('be.visible')
    .invoke('attr', 'href')
    .should('contain', value)
})

Cypress.Commands.add('assertTicketFormIsDisplayed', () => {
  cy.contains($.GENERAL.TICKET.FORM, 'Problems? Please use the form below to contact us')
    .should('be.visible')
    .within(() => {
      cy.get($.GENERAL.SPIN_DOT)
        .should('not.exist')

      cy.get($.GENERAL.TICKET.MESSAGE)
        .should('be.visible')

      cy.getButtonWithText('Submit ticket')
        .should('be.visible')
        .and('be.disabled')
    })
})
