import express from 'express';
import { getPing } from '../services/rest/ping/ping';

const router = express.Router();

router.get(`/`, getPing);

export default router;
