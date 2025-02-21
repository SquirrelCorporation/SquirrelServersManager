import axios from 'axios';
import { prometheusConf } from '../../config';
import logger from '../../logger';

export async function prometheusServerStats() {
  const { host, baseURL, user, password } = prometheusConf;
  const auth = { username: user, password: password };

  try {
    // Get runtime information and build information
    const runtimeInfo = await axios.get(`${host}${baseURL}/status/runtimeinfo`, { auth });
    const buildInfo = await axios.get(`${host}${baseURL}/status/buildinfo`, { auth });

    // Get targets status (up/down)
    const targets = await axios.get(`${host}${baseURL}/targets`, { auth });

    // Get TSDB stats (time series database statistics)
    const tsdbStats = await axios.get(`${host}${baseURL}/status/tsdb`, { auth });

    return {
      runtime: runtimeInfo.data.data,
      build: buildInfo.data.data,
      targets: targets.data.data,
      tsdb: tsdbStats.data.data,
    };
  } catch (error) {
    logger.error(error, 'Failed to fetch Prometheus stats');
    throw error;
  }
}
