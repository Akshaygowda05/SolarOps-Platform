import express from 'express';
import applicationController from '../controllers/application.controller';


const ApplicationRouter = express.Router();
ApplicationRouter.get('/admin/application', applicationController.getApplicationController);

export default ApplicationRouter;