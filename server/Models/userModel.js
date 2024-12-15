import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    
    unique: true,
  },
  trips: [
  {
    tripName: {
      type: String,
    },
  },
  ],

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
    },
});

export default  mongoose.model("Users", userSchema);