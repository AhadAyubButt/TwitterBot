import * as internal from "stream"

export interface INews {
    Pk: string
    Sk: string
    CreateDate: string
    NewsData: INewsData
    Flag: boolean
}

export interface INewsData{
    event: string
    date: string
    country: string
    actual: number
    previous: number
    change: number
    changePercentage: number
    estimate: number
    impact: string
}