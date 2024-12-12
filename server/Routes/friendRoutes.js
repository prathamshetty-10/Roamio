import {
    getFriends
  } from "../Controllers/friendController.js";
  import express from 'express'

  const router = express.Router();
  
  router.post("/getFriends", getFriends);

  export default router;