export default {
  INPUT: {
    TITLE: '[data-test="input-title"]',
    FIXED_PRICE: '[data-test="input-fixed-price"]',
    NAME_ID: '[data-test="input-name-id"]',
    UNDERPAID_COVER: '[data-test="input-underpaid-cover"]',

    SLIDER: {
      MIN: '[data-test="input-slider-price-min"]',
      MAX: '[data-test="input-slider-price-max"]',
      STEP: '[data-test="input-slider-price-step"]',
    },
  },

  BTN: {
    NEW: '[data-test="button-new-payment-button"]',
    FIXED: '[data-test="button-kind-fixed_price"]',
    SLIDER: '[data-test="button-kind-slider"]',
    DYNAMIC: '[data-test="button-kind-dynamic_price"]',
    HIDE_ADVANCED_OPTIONS: '[data-test="button-hide-advanced-options"]',
    CREATE: '[data-test="button-create-button"]',
    SUBMIT_EDIT: '[data-test="button-update-button"]',
    BUTTON_PAGE_OPTION: '.anticon-link',
    EDIT_OPTION: '.anticon-edit',
    ENABLE_OPTION: '.anticon-unlock',
    DISABLE_OPTION: '.anticon-lock',
    DELETE_OPTION: '.anticon-delete',
  },

  DROPDOWN: {
    INTEGRATION_URL: '[data-test="select-integration-url"]',
    PRICE_CURRENCY: '[data-test="select-price-currency"]',
    INVOICE_TIME: '[data-test="select-invoice-time"]',
  },

  SWITCH_CONTAINER: '[data-test="switch-head-title"]',

  PANEL: {
    PANEL: '.panel',
    BODY: '.panel-body',
  },

  MOBILE: {
    BTN: {
      OPTIONS: '[data-test="button-options"]',
      BUTTON_PAGE_OPTION: '[data-test="option-button page"]',
      EDIT_OPTION: '[data-test="option-edit"]',
      ENABLE_OPTION: '[data-test="option-enable"]',
      DISABLE_OPTION: '[data-test="option-disable"]',
      DELETE_OPTION: '[data-test="option-delete"]',
    },
  },
}
