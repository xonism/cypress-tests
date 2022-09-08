import faker from 'faker'
import { cryptoCurrency } from '@fixtures/crypto-currency-info.json'
import { fiatCurrency } from '@fixtures/fiat-currency-info.json'
import { generateCompanyName, generateEmail } from '@entity/entity-helper-functions'
import { generateRandomNumber } from '@support/helper-functions'
import { IBillingDetails } from '@support/interfaces'

const dateTwoYearsFromNow = new Date(new Date().setFullYear(new Date().getFullYear() + 2))

const currentMonthName = new Date().toLocaleString('default', { month: 'long' })

/** @example ('February') => 'Feb' */
const shortenedCurrentMonthName = currentMonthName.substring(0, 3)

const endYear = dateTwoYearsFromNow.getFullYear()
const endMonthNumber = dateTwoYearsFromNow.getMonth() + 1
const endMonthDay = dateTwoYearsFromNow.getDate()

export const getStartDate = () => ({
  startYear: new Date().getFullYear(),
  startMonthNumber: new Date().getMonth() + 1,
  startMonthName: currentMonthName,
  startShortenedMonthName: shortenedCurrentMonthName,
  startMonthDay: new Date().getDate()
})

/** @example getStartDateInISO() => '2022-06-06T08:17:18.659Z' */
export const getStartDateInISO = () => new Date().toISOString()

export const getEndDate = () => ({
  endYear,
  endMonthNumber,
  endMonthName: currentMonthName,
  endShortenedMonthName: shortenedCurrentMonthName,
  endMonthDay
})

/** @example getEndDateInISO() => '2022-06-06T08:17:18.659Z' */
export const getEndDateInISO = () => new Date(`${endYear}-${endMonthNumber}-${endMonthDay} GMT`).toISOString()

/** @example ('1') => '01' */
export const getFormattedDateNumber = (dateNumber) => dateNumber.toString().length === 1 ? `0${dateNumber}` : dateNumber

export const generateBillingDetailsItem = () => ({
  itemDescription: 'Item Description',
  itemID: `ITEM-${generateRandomNumber()}`,
  itemQuantity: 1,
  itemPrice: '50.0'
})

export const generateBillingDetails = (): IBillingDetails => ({
  title: 'Auto Test Billing Details Title',
  description: 'Auto Test Billing Details Description',
  sendBillViaEmail: true,
  callbackURL: faker.internet.url(),
  sendEmailPaidNotification: true,
  detailsID: `BILLING-DETAIL-${generateRandomNumber()}`,
  underpaidCover: '0.5',
  priceCurrency: fiatCurrency,
  receiveCurrency: cryptoCurrency
})

export const generateSubscriber = () => ({
  email: generateEmail(),
  merchantID: `MERCHANT-SUBSCRIBER-${generateRandomNumber()}`,
  organisationName: generateCompanyName(),
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  address: faker.address.streetAddress(),
  secondaryAddress: faker.address.streetAddress(),
  city: faker.address.city(),
  postalCode: faker.address.zipCode(),
  country: faker.address.country()
})
