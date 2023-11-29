import URL_MASTER from "../config";
import pingApi from "../api/ping";
import retrieveOrRegisterDevice from "../api/register.device";
import agentLoop from "./loop.agent";
import logger from "../logger";

const startAgent = async () => {

  if (!URL_MASTER) {
    logger.error("[AGENT] startAgent - No URL_MASTER env");
    throw new Error("[AGENT] startAgent - NO URL_MASTER env")
  }
  // PING API
  await pingApi();
  // REGISTER OR RETRIEVE "HOST ID"
  const hostId = await retrieveOrRegisterDevice();

  logger.info(`[AGENT] startAgent ----> Host id is ${hostId}`);
  if (hostId) {
    logger.info(`[AGENT] startAgent -----> Starting Agent Loop`);
    agentLoop(hostId);
  } else {
    throw new Error("Internal error, hostid not set")
  }
}

export default startAgent;
