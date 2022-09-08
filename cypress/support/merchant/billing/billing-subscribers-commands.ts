import $ from '@selectors/index'

declare global {
  namespace Cypress {
    interface Chainable {
      createSubscriberViaAPI(billingSubscriber): Chainable<Element>
      deleteSubscriberViaAPI(billingSubscriberID: string | number): Chainable<Element>
      deleteAllSubscribers(): Chainable<Element>
      getSubscribersViaAPI(): Promise<any>
      assertPayerCardContainsSubscriberInfo(billingSubscriber, checkOrganisationName?: boolean): Chainable<Element>
      assertSubscriberTableContainsSubscriberInfo(billingSubscriber): Chainable<Element>
    }
  }
}

Cypress.Commands.add('createSubscriberViaAPI', (billingSubscriber) => {
  cy.logStep('API: Create billing subscriber')

  cy.internalRequest({
    url: '/account/billing/subscribers',
    method: 'POST',
    body: {
      'billing_subscriber': {
        'email': billingSubscriber.email,
        'merchant_subscriber_id': billingSubscriber.merchantID,
        'organisation_name': billingSubscriber.organisationName,
        'first_name': billingSubscriber.firstName,
        'last_name': billingSubscriber.lastName,
        'address': billingSubscriber.address,
        'secondary_address': billingSubscriber.secondaryAddress,
        'city': billingSubscriber.city,
        'postal_code': billingSubscriber.postalCode,
        'country': billingSubscriber.country
      }
    }
  }).then((response) => {
    expect(response.status).to.be.eq(200)
  })
})

Cypress.Commands.add('deleteSubscriberViaAPI', (billingSubscriberID) => {
  cy.logStep('API: Delete billing subscriber')

  cy.internalRequest({
    url: `/account/billing/subscribers/${billingSubscriberID}`,
    method: 'DELETE'
  }).then((response) => {
    expect(response.status).to.be.eq(200)
  })
})

Cypress.Commands.add('deleteAllSubscribers', () => {
  cy.visit('/account/billing/subscribers')

  cy.get('tbody tr')
    .each((tableRow) => {
      cy.wrap(tableRow)
        .find('td')
        .first()
        .invoke('text')
        .then((billingSubscriberID) => {
          cy.deleteSubscriberViaAPI(billingSubscriberID)
        })
    })

  cy.reload()

  cy.assertEmptyTableState()
})

Cypress.Commands.add('getSubscribersViaAPI', () => {
  cy.logStep('API: Get billing subscribers')

  cy.internalRequest({
    url: '/account/billing/subscribers.json'
  }).then((response) => {
    expect(response.status).to.be.eq(200)
  })
})

Cypress.Commands.add('assertPayerCardContainsSubscriberInfo', (billingSubscriber, checkOrganisationName = true) => {
  cy.contains('.ant-col', 'Payer') // TODO: add selector
    .should('contain', billingSubscriber.firstName)
    .and('contain', billingSubscriber.lastName)
    .and('contain', billingSubscriber.email)
    .and('contain', billingSubscriber.address)
    .and('contain', billingSubscriber.secondaryAddress)
    .and('contain', billingSubscriber.city)
    .and('contain', billingSubscriber.postalCode)
    .and('contain', billingSubscriber.country)

  if (checkOrganisationName) {
    cy.contains('.ant-col', 'Payer') // TODO: add selector
      .should('contain', billingSubscriber.organisationName)
  }
})

Cypress.Commands.add('assertSubscriberTableContainsSubscriberInfo', (billingSubscriber) => {
  cy.contains($.GENERAL.DESCRIPTIONS.DESCRIPTIONS, 'Subscriber')
    .should('be.visible')
    .within(() => {
      cy.get($.GENERAL.DESCRIPTIONS.ROW)
        .should('have.length', 11)

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
