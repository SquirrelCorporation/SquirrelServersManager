import sendDeviceInfoToApi from "../api/device.info";
import retry from 'retry';
import hardwareUtils from '../utils/hardware-utils'

const operation = retry.operation({
  forever: true,
  factor: 3,
  minTimeout: 1 * 1000,
  maxTimeout: 60 * 1000,
  randomize: true,
});
let numAttempt = 0

const agentLoop = async (hostId: string) => {
  async function attempt(hostId: string) {
    return new Promise((resolve, reject) => {
      operation.attempt(async function (currentAttempt) {
        console.log(`Sending info to master node...`);
        console.log('Attempt #:', numAttempt)
        console.log(await hardwareUtils.hardware.CPUModel);
        try {
          await sendDeviceInfoToApi(hostId);
          numAttempt = 0;
        } catch (error: any) {
          console.log("error!s")
          if (operation.retry(error)) {
            numAttempt++
            return
          }
          reject(operation.mainError())
        }
        setTimeout(() => {
          agentLoop(hostId);
        }, 30000)
      });
    });
  }
  await attempt(hostId);
}
export default agentLoop;
