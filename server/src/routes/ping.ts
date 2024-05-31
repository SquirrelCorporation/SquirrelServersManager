import express from 'express';
import { getPing } from '../services/ping/ping';

const router = express.Router();

router.get(`/`, getPing);

export default router;
