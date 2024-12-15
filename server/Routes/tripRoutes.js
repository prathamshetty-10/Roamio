
import {
    getTrips
  } from "../Controllers/tripController.js";
  import express from 'express'

  const router = express.Router();
  
  router.post("/getTrips", getTrips);

  export default router;