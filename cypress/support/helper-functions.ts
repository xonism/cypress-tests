import faker from 'faker'
import { IStates } from './interfaces'

export const generateRandomNumber = () => faker.random.number()

export const getStage = () => {
  const baseURL = Cypress.config('baseUrl')
  const stage = ''

  return stage
}

export const getApiURL = () => ''

export const getTestingApiURL = () => ''

/**
 * @example '[data-test="select-payout-setting"]' => '[data-test="select-payout-setting'
 */
export const getSelectorWithoutLastTwoSymbols = (selector: string): string => selector.slice(0, -2)

/**
 * @example '4400.98' => '4,400.98'
 */
export const getFormattedNumber = (number: string) => number.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

export const getTraderSupportedStateNameRegex = (states: IStates) => {
  const supportedStateCode = Object.keys(states).find((key) => states[key].trader_supported === true)

  if (!supportedStateCode) {
    return null
  }

  const { label } = states[supportedStateCode]

  return new RegExp('^' + label + '$', 'g')
}

export const getMerchantSupportedStateNameRegex = (states: IStates) => {
  const supportedStateCode = Object.keys(states).find((key) => states[key].merchant_supported === true)

  if (!supportedStateCode) {
    return null
  }

  const { label } = states[supportedStateCode]

  return new RegExp('^' + label + '$', 'g')
}
