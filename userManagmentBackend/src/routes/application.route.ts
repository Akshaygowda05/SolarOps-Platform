import express from 'express';
import applicationController, { editstatusOfApplicationController } from '../controllers/application.controller';


const ApplicationRouter = express.Router();
ApplicationRouter.get('/admin/application', applicationController.getApplicationController);
ApplicationRouter.put('/admin/application/:applicationId/status',editstatusOfApplicationController);

export default ApplicationRouter; 

