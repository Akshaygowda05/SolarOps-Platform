import express from "express";
import UserController from "../controllers/user.controller";
import authenticate from "../middlewares/auth.middlware";

const userRoutes = express.Router();


userRoutes.post('/v1/users/create',UserController.createUser); // it is used
userRoutes.delete('/v1/users/:id',authenticate,UserController.deleteUser);
userRoutes.put('/v1/users/:id',UserController.updateUser);
userRoutes.post('/v1/user/login',UserController.userlogin); // it is also used 
userRoutes.put('/v1/users/password/:id',UserController.updateUserPassword);
userRoutes.get('/v1/users',UserController.getAllUsers); // it is used
userRoutes.get('/v1/users/:id',UserController.getUserById); // it is used
userRoutes.delete('/v1/users/delete/:id',authenticate,UserController.deleteUserProfile); // it is used to delete permanently user profile


export default userRoutes;