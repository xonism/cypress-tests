import faker from 'faker'
import { traderCountry, traderCountryCode } from '@fixtures/trader-currency-and-country.json'
import { IBusiness } from '../interfaces'

const getFirstName = () => faker.name.firstName().toLowerCase()

const getLastName = () => faker.name.lastName().toLowerCase()

export const generateEmail = () => `${getFirstName()}-${getLastName()}-${new Date().getTime()}@example.com`

export const generatePassword = () => `${faker.internet.password()}A1+`

export const generateCompanyName = () => faker.company.companyName()

export const generateTrader = () => ({
  email: generateEmail(),
  password: generatePassword(),
  countryCode: traderCountryCode,
})

export const generateBusinessForAPI = (): IBusiness => ({
  businessTitle: 'Auto Test Business',
  businessEmail: generateEmail(),
  businessCountryCode: traderCountryCode,
  businessWebsite: 'https://www.auto.test.business.com'
})

export const generateBusinessForUiRegistration = () => ({
  businessTitle: 'Auto Test Business',
  businessEmail: generateEmail(),
  businessCountry: traderCountry,
  businessWebsite: 'www.auto.test.business.com'
})

export const generateTier1VerificationInfo = () => ({
  country: 'Lithuania',
  street: 'Gatvės g.',
  town: 'Miestas',
  postalCode: '12345',
  firstName: 'Vardenis',
  lastName: 'Pavardenis'
})
