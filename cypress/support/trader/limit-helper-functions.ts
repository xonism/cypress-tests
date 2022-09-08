/**
 * Extracts number from string
 * @returns first found number in string or `null` if number isn't found
 */
export const extractNumber = (text: string): number | null => {
  const NUMBER_REGEX = /[-]{0,1}[\d]*[.]{0,1}[\d]+/g

  const regexMatchResult = text.match(NUMBER_REGEX)

  return regexMatchResult === null
    ? null
    : Number(regexMatchResult[0])
}

const getDecimalPlaces = (number: number) => number.toString().split('.')[1].length

const getSmallestDecimalFraction = (number: number) => Number(`0.${'0'.repeat(getDecimalPlaces(number)- 1)}1`)

export const incrementToClosestDecimal = (number: number) => {
  const smallestDecimalFraction = getSmallestDecimalFraction(number)
  const decimalPlaces = getDecimalPlaces(number)

  return parseFloat(
    (number + smallestDecimalFraction).toFixed(decimalPlaces)
  )
}

export const decrementToClosestDecimal = (number: number) => {
  const smallestDecimalFraction = getSmallestDecimalFraction(number)
  const decimalPlaces = getDecimalPlaces(number)

  return parseFloat(
    (number - smallestDecimalFraction).toFixed(decimalPlaces)
  )
}


export const extractMonthlyLimit = (text: string) => Number(text.match(/([0-9]*)\s+(EUR|USD|GBP)/g)[0].split(' ')[0])
