export default {
  DROPDOWN: {
    COUNTRY: '#tier-country-select',
  },

  INPUT: {
    STREET: '[name="person_attributes[address]"]',
    TOWN: '[name="person_attributes[city]"]',
    POSTAL_CODE: '[name="person_attributes[postal_code]"]',
    FIRST_NAME: '[name="person_attributes[first_name]"]',
    LAST_NAME: '[name="person_attributes[last_name]"]',
  },

  BUSINESS: {
    CONTAINER: {
      REGISTRATION_COUNTRY: '[data-test="verification[business_details_attributes][legal_country]"]',
      INCORPORATION_COUNTRIES: '[data-test="verification[business_details_attributes][incorporation_countries]"]',
      DIRECTOR: '[data-test="verification[business_director]"]',
      LEGAL_STATUS: '[data-test="verification[business_details_attributes][legal_status]"]',
      PHONE_NUMBER: '[data-test="verification[business_details_attributes][phone_number]"]',
    },
  },

  DIV: {
    TIER_CARD: '.tier-card',
  },
}
