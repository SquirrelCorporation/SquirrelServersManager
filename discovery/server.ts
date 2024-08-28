import express from 'express';
import { discoverSSHServers } from './discovery';

const app = express();
app.use(express.json());
const port = 3000;

app.post('/discover', async (req, res) => {
  const  subnet  = req.body?.subnet;
  try {
    if (!subnet) {
      return res.status(500).send('subnet empty');
    }
    const servers = await discoverSSHServers(subnet);
    res.json(servers);
  } catch (error: any) {
    res.status(500).send(error.message);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
