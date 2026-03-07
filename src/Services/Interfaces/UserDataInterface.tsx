export interface LoginCall {
    name:string;
    flight:string;
}
export interface LoginResponse {
    success:boolean
    message:string;
    passengerName:string;
    flightId:string;
    departure:string;
    arrival:string;
    flightDate:string;
    boardingHour:string;
    gate:string;
    seat:string;
    flightTime:string;
}