import express from 'express';
import applicationController from '../controllers/application.controller';


const router = express.Router();
router.get('/admin/application', applicationController.getApplicationController);

export default router;