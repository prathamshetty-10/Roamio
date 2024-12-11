import User from "../Models/userModel.js";
import fs from "fs/promises"
import cloudinary from 'cloudinary'


export const login = async (req, res, next) => {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username });
      if (!user)
        return res.json({ msg: "Incorrect Username or Password", status: false });
      const isPasswordValid = (password==user.password)?true:false;
      if (!isPasswordValid)
        return res.json({ msg: "Incorrect Username or Password", status: false });
      delete user.password;
      return res.json({ status: true, user });
    } catch (ex) {
        console.log(ex);
      next(ex);
    }
  };
  export const register = async (req, res, next) => {
    try {
      const { username, email, password } = req.body;
      const usernameCheck = await User.findOne({ username });
        if (usernameCheck)
            return res.json({ msg: "Username already used", status: false });
        const emailCheck = await User.findOne({ email });
        if (emailCheck)
            return res.json({ msg: "Email already used", status: false });
        let publicId='';
        let secure_url='';
        if(req.file){
            
            const options = {
                folder:`${email}`,
                use_filename: true,
                unique_filename: false,
                overwrite: false,
              };
            const result=await cloudinary.v2.uploader.upload(req.file.path,options);
            if(result){
                publicId=result.public_id;
                secure_url=result.secure_url;
                
                fs.rm(`uploads/${req.file.filename}`);
                
            }
            else{
                return res.status(500).json({
                    success:false,
                    message:"No cloudinary result"
                })
            }

        }
    else{
        return res.status(500).json({
            success:false,
            message:"no file uploaded"
        })


    }
      const user = await User.create({
        email,
        username,
        password: password,
        avatar:{
            public_id:publicId,
            secure_url:secure_url,
        }
      });
      delete user.password;
      return res.json({ status: true, user });
    } catch (ex) {
        console.log(ex);
      next(ex);
    }
  };
