import express from 'express';
import ansible from '../../shell/ansible'
const router = express.Router();

router.get(`/`, async (req, res) => {
  res.send({
    success: true,
    data: {
      message: 'Hello!',
    }
  })
});

export  default router;
