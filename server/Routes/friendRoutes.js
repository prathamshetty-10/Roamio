import {
    getFriends,
    searchFriends,
    getRequests,
    sendRequests,
    acceptRequest,
    rejectRequest,
    removeFriend
  } from "../Controllers/friendController.js";
  import express from 'express'

  const router = express.Router();
  
  router.post("/getFriends", getFriends);
  router.post("/removeFriends", removeFriend);
  router.post("/searchFriends", searchFriends);
  router.post("/getRequests", getRequests);
  router.post("/sendRequests", sendRequests);
  router.post("/acceptRequests", acceptRequest);
  router.post("/rejectRequests", rejectRequest);


  export default router;