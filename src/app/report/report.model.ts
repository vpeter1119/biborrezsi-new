export interface Report extends Record<string, any> {
    isApproved: boolean,
    cold: number,
    hot: number,
    heat: number,
    elec: number,
    isHeating: boolean,
    nr: number,
    createdAt: Date,
    updatedAt: Date
}
