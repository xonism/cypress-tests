import $ from '@selectors/index'

declare global {
  namespace Cypress {
    interface Chainable {
      getPaymentsViaAPI(): Promise<any>
      assertSubscriberTableContainsSubscriberInfoInPayments(billingSubscriber: { email: string, merchantID: string, organisationName: any, firstName: any, lastName: any, address: any, secondaryAddress: any, city: any, postalCode: any, country: any }): Chainable<Element>
    }
  }
}

Cypress.Commands.add('getPaymentsViaAPI', () => {
  cy.internalRequest({
    url: '/account/billing/payments.json'
  }).then((response) => {
    expect(response.status).to.be.eq(200)
  })
})

Cypress.Commands.add('assertSubscriberTableContainsSubscriberInfoInPayments', (billingSubscriber) => {
  cy.contains($.GENERAL.DESCRIPTIONS.DESCRIPTIONS, 'Subscriber')
    .should('be.visible')
    .within(() => {
      cy.get($.GENERAL.DESCRIPTIONS.ROW)
        .should('have.length', 10)

      cy.assertContentNextToLabelContains('Email', billingSubscriber.email)
      cy.assertContentNextToLabelContains('Subscriber ID', billingSubscriber.merchantID)
      cy.assertContentNextToLabelContains('Organisation Name', billingSubscriber.organisationName)
      cy.assertContentNextToLabelContains('First Name', billingSubscriber.firstName)
      cy.assertContentNextToLabelContains('Last Name', billingSubscriber.lastName)
      cy.assertContentNextToLabelContains('Address', billingSubscriber.address)
      cy.assertContentNextToLabelContains('Secondary Address', billingSubscriber.secondaryAddress)
      cy.assertContentNextToLabelContains('City', billingSubscriber.city)
      cy.assertContentNextToLabelContains('Postal Code', billingSubscriber.postalCode)
      cy.assertContentNextToLabelContains('Country', billingSubscriber.country)
    })
})
