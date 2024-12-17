
import {
    getTrips,
    addTrips,
    removeTrips,
    editTrips,
    leaveTrips,
    editmembers
  } from "../Controllers/tripController.js";
  import {upload} from '../middleware/multer.middleware.js'
  import express from 'express'

  const router = express.Router();
  
  router.post("/getTrips", getTrips);
  router.post("/addTrips",upload.single('avatar'), addTrips);  
  router.post("/removeTrips", removeTrips);
  router.post("/editTrips", editTrips);
  router.post("/editMembers", editmembers);
  router.post("/leaveTrips", leaveTrips);
  export default router;