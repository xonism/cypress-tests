import $ from '@selectors/index'
import { fiatCurrency, fiatCurrencyCode, fiatMinAmount } from '@fixtures/fiat-currency-info.json'
import { generateBusinessForAPI, generateTrader } from '@entity/entity-helper-functions'

describe('Mobile - Merchant - Payment Buttons - Functionalities', () => {
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

    cy.get('tbody tr')
      .should('be.visible')
      .and('have.length', 1)

    cy.get($.PAYMENT_BUTTONS.MOBILE.BTN.OPTIONS)
      .scrollIntoView()
      .should('be.visible')
      .click()
  })

  it('[Mobile] Check "Button Page" button functionality', () => {
    cy.getPaymentButtonsViaAPI()
      .then((response) => {
        const paymentButtonNameID = response.body.data[0].name
        const paymentButtonTitle = response.body.data[0].title

        cy.get($.PAYMENT_BUTTONS.MOBILE.BTN.BUTTON_PAGE_OPTION)
          .should('be.visible')
          .and('contain', 'Button Page')
          .invoke('attr', 'href')
          .should('contain', `/pay/${paymentButtonNameID}`)
          .then((href) => {
            cy.visit(href.toString())
          })

        cy.urlContains(`/pay/${paymentButtonNameID}`)

        cy.get($.PAYMENT_BUTTONS.PANEL.PANEL)
          .should('be.visible')

        cy.contains('h1', paymentButtonTitle) // TODO: add selector
          .should('be.visible')
      })

    cy.contains('h3', `${fiatMinAmount} ${fiatCurrencyCode}`) // TODO: add selector
      .should('be.visible')

    cy.getButtonWithText('Checkout') // TODO: add selector
      .should('be.visible')
  })

  it('[Mobile] Check "Edit" button functionality', () => {
    cy.get($.PAYMENT_BUTTONS.MOBILE.BTN.EDIT_OPTION)
      .should('be.visible')
      .and('contain', 'Edit')
      .click()

    cy.getPaymentButtonsViaAPI()
      .then((response) => {
        const paymentButtonID = response.body.data[0].id
        const paymentButtonNameID = response.body.data[0].name
        const paymentButtonTitle = response.body.data[0].title

        cy.urlContains(`/account/buttons/${paymentButtonID}/edit`)

        cy.breadcrumbContains(`/Account/Merchant/Buttons/Button #${paymentButtonID}/Edit`)

        cy.contains('h1', `Button #${paymentButtonID}`) // TODO: add selector
          .should('be.visible')

        cy.assertTabIsActive('Settings')

        cy.get($.GENERAL.FORM.FORM)
          .should('be.visible')

        cy.assertInputContains($.PAYMENT_BUTTONS.INPUT.TITLE, paymentButtonTitle)

        cy.assertInputContains($.PAYMENT_BUTTONS.INPUT.NAME_ID, paymentButtonNameID)

        cy.get($.PAYMENT_BUTTONS.DROPDOWN.INTEGRATION_URL)
          .should('be.visible')
          .and('contain', business.businessWebsite)

        cy.get($.PAYMENT_BUTTONS.SWITCH_CONTAINER)
          .should('be.visible')
          .and('contain', 'Display invoice head title on invoice')
          .find($.GENERAL.SWITCH)
          .should('be.visible')
          .and('not.be.checked')

        cy.get($.PAYMENT_BUTTONS.BTN.FIXED)
          .should('be.visible')
          .and('have.class', 'active')

        cy.assertInputContains($.PAYMENT_BUTTONS.INPUT.FIXED_PRICE, fiatMinAmount)

        cy.get($.PAYMENT_BUTTONS.DROPDOWN.PRICE_CURRENCY)
          .should('be.visible')
          .and('contain', fiatCurrency)

        cy.get($.PAYMENT_BUTTONS.DROPDOWN.INVOICE_TIME)
          .should('be.visible')
          .and('contain', '20 minutes')

        cy.get($.PAYMENT_BUTTONS.INPUT.TITLE)
          .typeAndAssertValue(`Edited ${paymentButtonTitle}`)

        cy.assertSliderHandleHasValue('0')

        cy.assertInputContains($.PAYMENT_BUTTONS.INPUT.UNDERPAID_COVER, '0')

        cy.get($.PAYMENT_BUTTONS.BTN.SUBMIT_EDIT)
          .should('be.visible')
          .click()

        cy.get($.GENERAL.MESSAGE)
          .should('be.visible')
          .and('contain', 'Button has been updated successfully!')

        cy.visit('/account/buttons')

        cy.get('tbody tr td')
          .eq(1)
          .should('contain', `Edited ${paymentButtonTitle}`)
      })
  })

  it('[Mobile] Check "Enable" & "Disable" button functionality', () => {
    cy.get($.PAYMENT_BUTTONS.MOBILE.BTN.DISABLE_OPTION)
      .should('be.visible')
      .and('contain', 'Disable')
      .click()

    cy.getPaymentButtonsViaAPI()
      .then((response) => {
        const paymentButtonTitle = response.body.data[0].title

        cy.contains('span', paymentButtonTitle)
          .should('have.class', 'ant-typography-disabled')

        cy.get('tbody tr td')
          .eq(1)
          .should('not.have.descendants', 'a')
      })

    cy.get($.PAYMENT_BUTTONS.MOBILE.BTN.OPTIONS)
      .scrollIntoView()
      .should('be.visible')
      .click()

    cy.get($.PAYMENT_BUTTONS.MOBILE.BTN.DISABLE_OPTION)
      .should('not.exist')

    cy.get($.PAYMENT_BUTTONS.MOBILE.BTN.BUTTON_PAGE_OPTION)
      .should('not.exist')

    cy.get($.PAYMENT_BUTTONS.MOBILE.BTN.ENABLE_OPTION)
      .should('be.visible')
      .and('contain', 'Enable')
      .click()

    cy.getPaymentButtonsViaAPI()
      .then((response) => {
        const paymentButtonTitle = response.body.data[0].title

        cy.contains('span', paymentButtonTitle)
          .should('not.exist')

        cy.get('tbody tr td')
          .eq(1)
          .find('a')
      })

    cy.get($.PAYMENT_BUTTONS.MOBILE.BTN.OPTIONS)
      .scrollIntoView()
      .should('be.visible')
      .click()

    cy.get($.PAYMENT_BUTTONS.MOBILE.BTN.ENABLE_OPTION)
      .should('not.exist')

    cy.get($.PAYMENT_BUTTONS.MOBILE.BTN.BUTTON_PAGE_OPTION)
      .should('be.visible')

    cy.get($.PAYMENT_BUTTONS.MOBILE.BTN.DISABLE_OPTION)
      .should('be.visible')
  })

  it('[Mobile] Check "Delete" button functionality', () => {
    cy.get($.PAYMENT_BUTTONS.MOBILE.BTN.DELETE_OPTION)
      .should('be.visible')
      .and('contain', 'Delete')
      .click()

    cy.get($.GENERAL.MODAL.BODY)
      .should('be.visible')
      .within(() => {
        cy.getButtonWithText('OK')
          .should('be.visible')
          .click()
      })

    cy.urlContains('/account/buttons')

    cy.waitForSpinAnimationToDisappear()

    cy.get('tbody tr')
      .should('not.exist')

    cy.assertEmptyTableState()
  })
})
