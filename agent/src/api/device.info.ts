import getDeviceInfo from "../utils/os-utils";
import axios from "axios";
import URL_MASTER from "../config";

const sendDeviceInfoToApi = async (hostId: string) => {
  await getDeviceInfo(hostId).then(async (deviceInfo) => {
    await axios.post(`${URL_MASTER}/api/devices/${hostId}`, deviceInfo)
      .then(async response => {
        console.log(response.data);

      })
      .catch(error => {
        //console.error(error);
        throw new Error(`Master node connection failed`);
      });
  });
}

export default sendDeviceInfoToApi;
