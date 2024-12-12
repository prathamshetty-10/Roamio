import mongoose from "mongoose";

const friendSchema = new mongoose.Schema({
    user1:{
        type:String
    },
    user2:{
    username: {
    type: String,
    required: true,
    
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
   
  },
  password: {
    type: String,
    required: true,
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