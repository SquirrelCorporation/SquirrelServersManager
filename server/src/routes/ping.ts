import express from 'express';
import { getPing } from '../controllers/rest/ping/ping';

const router = express.Router();

router.get(`/`, getPing);

export default router;
