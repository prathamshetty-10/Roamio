import mongoose from "mongoose";

const requestsSchema = new mongoose.Schema({
    to:{
        type:String
    },
    from:{
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

export default  mongoose.model("Requests", requestsSchema);