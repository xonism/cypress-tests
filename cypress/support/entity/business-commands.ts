import $ from '@selectors/index'
import { getTestingApiURL } from '@support/helper-functions'
import { IBusiness } from '@support/interfaces'

declare global {
  namespace Cypress {
    interface Chainable {
      addBusinessViaAPI(business: IBusiness): Chainable<Element>
      getBusinessWebsiteViaAPI(): Cypress.Chainable<Cypress.Response<any>>
      approveBusinessWebsiteViaAPI(): Chainable<Element>
      rejectBusinessWebsiteViaAPI(): Chainable<Element>
      addBusinessAndApproveBusinessWebsiteViaAPI(business: IBusiness): Chainable<Element>
      verifyBusinessViaAPI(businessID: number): Chainable<Element>
      setUpVerifiedBusinessAccount(business: IBusiness): Chainable<Element>
      selectBusinessRegistrationCountry(businessRegistrationCountry: string): Chainable<Element>
      getBusinessAccountsViaAPI(): Promise<any>
    }
  }
}

const testingApiURL = getTestingApiURL()

Cypress.Commands.add('addBusinessViaAPI', ({ businessTitle, businessEmail, businessCountryCode, businessWebsite }) => {
  cy.logStep('API: Add business')

  cy.internalRequest({
    method: 'POST',
    url: '/account/business',
    body: {
      business: {
        email: businessEmail,
        terms: true,
        title: businessTitle,
        verification_attributes: {
          business_details_attributes: {
            legal_country: businessCountryCode,
            website: businessWebsite,
            websites_attributes: [
              {
                url: businessWebsite,
              }
            ],
          },
          step: 'create',
        },
      },
    },
  }).then((response) => {
    expect(response.status).to.be.within(200, 210)
  })
})

Cypress.Commands.add('getBusinessWebsiteViaAPI', () => {
  cy.logStep('API: Get business website')

  cy.internalRequest({
    url: '/account/business/settings.json'
  }).then((response) => {
    expect(response.status).to.be.eq(200)
  })
})

Cypress.Commands.add('approveBusinessWebsiteViaAPI', () => {
  cy.logStep('API: Approve business website')

  cy.getBusinessWebsiteViaAPI()
    .then((response) => {
      expect(response.status).to.eq(200)

      const websiteID = response.body.business.websites[0].id

      cy.internalRequest({
        method: 'POST',
        url: `${testingApiURL}/websites/${websiteID}/approve`
      }).then((response) => {
        expect(response.status).to.eq(204)
      })
    })
})

Cypress.Commands.add('rejectBusinessWebsiteViaAPI', () => {
  cy.logStep('API: Reject business website')

  cy.getBusinessWebsiteViaAPI()
    .then((response) => {
      expect(response.status).to.eq(200)

      const websiteID = response.body.business.websites[0].id

      cy.internalRequest({
        method: 'POST',
        url: `${testingApiURL}/websites/${websiteID}/reject`
      }).then((response) => {
        expect(response.status).to.eq(204)
      })
    })
})

Cypress.Commands.add('addBusinessAndApproveBusinessWebsiteViaAPI', (business) => {
  cy.addBusinessViaAPI(business)
  cy.approveBusinessWebsiteViaAPI()
})

Cypress.Commands.add('verifyBusinessViaAPI', (businessID) => {
  cy.logStep('API: Verify business')

  cy.internalRequest({
    method: 'POST',
    url: `${testingApiURL}/businesses/${businessID}/verify`
  }).then((response) => {
    expect(response.status).to.eq(204)
  })
})

Cypress.Commands.add('setUpVerifiedBusinessAccount', (business) => {
  cy.addBusinessViaAPI(business)
  cy.approveBusinessWebsiteViaAPI()

  cy.getBusinessAccountsViaAPI()
    .then((response) => {
      const businessID = response.body[0].business_id

      cy.verifyBusinessViaAPI(businessID)
    })
})

Cypress.Commands.add('selectBusinessRegistrationCountry', (businessRegistrationCountry) => {
  cy.get($.REGISTRATION.DROPDOWN.BUSINESS_COUNTRY)
    .should('be.visible')
    .click()

  cy.contains($.GENERAL.DROPDOWN.SELECT_DROPDOWN_MENU_ITEM, businessRegistrationCountry)
    .click()

  cy.get($.REGISTRATION.DROPDOWN.BUSINESS_COUNTRY)
    .should('contain', businessRegistrationCountry)
})

Cypress.Commands.add('getBusinessAccountsViaAPI', () => {
  cy.logStep('API: Get business accounts')

  cy.internalRequest({
    url: '/account/business/users.json'
  }).then((response) => {
    expect(response.status).to.be.eq(200)
  })
})
