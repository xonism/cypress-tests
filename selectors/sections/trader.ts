export default {
  BUY: {
    INPUT: {
      PAY_AMOUNT: '[data-test="pay-amount"]',
      RECEIVE_AMOUNT: '[data-test="receive-amount"]',

      COPY: {
        COMPANY_NAME: '[data-test="copy-field-Company Name"]',
        BANK_NAME: '[data-test="copy-field-Bank Name"]',
        BANK_CODE: '[data-test="copy-field-Bank Code"]',
        IBAN: '[data-test="copy-field-IBAN"]',
        AMOUNT: '[data-test="copy-field-Amount"]',
        REASON: '[data-test="copy-field-Reason for payment"]',
      },
    },

    BTN: {
      SUBMIT_BUY: '[data-test="submit-buy"]',
      REPEAT_ORDER: '#redo-order-button',
      SEPA: '[data-test="payment-method-sepa"]',
      MOONPAY: '[data-test="payment-method-moonpay"]',
      EASY_BANK_TRANSFER: '[data-test="payment-method-token_io"]',
    },

    DROPDOWN: {
      SELL_CURRENCY: '[data-test="buy-sell-currency"]',
      RECEIVE_CURRENCY: '[data-test="buy-receive-currency"]',
    }
  },

  SELL: {
    INPUT: {
      SELL_AMOUNT: '[data-test="sell-amount"]',
      RECEIVE_AMOUNT: '[data-test="sell-receive-amount"]',
    },

    DROPDOWN: {
      SELL_CURRENCY: '[data-test="sell-sell-currency"]',
      RECEIVE_CURRENCY: '[data-test="sell-receive-currency"]',
      PAYOUT_SETTING: '[data-test="payout-setting-select"]',
    },

    BTN: {
      SUBMIT_SELL: '[data-test="submit-sell"]',
      ADD_PAYOUT_SETTING: '[data-test="add-payout-setting"]',
    },
  },

  EXCHANGE: {
    INPUT: {
      SELL_AMOUNT: '[data-test="swap-sell-amount"]',
      RECEIVE_AMOUNT: '[data-test="swap-receive-amount"]',
    },

    DROPDOWN: {
      SELL_CURRENCY: '[data-test="swap-sell-currency"]',
      RECEIVE_CURRENCY: '[data-test="swap-receive-currency"]',
    },

    BTN: {
      SUBMIT_EXCHANGE: '[data-test="submit-swap"]',
    },
  },

  MOBILE: {
    BUY: {
      DROPDOWN: {
        PAYMENT_METHOD: '[data-test="mobile-payment-method-select"]',
        SELL_CURRENCY: '[data-test="mobile-buy-sell-currency"]',
        RECEIVE_CURRENCY: '[data-test="mobile-buy-receive-currency"]',
      },
    },

    SELL: {
      DROPDOWN: {
        SELL_CURRENCY: '[data-test="mobile-sell-sell-currency"]',
        RECEIVE_CURRENCY: '[data-test="mobile-sell-receive-currency"]',
        PAYOUT_SETTING: '[data-test="mobile-payout-setting-select"]',
      },
    },

    EXCHANGE: {
      DROPDOWN: {
        SELL_CURRENCY: '[data-test="mobile-swap-sell-currency"]',
        RECEIVE_CURRENCY: '[data-test="mobile-swap-receive-currency"]',
      },
    },

    BTN: {
      ORDER_INFO: '[data-test="order-information-button"]',
      ACCOUNT_LIMITS: '[data-test="mobile-account-limit-button"]',
    },

    DIV: {
      ORDER_DETAILS: '.order-details-mobile',
      CUSTOM_DETAILS: '.custom-details',
      ORDER_PREVIEW: '.order-preview',
      TRADER_LIMITS: '#trader-limits',
    },
  },

  DROPDOWN: {
    COUNTRY: '[data-test="options-country"]',
  },

  BTN: {
    BUY: '[data-test="method-buy"]',
    SELL: '[data-test="method-sell"]',
    EXCHANGE: '[data-test="method-swap"]',
    REDO_ORDER: '#redo-order-button',
  },

  CHECKBOX: {
    AUTO_REDEEM: '[data-test="auto-redeem-checkbox"]',
  },

  DIV: {
    UNVERIFIED_DISCLAIMER: '[data-test="non-verified-disclaimer"]',
    LIMIT_TEXT: '.limit-text',
    ALTERNATIVE_METHODS: '#alternative-methods',
    PAYMENT_METHODS: '.payment-methods',
    LIMITS_PANEL: '#limits-panel',
  },

  BOLD: '.bold',
  TOTAL_PAY: '.total-pay',
}
