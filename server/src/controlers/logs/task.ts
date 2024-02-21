import express from 'express';
import AnsibleTaskRepo from '../../database/repository/AnsibleTaskRepo';
import Authentication from '../../middlewares/Authentication';

const router = express.Router();

router.get(`/tasks`, Authentication.isAuthenticated, async (req, res) => {
  const tasks = await AnsibleTaskRepo.findAll();
  res.send({
    success: true,
    data: tasks,
  });
});

export default router;
