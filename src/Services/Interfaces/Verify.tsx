export interface verifyResponse {
  isMatch: boolean;
  passengerName: string;
  flight: string;
  message: string;
}

export interface verifyPassanger {
  qrData: string;
  livePhoto: Blob;
}
