export interface ICurrency {
    Pk: string
    Sk: string
    CreateDate: string
    CurrencyData: ICurrencyData
    Flag: boolean;

    Amount: string;
    ChangePercent: string;
    RatePair: string;
    Inverse: boolean;
    Enable: boolean
}
export interface ICurrencyData{
    Rate: string
    Change: string
    Currency: string
    Value: boolean;
}