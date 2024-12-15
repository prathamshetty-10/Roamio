import User from "../Models/userModel.js"; // Import the User model
import Trip from "../Models/tripModel.js"; // Import the Trip model

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
