export interface ICurrency {
  currencyTitle: string
  currencySymbol: string
  payoutAddress: string
  payoutSettingTitle: string
  amount: number
  platform: {
    id: number
    id_name: string
    title: string
    enabled: boolean
  }
}

export interface IBusiness {
  businessTitle: string
  businessEmail: string
  businessCountryCode: string
  businessWebsite: string
}

export interface IState {
  label: string
  value: string
  merchant_supported: boolean
  trader_supported: boolean
}

export interface IStates {
  [key: string]: IState
}

export interface IBillingDetails {
  title: string
  description: string
  sendBillViaEmail: boolean
  callbackURL: string
  sendEmailPaidNotification: boolean
  detailsID: string
  underpaidCover: string
  priceCurrency: string
  receiveCurrency: string
}
