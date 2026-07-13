import express from 'express';
import logger from '../config/logger';
import { syncAllTenant } from '../services/syncTenant.services';

import rateLimit from "express-rate-limit";
import { ApplicationContext } from '../middlewares/applicationContext';
import authenticate from '../middlewares/auth.middlware';

const syncallRouter = express.Router();


const syncLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1, // Only 1 request per IP per hour
  message: "Sync already triggered. Try again later.",
});



syncallRouter.get('/syncAll', syncLimiter,authenticate,ApplicationContext,async (req, res) => {
    try{

        await syncAllTenant();
        res.status(200).json({ message: "Sync All Completed" });



    }catch(error:any){
        logger.info("Error in syncAll route: ", error);

    }

})