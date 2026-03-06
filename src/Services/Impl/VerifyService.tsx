import type { verifyPassanger, verifyResponse } from "../Interfaces/Verify";

const API_URL = "https://aeroid-be.onrender.com/api";

const verify = {
  verifySerice: async (resp: verifyPassanger): Promise<verifyResponse> => {
    try {
      const formData = new FormData();
      formData.append("qrData", resp.qrData);
      formData.append("livePhoto", resp.livePhoto);
      const response: Response = await fetch(`${API_URL}/verify`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Sorry an error ocurred");
      }
      const data: verifyResponse = await response.json();
      return data;
    } catch (e) {
      console.log(e);
      throw new Error("The error is" + e);
    }
  },
};

export default verify;
