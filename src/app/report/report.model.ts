export interface Report {
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
