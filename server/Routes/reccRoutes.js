import {
    getRecommendations,
    
  } from "../Controllers/reccController.js";
  import express from 'express'

  const router = express.Router();
  
  router.post("/recommendations",getRecommendations);



  export default router;