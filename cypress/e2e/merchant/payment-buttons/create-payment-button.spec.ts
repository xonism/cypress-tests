import $ from '@selectors/index'
import { fiatCurrency, fiatMaxAmount, fiatMinAmount, fiatSliderStep } from '@fixtures/fiat-currency-info.json'
import { generateBusinessForAPI, generateTrader } from '@entity/entity-helper-functions'
import { generateButtonNameID } from '@support/merchant/merchant-helper-functions'

describe('Merchant - Payment Buttons - Create Payment Button', () => {
  const { email, password, countryCode } = generateTrader()

  const business = generateBusinessForAPI()

  const buttonTitle = 'Auto Test Button'
  const buttonNameID = generateButtonNameID()
  const underpaidCover = '0.5'

  before(() => {
    cy.clearCookies()
    cy.setUpVerifiedPersonalAccount(email, password, countryCode)

    cy.visit('/account/dashboard')
    cy.setUpVerifiedBusinessAccount(business)
  })

  beforeEach(() => {
    cy.loginViaAPI(email, password)
  })

  it('Create slider payment button', () => {
    cy.visit('/account/buttons')

    cy.breadcrumbContains('/Account/Merchant/Buttons')

    cy.headerContains('Payment Buttons')

    cy.get($.PAYMENT_BUTTONS.BTN.NEW)
      .should('be.visible')
      .click()

    cy.urlContains('/account/buttons/new')

    cy.breadcrumbContains('/Account/Merchant/Buttons/New')

    cy.headerContains('New Payment Button')

    cy.get($.GENERAL.FORM.FORM)
      .should('be.visible')

    cy.get($.PAYMENT_BUTTONS.DROPDOWN.INTEGRATION_URL)
      .should('be.visible')
      .click()

    cy.contains(`${$.GENERAL.DROPDOWN.SELECT_DROPDOWN_MENU_ITEM}:visible`, business.businessWebsite)
      .click()

    cy.get($.PAYMENT_BUTTONS.DROPDOWN.INTEGRATION_URL)
      .should('contain', business.businessWebsite)

    cy.get($.PAYMENT_BUTTONS.INPUT.TITLE)
      .typeAndAssertValue(buttonTitle)

    cy.get($.PAYMENT_BUTTONS.INPUT.NAME_ID)
      .typeAndAssertValue(buttonNameID)

    cy.get($.PAYMENT_BUTTONS.DROPDOWN.PRICE_CURRENCY)
      .should('be.visible')
      .click()

    cy.contains(`${$.GENERAL.DROPDOWN.SELECT_DROPDOWN_MENU_ITEM}:visible`, fiatCurrency)
      .click()

    cy.get($.PAYMENT_BUTTONS.DROPDOWN.PRICE_CURRENCY)
      .should('contain', fiatCurrency)

    cy.get($.PAYMENT_BUTTONS.BTN.SLIDER)
      .should('be.visible')
      .click()
      .should('have.class', 'active')

    cy.get($.PAYMENT_BUTTONS.INPUT.SLIDER.MIN)
      .typeAndAssertValue(fiatMinAmount)

    cy.get($.PAYMENT_BUTTONS.INPUT.SLIDER.MAX)
      .typeAndAssertValue(fiatMaxAmount)

    cy.get($.PAYMENT_BUTTONS.INPUT.SLIDER.STEP)
      .typeAndAssertValue(fiatSliderStep)

    cy.get($.PAYMENT_BUTTONS.DROPDOWN.INVOICE_TIME)
      .should('be.visible')
      .and('contain', '20 minutes')

    cy.get($.PAYMENT_BUTTONS.INPUT.UNDERPAID_COVER)
      .typeAndAssertValue(underpaidCover)

    cy.assertSliderHandleHasValue(underpaidCover)

    cy.get($.PAYMENT_BUTTONS.BTN.HIDE_ADVANCED_OPTIONS)
      .should('be.visible')
      .click()

    cy.get($.PAYMENT_BUTTONS.INPUT.UNDERPAID_COVER)
      .should('not.exist')

    cy.get($.PAYMENT_BUTTONS.BTN.CREATE)
      .should('be.visible')
      .click()

    cy.contains($.GENERAL.TAB, 'Settings') // TODO: add selector
      .should('be.visible')

    cy.contains($.GENERAL.TAB, 'Currency Settings') // TODO: add selector
      .should('be.visible')
      .and('have.class', 'ant-tabs-tab-active')

    cy.contains($.GENERAL.TAB, 'Button Images') // TODO: add selector
      .should('be.visible')

    cy.getPaymentButtonsViaAPI()
      .then((response) => {
        const paymentButtonID = response.body.data[0].id

        cy.urlContains(`/account/buttons/${paymentButtonID}/edit#currency-settings`)

        cy.breadcrumbContains(`/Account/Merchant/Buttons/Button #${paymentButtonID}/Edit`)

        cy.contains('h1', `Button #${paymentButtonID}`) // TODO: add selector
          .should('be.visible')
      })

    cy.contains('h2', 'Invoice Currency Settings') // TODO: add selector
      .should('be.visible')

    cy.getButtonWithText('Enable All') // TODO: add selector
      .should('be.visible')

    cy.getButtonWithText('Disable All') // TODO: add selector
      .should('be.visible')

    cy.getButtonWithText('Reset to Default') // TODO: add selector
      .should('be.visible')

    cy.get($.MERCHANT.SORTABLE_CURRENCIES.CARD)
      .should('be.visible')

    cy.get($.MERCHANT.SORTABLE_CURRENCIES.GRABBER)
      .should('be.visible')

    cy.get($.MERCHANT.SORTABLE_CURRENCIES.LOGO)
      .should('be.visible')

    cy.get($.MERCHANT.SORTABLE_CURRENCIES.TITLE)
      .should('be.visible')

    cy.get($.MERCHANT.SORTABLE_CURRENCIES.SWITCH)
      .should('be.visible')

    cy.get($.MERCHANT.SORTABLE_CURRENCIES.RECEIVE_CURRENCY)
      .should('be.visible')
  })

  after(() => {
    cy.deleteAllPaymentButtons()
  })
})
