import express from 'express';

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
