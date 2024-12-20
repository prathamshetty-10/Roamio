
import {
    getTrips,
    addTrips,
    removeTrips,
    editTrips,
    leaveTrips,
    editmembers,
    uploadPhotos,
    getPhotos,
    deleteAllPhotos,
    deleteSinglePhoto,
    downloadAllPhotos,
    downloadSinglePhoto
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
  router.post("/uploadPhotos", upload.array('photos', 20), uploadPhotos);
  router.post("/getPhotos", getPhotos);
  router.post("/deleteSingle", deleteSinglePhoto);
  router.post("/deleteAll", deleteAllPhotos);
  router.post("/downloadAll",downloadAllPhotos);
  router.post("/downloadOne",downloadSinglePhoto);
  export default router;