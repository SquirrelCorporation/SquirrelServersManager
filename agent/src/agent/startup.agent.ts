import URL_MASTER from "../config";
import pingApi from "../api/ping";
import retrieveOrRegisterDevice from "../api/register.device";
import agentLoop from "./loop.agent";
import si from 'systeminformation';

const startAgent = async () => {
  await si.system().then(data => console.log(data));
  await si.cpu().then(data => console.log(data));
  await si.osInfo().then(data => console.log(data));

return;
  if (!URL_MASTER) {
    console.error("No URL_MASTER env");
    throw new Error("NO URL_MASTER env")
  }
  // PING API
  await pingApi();
  // REGISTER OR RETRIEVE "HOST ID"
  const hostId = await retrieveOrRegisterDevice();

  console.log(`----> Host id is ${hostId}`);
  if (hostId) {
    console.log(`----> STARTING AGENT`);
    agentLoop(hostId);
  } else {
    throw new Error("Internal error, hostid not set")
  }
}

export default startAgent;
