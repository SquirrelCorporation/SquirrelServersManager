import axios, {AxiosError} from "axios";
import URL_MASTER from "../config";
import logger from "../logger";

const pingApi = async () => {
    logger.info(`[AGENT] pingApi - Ping to -> ${URL_MASTER}/api/ping`)
  axios.get(`${URL_MASTER}/api/ping`)
    .then(response => {
      logger.info("[AGENT] pingApi - Success");
      logger.debug(response.data);
    })
    .catch((error: AxiosError) => {
      logger.error(error);
      throw new Error(`Master node connection failed, please check that master node URL \"${URL_MASTER}\" is correct`)
    });
}

export default pingApi;
