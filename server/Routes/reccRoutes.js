import {
    getRecommendations,
    getMore
  } from "../Controllers/reccController.js";
  import express from 'express'

  const router = express.Router();
  
  router.post("/recommendations",getRecommendations);
  router.get("/more-recommendations/:city",getMore);



  export default router;