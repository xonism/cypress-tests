export default {
  WITHDRAWALS: {
    INPUT: {
      WITHDRAWAL_ID: '[data-test="withdrawal-id-input"]',
      PAYOUT_SETTING: '[data-test="payout-setting-input"]',
    },

    BTN: {
      APPLY_FILTERS: '[data-test="apply-filters"]',
      WITHDRAW: '[data-test="button-withdraw"]',
    },

    DROPDOWN: {
      PAYOUT_SETTING: '[data-test="select-payout-setting"]',
    },
  },

  REFUNDS: {
    SELECT: {
      BALANCE: '[data-test="select-refund-balance"]',
      CURRENCY: '[data-test="select-refund-currency"]',
      NETWORK: '[data-test="select-refund-network"]',
    },

    INPUT: {
      AMOUNT: '[data-test="input-refund-amount"]',
      EMAIL: '[data-test="input-refund-email"]',
      ADDRESS: '[data-test="input-refund-address"]',
      REASON: '[data-test="input-refund-reason"]',
    },

    BTN: {
      SUBMIT: '[data-test="btn-submit-refund"]',
    },

    SPAN: {
      ORIGINAL_PRICE_CURRENCY: '[data-test="span-refund-original-price-currency"]',
    },

    TABLE: {
      MERCHANT_REFUNDS: '[data-test="table-merchant-refunds"]',
      SUBMITTED: '[data-test="table-submitted-refunds"]',
    },

    DIV: {
      REFUNDS: '[data-test="div-refunds"]',
    },
  },

  INPUT: {
    ORDER_ID: '[data-test="order-id-input"]',
    MERCHANT_ORDER_ID: '[data-test="merchant-order-id-input"]',
    TITLE: '[data-test="order-title-input"]',
    ADDRESS: '[data-test="address-input"]',
    WITHDRAWAL_ID: '[data-test="withdrawal-id-input"]',
  },

  BTN: {
    APPLY_FILTERS: '[data-test="apply-filters"]',
    CLEAR_FILTERS: '[data-test="clear-filters"]',
  },

  SORTABLE_CURRENCIES: {
    CARD: '.sortable-currency-card',
    GRABBER: '.sortable-currency-grabber',
    LOGO: '.sortable-currency-logo',
    TITLE: '.currency-card-currency-title',
    SWITCH: '.ant-switch-small',
    RECEIVE_CURRENCY: '.receive-currency-select',
  },
}
