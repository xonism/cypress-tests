export default {
  HEADER_MENU: '[data-test="account-header-menu"]',
  HEADER_SUBMENU: '.account-header-menu',
  TYPE: '.account-type',
  CURRENT_ACCOUNT: '.current-account',

  DIV: {
    ACCOUNT_ITEM: '.account-item',
  },

  BTN: {
    SIGN_OUT: '[data-test="sign-out-button"]',
  },

  BUSINESS: {
    INPUT: {
      TITLE: '[name="business[title]"]',
      EMAIL: '[name="business[email]"]',
      WEBSITE: '[name="business[verification_attributes][business_details_attributes][website]"]',
    },

    CHECKBOX: {
      TERMS: '[data-test="agree-to-terms"]',
    },

    BTN: {
      CREATE_BUSINESS_ACCOUNT: '[data-test="create-a-business-account"]',
    }
  },

  CONFIRM_EMAIL: {
    TITLE: '.confirm-email__title',
    NOTICE: '.confirm-email__notice',

    BTN: {
      CONTINUE: '.dashboard-button',
    },
  },
}
