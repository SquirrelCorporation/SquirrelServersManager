import getDeviceInfo from "../utils/os.informations";
import axios from "axios";
import URL_MASTER from "../config";
import logger from "../logger";

const sendDeviceInfoToApi = async (hostId: string) => {
  await getDeviceInfo(hostId).then(async (deviceInfo) => {
    await axios.post(`${URL_MASTER}/api/devices/${hostId}`, deviceInfo)
      .then(async response => {
        logger.info("[AGENT] sendDeviceInfoToApi - Success");
        logger.debug(response.data);
      })
      .catch(error => {
        logger.error("[AGENT] sendDeviceInfoToApi - Error - " + error.message);
        throw new Error(`[AGENT] sendDeviceInfoToApi - Master node connection failed`);
      });
  });
}

export default sendDeviceInfoToApi;
