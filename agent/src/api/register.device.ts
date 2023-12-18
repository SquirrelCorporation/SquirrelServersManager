import fs from "fs";
import axios from "axios";
import URL_MASTER from "../config";
import logger from "../logger";
import osu from "node-os-utils";

const retrieveOrRegisterDevice = async () => {
  let hostId;
  if (!fs.existsSync("hostid.txt")) {
  await axios.post(`${URL_MASTER}/api/devices`, { ip:osu.os.ip() })
    .then(async response => {
      logger.info(response.data);
      logger.info(`[AGENT] retrieveOrRegisterDevice - Registering id ${response.data.data.id}`);
      fs.writeFile('hostid.txt', response.data.data.id, function (err) {
        if (err) throw err;
        logger.info('[AGENT] retrieveOrRegisterDevice - File is created successfully.');
      });
      hostId = response.data.data.id;
    })
    .catch(error => {
        logger.error(error);
        throw new Error(`[AGENT] retrieveOrRegisterDevice - Registering to Master node failed\n- Message: ${error.message}\n- Response: ${JSON.stringify(error.response.data)}`)
    });
} else {
      logger.info('[AGENT] retrieveOrRegisterDevice - Reading host id from file');
    let fileData = fs.readFileSync('hostid.txt',
      {encoding: 'utf8', flag: 'r'});
    if (fileData) {
      hostId = fileData;
    }
  }
  return hostId;
}

export default retrieveOrRegisterDevice;
