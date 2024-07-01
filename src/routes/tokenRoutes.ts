import { Router } from 'express'
import { index } from '../controllers/tokenController';

const router = Router();

router.get('/', index);

export default router