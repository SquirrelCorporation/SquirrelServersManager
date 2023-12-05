import express from 'express';
import ansible from '../../shell/ansible'
const router = express.Router();

router.get(`/`, async (req, res) => {
  await ansible.executePlaybook("ping.yml");
  res.send({
    success: true,
    data: {
      message: 'Hello!',
    }
  })
});

export  default router;
