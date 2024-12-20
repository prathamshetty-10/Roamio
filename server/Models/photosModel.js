import mongoose from "mongoose";

const photosSchema = new mongoose.Schema({
    tripName:{
        type:String
    },
    photos:[
        {
            photo:{
                type:String
            },
            public_id:{
                type:String
            },
            owner:{
                type:String
            },
            date:{
                type:Date
            }
        }
    ]
});

export default  mongoose.model("Photos", photosSchema);