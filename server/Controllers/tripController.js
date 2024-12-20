import User from "../Models/userModel.js"; // Import the User model
import Trip from "../Models/tripModel.js"; // Import the Trip model
import Photos from "../Models/photosModel.js"
import cloudinary from 'cloudinary'
import fs from "fs/promises"
import archiver from 'archiver';
import axios from 'axios';
export const getTrips = async (req, res, next) => {
  try {
    const { username } = req.body;

    // Find the user document based on the username and retrieve their trips array
    const user = await User.findOne({ username:username });

    if (!user) {
      return res.json({ msg: "User not found", status: false });
    }

    const tripNames = user.trips;


    if (!tripNames || tripNames.length === 0) {
      return res.json({ msg: "No trips found", status: false });
    }

   
    const trips = await Trip.find({ tripName: { $in: tripNames } });//where tripName matches any name in tripNames array

    return res.json({ status: true, data: trips });
  } catch (ex) {
    console.error(ex);
    next(ex);
  }
};
export const addTrips = async (req, res, next) => {
  try {
    const {
      username,
      tripName,
      dateRange,
      members,
      description,
      budget,
      location
    } = req.body;
    
    // Validate the required fields
    if (!username || !tripName || !dateRange || !members || !location) {
      return res.json({ msg: "Missing required fields", status: false });
    }

    // Check if a trip with the same name already exists
    const existingTrip = await Trip.findOne({ tripName: tripName });
    if (existingTrip) {
      return res.json({ msg: "Trip with this name already exists", status: false });
    }

    let publicId = '';
    let secure_url = '';
    
    // Handle file upload if provided
    if (req.file) {
      const options = {
        folder: `${username}`,
        use_filename: true,
        unique_filename: false,
        overwrite: false,
      };
      const result = await cloudinary.v2.uploader.upload(req.file.path, options);
      if (result) {
        publicId = result.public_id;
        secure_url = result.secure_url;
        fs.rm(`uploads/${req.file.filename}`);
      } else {
        return res.status(500).json({
          success: false,
          message: "No cloudinary result",
        });
      }
    } else {
      return res.status(500).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Parse members from the request body
    let parsedMembers = JSON.parse(members);
    let pdateRange=JSON.parse(dateRange);
    // Create a new trip
    const newTrip = await Trip.create({
      tripName: tripName,
      dateRange: {
        from: pdateRange.from,
        to: pdateRange.to,
      },
      admin: {
        username: username,
      },
      members: parsedMembers, // Add parsed members
      description: description || "",
      budget: budget || 0,
      avatar: {
        public_id: publicId,
        secure_url: secure_url,
      },
      location: location,
    });

    // Update each user with the new trip name
    for (const member of parsedMembers) {
      await User.updateOne(
        { username: member.username }, // Find the user by username
        { $push: { trips: newTrip.tripName  } } // Add the trip name to the trips field
      );
    }

    // Return the success response
    return res.json({ status: true, data: newTrip });
  } catch (ex) {
    console.error(ex);
    next(ex);
  }
};
export const removeTrips = async (req, res, next) => {
  try {
    const { tripName } = req.body;

    if (!tripName) {
      return res.json({ msg: "Trip name is required", status: false });
    }
    const trip = await Trip.findOne({ tripName });

    if (!trip) {
      return res.json({ msg: "Trip not found", status: false });
    }
    const memberUsernames = trip.members.map(member => member.username);

    if (memberUsernames.length > 0) {
      await User.updateMany(
        { username: { $in: memberUsernames } }, 
        { $pull: { trips: tripName } }  
      );
    }
    await Trip.deleteOne({ tripName });

    return res.json({ msg: "Trip successfully removed", status: true });
  } catch (ex) {
    console.error(ex);
    next(ex);
  }
};
export const editTrips = async (req, res, next) => {
  try {
    const {
      oldtripName,
      newtripName,
      dateRange,
      description,
      budget,
      location
    } = req.body;

    if (!oldtripName || !newtripName || !dateRange || !location) {
      return res.json({ msg: "Missing required fields", status: false });
    }

    if (newtripName !== oldtripName) {
      const existingTrip = await Trip.findOne({ tripName: newtripName });
      if (existingTrip) {
        return res.json({ msg: "Trip with this new name already exists", status: false });
      }
    }

    const trip = await Trip.findOne({ tripName: oldtripName });
    if (!trip) {
      return res.json({ msg: "Old trip not found", status: false });
    }

    const updatedTripData = {};
    const parsedDateRange = JSON.parse(dateRange);

    updatedTripData.dateRange = {
      from: parsedDateRange.from,
      to: parsedDateRange.to,
    };
    updatedTripData.description = description || "";
    updatedTripData.budget = budget || 0;
    updatedTripData.location = location;
    updatedTripData.tripName = newtripName;

    // Update the Trip document
    const updatedTrip = await Trip.findOneAndUpdate(
      { tripName: oldtripName },
      { $set: updatedTripData },
      { new: true } // Return the updated trip
    );

    // If the trip name was changed, update each user's trip name
    if (newtripName !== oldtripName) {
      await User.updateMany(
        { username: { $in: trip.members.map(member => member.username) } }, // Update all users in the trip
        { 
          $pull: { trips: oldtripName },  // Remove the old trip name
           // Add the new trip name
        }
      );
      await User.updateMany(
        { username: { $in: trip.members.map(member => member.username) } }, // Update all users in the trip
        { 
          // Remove the old trip name
          $push: { trips: newtripName }   // Add the new trip name
        }
      );
      
    }

    return res.json({ status: true, data: updatedTrip });

  } catch (ex) {
    console.error(ex);
    next(ex);
  }
};
export const leaveTrips = async (req, res, next) => {
  try {
    const { tripName, username } = req.body;

    if (!tripName || !username) {
      return res.json({ msg: "Trip name and username are required", status: false });
    }
    const trip = await Trip.findOne({ tripName });
    if (!trip) {
      return res.json({ msg: "Trip not found", status: false });
    }
    await User.updateOne(
      { username },
      { $pull: { trips: tripName } }
    );
    await Trip.updateOne(
      { tripName },
      { $pull: { members: { username } } }
    );
    

    return res.json({ msg: "Successfully left the trip", status: true });
  } catch (ex) {
    console.error(ex);
    next(ex);
  }
};
export const editmembers = async (req, res, next) => {
  try {
    const {
      tripName,
      Removedmembers,
      members,
    } = req.body;

    const trip = await Trip.findOne({ tripName });
    if (!trip) {
      return res.json({ msg: "Old trip not found", status: false });
    }

    const nmembers = JSON.parse(members);
    let updatedMembers = [...nmembers];

    // Remove tripName from removed users' trips array
    if (Removedmembers && Removedmembers.length > 0) {
      const parsedRemovedMembers = JSON.parse(Removedmembers);
      for (const removedMember of parsedRemovedMembers) {
        await User.updateOne(
          { username: removedMember.username },
          { $pull: { trips: tripName } }
        );
      }
    }

    // Update members in the Trip document
    await Trip.updateOne(
      { tripName },
      { $set: { members: updatedMembers } }
    );

    // Add tripName to updatedMembers' trips array
    for (const member of updatedMembers) {
      await User.updateOne(
        { username: member.username },
        { $addToSet: { trips: tripName } } // Ensures no duplicate entries
      );
    }

    const updatedTrip = await Trip.findOne({ tripName });
    return res.json({ status: true, data: updatedTrip });

  } catch (ex) {
    console.error(ex);
    next(ex);
  }
};
export const uploadPhotos = async (req, res, next) => {
  try {
      const { tripName, owner } = req.body;
      
      if (!tripName) {
          return res.json({
              success: false,
              message: "Trip name is required"
          });
      }

      if (!req.files || req.files.length === 0) {
          return res.json({
              success: false,
              message: "No photos uploaded"
          });
      }

      // First check if trip exists to ensure folder consistency
      let photoCollection = await Photos.findOne({ tripName });
      let folderPath = tripName.toLowerCase().replace(/\s+/g, '-'); // Normalize folder name

      const uploadedPhotos = [];
      const options = {
          folder: folderPath,
          use_filename: true,
          unique_filename: true,
          overwrite: false,
      };

      // Process each photo
      for (const file of req.files) {
          try {
              const result = await cloudinary.v2.uploader.upload(file.path, options);
              if (result) {
                  uploadedPhotos.push({
                      photo: result.secure_url,
                      public_id: result.public_id,
                      owner: owner,
                      date: new Date() // Add upload date
                  });
                  
                  // Clean up local file
                  fs.rm(`${file.path}`);
              }
          } catch (uploadError) {
              console.error(`Error uploading file ${file.originalname}:`, uploadError);
          }
      }

      if (photoCollection) {
          // Add new photos to existing trip
          photoCollection.photos.push(...uploadedPhotos);
          await photoCollection.save();
      } else {
          // Create new trip with photos
          photoCollection = await Photos.create({
              tripName,
              photos: uploadedPhotos
          });
      }

      return res.json({
          status: true,
          message: `Successfully uploaded ${uploadedPhotos.length} photos to trip "${tripName}"`,
          data: photoCollection
      });

  } catch (error) {
      console.error(error);
      next(error);
  }
};

export const getPhotos = async (req, res, next) => {
    try {
        const { tripName } = req.body;

        if (!tripName) {
            return res.json({
                success: false,
                message: "Trip name is required"
            });
        }

        // Find the photo collection for the given tripName
        const photoCollection = await Photos.findOne({ tripName });

        if (!photoCollection) {
            return res.json({
                success: false,
                message: `No photos found for trip "${tripName}"`
            });
        }

        return res.json({
            success: true,
            message: `Photos retrieved for trip "${tripName}"`,
            data: photoCollection
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
};

export const deleteSinglePhoto = async (req, res, next) => {
    try {
        const { tripName, public_id } = req.body;

        if (!tripName || !public_id) {
            return res.json({
                success: false,
                message: "Trip name and photo public_id are required"
            });
        }

        // Fetch the photo collection for the given tripName
        const photoCollection = await Photos.findOne({ tripName });

        if (!photoCollection) {
            return res.json({
                success: false,
                message: `No photos found for trip "${tripName}"`
            });
        }

        // Find and remove the photo from the photos array
        const photoIndex = photoCollection.photos.findIndex(
            (photo) => photo.public_id === public_id
        );

        if (photoIndex === -1) {
            return res.json({
                success: false,
                message: "Photo not found in the trip collection"
            });
        }

        const [removedPhoto] = photoCollection.photos.splice(photoIndex, 1);

        // Delete the photo from Cloudinary
        try {
            await cloudinary.v2.uploader.destroy(removedPhoto.public_id);
        } catch (error) {
            console.error(`Error deleting photo with public_id ${removedPhoto.public_id}:`, error);
        }

        // Save the updated collection
        await photoCollection.save();

        return res.json({
            success: true,
            message: `Successfully deleted photo with public_id "${public_id}" from trip "${tripName}"`,
            data: photoCollection
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
};

export const deleteAllPhotos = async (req, res, next) => {
    try {
        const { tripName } = req.body;

        if (!tripName) {
            return res.json({
                success: false,
                message: "Trip name is required"
            });
        }

        // Fetch the photo collection for the given tripName
        const photoCollection = await Photos.findOne({ tripName });

        if (!photoCollection) {
            return res.json({
                success: false,
                message: `No photos found for trip "${tripName}"`
            });
        }

        // Delete each photo from Cloudinary
        for (const photo of photoCollection.photos) {
            try {
                await cloudinary.v2.uploader.destroy(photo.public_id);
            } catch (error) {
                console.error(`Error deleting photo with public_id ${photo.public_id}:`, error);
            }
        }

        // Delete the document from the database
        await Photos.deleteOne({ tripName });

        return res.json({
            success: true,
            message: `Successfully deleted all photos for trip "${tripName}"`
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
};

export const downloadAllPhotos = async (req, res, next) => {
  try {
      const { tripName } = req.body;

      if (!tripName) {
          return res.status(400).json({
              success: false,
              message: "Trip name is required"
          });
      }

      // Find the photo collection for the given tripName
      const photoCollection = await Photos.findOne({ tripName });

      if (!photoCollection) {
          return res.status(404).json({
              success: false,
              message: `No photos found for trip "${tripName}"`
          });
      }

      // Create a ZIP archive
      const archive = archiver('zip', {
          zlib: { level: 9 }
      });

      // Handle archive errors
      archive.on('error', (err) => {
          throw err;
      });

      // Normalize the folder name
      const normalizedTripName = tripName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const zipFileName = `${normalizedTripName}-photos.zip`;

      // Set headers for ZIP download
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${zipFileName}"`);

      // Pipe archive data to response
      archive.pipe(res);

      const errors = [];
      const successfulDownloads = [];

      // Process photos sequentially to avoid memory issues
      for (const photo of photoCollection.photos) {
          try {
              const response = await axios({
                  method: 'get',
                  url: photo.photo,
                  responseType: 'arraybuffer'  // Changed from 'stream' to 'arraybuffer'
              });

              // Ensure filename has extension
              let filename = photo.public_id.split('/').pop();
              if (!filename.toLowerCase().endsWith('.jpg')) {
                  filename += '.jpg';
              }

              // Add the photo to the archive
              archive.append(Buffer.from(response.data), {
                  name: `${normalizedTripName}/${filename}`
              });

              successfulDownloads.push(filename);
          } catch (error) {
              console.error(`Error downloading photo ${photo.public_id}:`, error);
              errors.push(photo.public_id);
          }
      }

      // Add info.txt with metadata
      const infoContent = `
Trip Name: ${tripName}
Download Date: ${new Date().toLocaleString()}
Total Photos: ${photoCollection.photos.length}
Successfully Downloaded: ${successfulDownloads.length}
Failed Downloads: ${errors.length}

Photo Details:
${photoCollection.photos.map(photo => {
  const filename = photo.public_id.split('/').pop();
  return `- ${filename}
Upload Date: ${photo.date ? photo.date.toLocaleString() : 'Date not available'}
Owner: ${photo.owner || 'Not specified'}
Status: ${errors.includes(photo.public_id) ? 'Failed to download' : 'Successfully downloaded'}`;
}).join('\n\n')}

${errors.length > 0 ? `\nFailed Downloads:\n${errors.join('\n')}` : ''}
      `.trim();

      archive.append(infoContent, { name: `${normalizedTripName}/info.txt` });

      // Finalize the archive
      await archive.finalize();

  } catch (error) {
      console.error('Server error:', error);
      // If headers haven't been sent, send error response
      if (!res.headersSent) {
          res.status(500).json({
              success: false,
              message: "Error creating zip archive",
              error: error.message
          });
      }
      next(error);
  }
};

export const downloadSinglePhoto = async (req, res, next) => {
  try {
      const { tripName, public_id } = req.body;

      if (!tripName || !public_id) {
          return res.json({
              success: false,
              message: "Trip name and photo public_id are required"
          });
      }

      // Find the photo collection and specific photo
      const photoCollection = await Photos.findOne({ tripName });

      if (!photoCollection) {
          return res.json({
              success: false,
              message: `No photos found for trip "${tripName}"`
          });
      }

      const photo = photoCollection.photos.find(p => p.public_id === public_id);

      if (!photo) {
          return res.json({
              success: false,
              message: "Photo not found in the trip collection"
          });
      }

      try {
          const response = await axios({
              method: 'get',
              url: photo.photo,
              responseType: 'arraybuffer'  // Changed from 'stream' to 'arraybuffer'
          });

          // Extract filename from public_id and ensure it has an extension
          const filename = `${public_id.split('/').pop()}.jpg`;

          // Set proper headers for file download
          res.setHeader('Content-Type', 'image/jpeg');
          res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
          res.setHeader('Content-Length', response.data.length);

          // Send the buffer directly
          return res.send(response.data);

      } catch (error) {
          console.error(`Error downloading photo ${public_id}:`, error);
          return res.json({
              success: false,
              message: "Error downloading photo",
              error: error.message
          });
      }

  } catch (error) {
      console.error('Server error:', error);
      next(error);
  }
};

