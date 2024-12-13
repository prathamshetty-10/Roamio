import mongoose from "mongoose";

const friendSchema = new mongoose.Schema({
    user1:{
        type:String
    },
    user2:{
    username: {
    type: String,
  },
  email: {
    type: String,
   
  },
  password: {
    type: String,
    min: 5,
  },
  badge:{
    type:String,
  },
  avatar:{
        public_id:{
            type:String
        },
        secure_url:{
            type:String
        }
    },}
});

export default  mongoose.model("Friends", friendSchema);