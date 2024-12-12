import {
    login,
    register,
  } from "../Controllers/userController.js";
  import express from 'express'
  import { upload } from "../middleware/multer.middleware.js";

  const router = express.Router();
  
  router.post("/login", login);
  router.post("/register",upload.single('avatar'), register);  

  export default router;