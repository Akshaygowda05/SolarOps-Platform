import { NextFunction,Request,Response } from "express";
import tenantService from "../services/tenant.service";
// this i need to to get all the controller service
class tenantController {
// here i have only one function to get all the tenants


async getTenants(req: Request, res: Response, next: NextFunction) {
    try{

       const tenants = await tenantService.getTenants();
       res.status(200).json({ tenants });
    }catch(error){
        next(error);
}
}
}

export default new tenantController();
