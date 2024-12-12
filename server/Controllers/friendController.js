import Friend from "../Models/friendsModel.js";
import User from "../Models/userModel.js";
import Request from "../Models/requestsModel.js"

export const getFriends = async (req, res, next) => {
    try {
      const { username } = req.body;
      const friends = await Friend.find({ user1:username });
      if (!friends)
        return res.json({ msg: "No friends", status: false });
      
      return res.json({ status: true, data:friends });
    } catch (ex) {
        console.log(ex);
      next(ex);
    }
  };
export const searchFriends=async(req,res,next)=>{
    try {
        const { data } = req.body;
        const users = await User.find({ username:data});
        if (!users)
          return res.json({ msg: "No Such Users", status: false });
        
        return res.json({ status: true, data:users });
      } catch (ex) {
          console.log(ex);
        next(ex);
      }
}
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
                to,
                from
              });
        return res.json({ status: true, data:requestz });
      } catch (ex) {
          console.log(ex);
        next(ex);
      }
}
export const acceptRequest=async(req,res,next)=>{
    try {
        const { requestz ,me} = req.body;
        await Request.deleteOne(requestz);
        const friends1= await Friend.create({
            user1:requestz.to,
            user2:requestz.from
          });
        const friends2= await Friend.create({
            user1:requestz.from.username,
            user2:me
          });
        return res.json({ status: true, msg:"Now both are friends" });
      } catch (ex) {
          console.log(ex);
        next(ex);
      }
}
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