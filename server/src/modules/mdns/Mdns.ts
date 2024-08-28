import axios from 'axios';
import logger from '../../logger';

export async function discoverServers() {
  const response = await axios.post('http://discovery:3000/discover', { subnet: '192.168.0.1/24' });
  logger.error(response);
}
