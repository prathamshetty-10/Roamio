import Friend from "../Models/friendsModel.js";
import User from "../Models/userModel.js";
import Request from "../Models/requestsModel.js"

export const getFriends = async (req, res, next) => {
    try {
      const { username } = req.body;
      const friends = await Friend.find({ user1:username });
      if (friends.length==0)
        return res.json({ msg: "No friends", status: false });
      return res.json({ status: true, data:friends });
    } catch (ex) {
        console.log(ex);
      next(ex);
    }
  };
  export const searchFriends = async (req, res, next) => {
    try {
      const { data } = req.body;
  
      // Search for users where username starts with `data`
      const users = await User.find({ 
        username: { $regex: `^${data}`, $options: "i" } // Case-insensitive search
      });
  
      if (!users || users.length === 0) {
        return res.json({ msg: "No Such Users", status: false });
      }
  
      return res.json({ status: true, data: users });
    } catch (ex) {
      console.log(ex);
      next(ex);
    }
  };
  
  export const removeFriend = async (req, res, next) => {
    try {
      const { other, me } = req.body;
  
      // Remove friendship where user1 is the username of `other` and user2 is the object representing `me`
      const result1 = await Friend.deleteOne({
        user1: other.username,
        "user2.username": me.username
      });
  
      // Remove friendship where user1 is the username of `me` and user2 is the object representing `other`
      const result2 = await Friend.deleteOne({
        user1: me.username,
        "user2.username": other.username
      });
  
      // Check if either deletion failed and handle accordingly
      if (result1.deletedCount === 0 && result2.deletedCount === 0) {
        return res.json({ status: false, msg: "No friends were removed." });
      }
  
      return res.json({ status: true, msg: "Friend removed successfully." });
    } catch (ex) {
      console.log(ex);
      next(ex);
    }
  };
  
export const getRequests=async(req,res,next)=>{
    try {
        const { uname } = req.body;
        const requests = await Request.find({to:uname});
        if (!requests)
          return res.json({ msg: "No Requests", status: false });
        
        return res.json({ status: true, data:requests });
      } catch (ex) {
          console.log(ex);
        next(ex);
      }
}

export const sendRequests=async(req,res,next)=>{
    try {
        const { to,from } = req.body;
        const requestz = await Request.create({
                to:to,
                from:from
              });
        return res.json({ status: true, data:requestz });
      } catch (ex) {
          console.log(ex);
        next(ex);
      }
}
export const acceptRequest = async (req, res, next) => {
  try {
    const { requestz, me } = req.body;

    // Validate inputs
    if (!requestz || !me) {
      return res.status(400).json({ status: false, msg: "Invalid data provided" });
    }

    // Check if friend relationship already exists
    const existingFriend = await Friend.findOne({
      $or: [
        { user1: requestz.to, user2: requestz.from.username },
        { user1: requestz.from.username, user2: requestz.to },
      ],
    });

    if (existingFriend) {
      return res.status(400).json({ status: false, msg: "Friendship already exists" });
    }

    // Delete the friend request
    const deleteResult = await Request.deleteOne({ _id: requestz._id });

    if (deleteResult.deletedCount === 0) {
      return res.status(404).json({ status: false, msg: "Friend request not found" });
    }

    // Create the friend relationship (bi-directional)
    await Friend.create({
      user1: requestz.to,
      user2: requestz.from,
    });

    await Friend.create({
      user1: requestz.from.username,
      user2: me,
    });

    return res.json({ status: true, msg: "Now both are friends" });
  } catch (ex) {
    console.error("Error in acceptRequest:", ex);
    return res.status(500).json({ status: false, msg: "Internal server error" });
  }
};

export const rejectRequest=async(req,res,next)=>{
    try {
        const { requestz } = req.body;
        await Request.deleteOne(requestz);
        
        return res.json({ status: true, msg:"Rejected Request" });
      } catch (ex) {
          console.log(ex);
        next(ex);
      }
}