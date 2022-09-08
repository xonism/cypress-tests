export default {
  DETAILS: {
    BTN: {
      EDIT: '[data-test="button-edit-billing-details"]',
      MORE_DETAILS: '[data-test="button-details-more-details"]',
      LESS_DETAILS: '[data-test="button-details-less-details"]',
      REMOVE_ITEMS: '[data-test="button-details-items-remove"]',
      ADD_ITEM: '[data-test="button-details-item-add"]',
      ADD_ITEMS: '[data-test="button-details-items-add"]',
      SUBMIT_EDIT: '[data-test="button-details-edit"]',
      DELETE: '[data-test="button-delete-billing-details"]',
      NEW: '[data-test="button-new-billing-details"]',
      SUBMIT: '[data-test="button-details-submit"]',
      SEARCH: '[data-test="button-details-search"]',
    },

    SWITCH: {
      BILL_VIA_EMAIL: '[data-test="button-details-switch-send-email-bill"]',
      PAID_EMAIL_NOTIFICATION: '[data-test="button-details-switch-send-email-notification"]',
    },

    DROPDOWN: {
      PAYMENT_METHOD: '[data-test="select-details-payment-method"]',
      PRICE_CURRENCY: '[data-test="select-details-price-currency"]',
      RECEIVE_CURRENCY: '[data-test="select-details-receive-currency"]',
    },

    INPUT: {
      TITLE: '[data-test="input-details-title"]',
      CALLBACK_URL: '[data-test="input-details-callback-url"]',
      MERCHANT_ID: '[data-test="input-details-id"]',
      UNDERPAID_COVER: '[data-test="input-underpaid-cover"]',
      DESCRIPTION: '[data-test="input-details-description"]',
      AMOUNT: '[data-test="input-details-price"]',
    },

    ITEM_0: {
      INPUT: {
        DESCRIPTION: '[data-test="input-details-item-0-description"]',
        MERCHANT_ID: '[data-test="input-details-item-0-id"]',
        QUANTITY: '[data-test="input-details-item-0-quantity"]',
        PRICE: '[data-test="input-details-item-0-price"]',
      },

      BUTTON: {
        REMOVE: '[data-test="button-details-item-0-remove"]',
      },
    },
  },

  SUBSCRIBER: {
    INPUT: {
      EMAIL: '[data-test="input-subscriber-email"]',
      COMPANY_NAME: '[data-test="input-subscriber-organisation-name"]',
      FIRST_NAME: '[data-test="input-subscriber-first-name"]',
      LAST_NAME: '[data-test="input-subscriber-last-name"]',
      ADDRESS: '[data-test="input-subscriber-address"]',
      SECONDARY_ADDRESS: '[data-test="input-subscriber-address-secondary"]',
      COUNTRY: '[data-test="input-subscriber-country"]',
      CITY: '[data-test="input-subscriber-city"]',
      POSTAL_CODE: '[data-test="input-subscriber-postal-code"]',
      MERCHANT_ID: '[data-test="input-subscriber-id"]',
    },

    BTN: {
      SUBMIT: '[data-test="button-subscriber-submit"]',
      NEW: '[data-test="button-new-billing-subscriber"]',
      MORE_DETAILS: '[data-test="button-subscriber-more-details"]',
      LESS_DETAILS: '[data-test="button-subscriber-less-details"]',
      EDIT: '[data-test="button-edit-subscriber"]',
      DELETE: '[data-test="button-delete-subscriber"]',
      SUBMIT_EDIT: '[data-test="button-subscriber-edit"]',
      SEARCH: '[data-test="button-subscriber-search"]',
      SPECIFY_COMPANY_NAME: '[data-test="action-subscriber-specify-company"]',
      SPECIFY_PERSON_NAME: '[data-test="action-subscriber-specify-person"]',
      NEW_DETAILS: '[data-test="button-details-new"]',
      NEW_SUBSCRIBER: '[data-test="button-subscriber-new"]',
    },

    LINK: {
      ADD_PAYER_FIRST: '[data-test="action-subscriber-new"]',
      ADD_DETAILS_FIRST: '[data-test="action-details-new"]',
    },
  },

  SUBSCRIPTION: {
    INPUT: {
      DUE_DAYS: '[data-test="input-subscription-due-days"]',
      INSTANT_PAYMENT_URL: '[data-test="input-payment-url"]',
      MERCHANT_ID: '[name="merchant_subscription_id"]',
    },

    BTN: {
      NEW: '[data-test="button-new-billing-subscription"]',
      SUBSCRIBER_CONTINUE: '[data-test="button-subscriber-continue"]',
      DETAILS_CONTINUE: '[data-test="button-details-continue"]',
      SUBMIT: '[data-test="button-subscription-submit"]',
      ACTIVATE: '[data-test="button-subscription-activate"]',
      EDIT: '[data-test="button-edit-subscription"]',
      SUBMIT_EDIT: '[data-test="button-subscription-edit"]',
      DELETE: '[data-test="button-delete-subscription"]',
      MORE_DETAILS: '[data-test="button-subscription-more-details"]',
      LESS_DETAILS: '[data-test="button-subscription-less-details"]',
      CREATE: '[data-test="button-subscription-create"]',
      DONE: '[data-test="button-payment-done"]',
      CREATE_MORE: '[data-test="button-payment-create"]',
    },

    SWITCH: {
      SEND_BILL_VIA_EMAIL: '[data-test="button-subscription-switch-send-email-bill"]',
    }
  },

  PAYMENTS: {
    BTN: {
      PAYMENT_DETAILS: '[data-test="button-payment-details"]',
    },

    INPUT: {
      PAYMENT_URL: '[data-test="input-payment-url"]',
    },
  },
}
