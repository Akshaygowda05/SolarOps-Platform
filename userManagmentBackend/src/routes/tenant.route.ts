import express from 'express';
import { ApplicationContext } from '../middlewares/applicationContext';
import tenantController from '../controllers/tenant.controller';
const tenantRoutes = express.Router();


tenantRoutes.get('/admin/tenant',ApplicationContext,tenantController.getTenants)

export default tenantRoutes;