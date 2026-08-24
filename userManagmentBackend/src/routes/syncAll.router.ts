import express from 'express';
import logger from '../config/logger';
import { syncAllTenant } from '../services/syncTenant.services';

import rateLimit from "express-rate-limit";
import { ApplicationContext } from '../middlewares/applicationContext';
import authenticate from '../middlewares/auth.middlware';

const syncallRouter = express.Router();


const syncLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 1, 
  message: "Sync already triggered. Try again later.",
});



syncallRouter.post('/syncAll',syncLimiter, async (req, res) => {
    try{

        await syncAllTenant();
        res.status(200).json({ message: "Sync All Completed" });



    }catch(error:any){
        logger.info("Error in syncAll route: ", error);
        res.status(500).json({ message: "Error in Sync All", error: error.message });

    }

})

export default syncallRouter;