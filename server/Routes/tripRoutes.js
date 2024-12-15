
import {
    getTrips,
    addTrips,
    removeTrips
  } from "../Controllers/tripController.js";
  import {upload} from '../middleware/multer.middleware.js'
  import express from 'express'

  const router = express.Router();
  
  router.post("/getTrips", getTrips);
  router.post("/addTrips",upload.single('avatar'), addTrips);  
  router.post("/removeTrips", removeTrips);
  export default router;