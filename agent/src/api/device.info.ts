import getDeviceInfo from "../utils/os.informations";
import axios, {AxiosError} from "axios";
import URL_MASTER from "../config";
import logger from "../logger";

const sendDeviceInfoToApi = async (hostId: string) => {
    logger.info(`[AGENT] sendDeviceInfoToApi - To -> ${URL_MASTER}/api/devices/${hostId}`);
    await getDeviceInfo(hostId).then(async (deviceInfo) => {
    await axios.post(`${URL_MASTER}/api/devices/${hostId}`, deviceInfo)
      .then(async response => {
        logger.info("[AGENT] sendDeviceInfoToApi - Success");
        logger.debug(response.data);
      })
      .catch((error) => {
          logger.error(error.message);
          if (error?.response?.status === 404) {
              throw new Error(`[AGENT] sendDeviceInfoToApi - Trying to send device info without registering first try to delete the hostid.txt file first`);
          }
          throw new Error(`[AGENT] sendDeviceInfoToApi - Master node connection failed`);
      });
  });
}

export default sendDeviceInfoToApi;

