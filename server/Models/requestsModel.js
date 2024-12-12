import mongoose from "mongoose";

const requestsSchema = new mongoose.Schema({
    to:{
        type:String
    },
    from:{
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

export default  mongoose.model("Requests", requestsSchema);