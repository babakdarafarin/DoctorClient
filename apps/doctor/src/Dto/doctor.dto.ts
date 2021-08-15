export class DoctorDto{
    public id : string
    public firstname : string
    public lastname : string
    public professions : string[]
    public about : string
    public gender : number
    public language : number[]
    public visit : [{visitType: number, cost: number}]
}