import express from 'express';
import applicationController, { editstatusOfApplicationController } from '../controllers/application.controller';
import limit from 'express-rate-limit';

const limiter = limit({
    windowMs: 30 * 60 * 1000, // 30 minutes
    max: 10, 
    message: "Too many requests from this IP, please try again after 30 minutes"
})


const ApplicationRouter = express.Router();
ApplicationRouter.get('/admin/application', applicationController.getApplicationController);
ApplicationRouter.put('/admin/application/:applicationId/status', limiter, editstatusOfApplicationController);

export default ApplicationRouter; 

