export default {
  CRYPTO: {
    DROPDOWN: {
      CURRENCY_NETWORK: '[data-test="platform-select"]',
    },
  
    INPUT: {
      TITLE: '[data-test="title"]',
      ADDRESS: '[data-test="Address"]',
    },
  },

  FIAT: {
    INPUT: {
      TITLE: '[data-test="title"]',
      ACCOUNT_HOLDER: '[name="payout_setting[bank_detail_attributes][account_holder_name]"]',
      BANK_NAME: '[name="payout_setting[bank_detail_attributes][bank_name]"]',
      SWIFT: '[name="payout_setting[bank_detail_attributes][swift]"]',
      IBAN: '[name="payout_setting[bank_detail_attributes][iban]"]',
    },
  },

  CONFIRMATION: {
    INPUT: {
      TITLE: '#payout-setting-title',
      ADDRESS: '[data-test="address"]',
      NETWORK: '[data-test="network"]',
      ACCOUNT_HOLDER: '[data-test="account_holder_name"]',
      BANK_NAME: '[data-test="bank_name"]',
      SWIFT: '[data-test="swift"]',
      IBAN: '[data-test="iban"]',
      CONFIRMATION_CODE: '#confirmation-code-input',
    },
  },

  BTN: {
    SUBMIT: '[data-test="submit"]',
  },
}
