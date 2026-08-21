// iyzipay paketi tip tanimi getirmiyor. Yalnizca kullandigimiz yuzeyi
// tanimliyoruz — tamamini yazmak yerine dar tutmak, yanlis alan gonderirsek
// derleyicinin uyarmasini saglar.
declare module 'iyzipay' {
  type Callback<T> = (err: unknown, result: T) => void

  interface IyzipayOptions {
    apiKey: string
    secretKey: string
    uri: string
  }

  class Iyzipay {
    constructor(options: IyzipayOptions)

    static LOCALE: { TR: string; EN: string }
    static CURRENCY: { TRY: string; EUR: string; USD: string; GBP: string }
    static PAYMENT_GROUP: { PRODUCT: string; LISTING: string; SUBSCRIPTION: string }
    static BASKET_ITEM_TYPE: { PHYSICAL: string; VIRTUAL: string }

    checkoutFormInitialize: {
      create<T>(request: Record<string, unknown>, cb: Callback<T>): void
    }

    checkoutForm: {
      retrieve<T>(request: Record<string, unknown>, cb: Callback<T>): void
    }
  }

  export = Iyzipay
}
