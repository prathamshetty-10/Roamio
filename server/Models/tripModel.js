import mongoose from "mongoose";

const tripSchema = new mongoose.Schema({
  tripName: {
    type: String,
  },
  location:{
    type:String
  },
  avatar:{
        public_id:{
            type:String
        },
        secure_url:{
            type:String
        }
    },
  dateRange: {
    from: {
      type: Date,
    },
    to: {
      type: Date,
    },
  },
  admin:{
    username:{
        type:String
    }
  },
  members: [
    {
      username: {
        type: String,
        required: true,
      },
      
    },
  ],
  description: {
    type: String,
    default: "",
  },
  budget: {
    type: Number,
    default: 0,
  },
  
});

export default mongoose.model("Trip", tripSchema);
