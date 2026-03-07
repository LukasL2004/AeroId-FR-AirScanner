export interface verifyResponse {
  isMatch: boolean;
  passengerName: string;
  flight: string;
  message: string;
  distance: number;
  aiMessage: string;
}

export interface verifyPassanger {
  qrData: string;
  livePhoto: Blob;
}
