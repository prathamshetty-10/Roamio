import User from "../Models/userModel.js"; // Import the User model
import Trip from "../Models/tripModel.js"; // Import the Trip model
import cloudinary from 'cloudinary'
import fs from "fs/promises"
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
    await Trip.updateOne({ tripName: oldtripName }, { $set: updatedTripData });

    // If the trip name was changed, update each user's trip name
    if (newtripName !== oldtripName) {
      for (const member of trip.members) {
        await User.updateOne(
          { username: member.username },
          { 
            $pull: { trips: oldtripName },  // Remove the old trip name
            $push: { trips: newtripName }   // Add the new trip name
          }
        );
      }
    }
    const updatedTrip = await Trip.findOne({ tripName: newtripName});
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

    

    const trip = await Trip.findOne({ tripName:tripName });
    if (!trip) {
      return res.json({ msg: "Old trip not found", status: false });
    }
    const nmembers=JSON.parse(members);
    let updatedMembers = [...nmembers]; 

    if (Removedmembers && Removedmembers.length > 0) {
      const parsedRemovedMembers = JSON.parse(Removedmembers);
      for (const removedMember of parsedRemovedMembers) {
        await User.updateOne(
          { username: removedMember.username },
          { $pull: { trips: tripName } }
        );
      }
    }
    await Trip.updateOne(
      { tripName: tripName }, 
      { $set: { members: updatedMembers } }
    );
    

    
    const updatedTrip = await Trip.findOne({ tripName: tripName});
    return res.json({ status: true, data: updatedTrip });

  } catch (ex) {
    console.error(ex);
    next(ex);
  }
};