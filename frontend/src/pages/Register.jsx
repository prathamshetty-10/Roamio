import React, { useState, useEffect } from "react";
import { BsPersonCircle } from "react-icons/bs";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { registerRoute } from "../utils/APIRoutes.js";
import axios from "axios";

export default function Register() {
  const navigate = useNavigate();
  const [previewImage, setPreviewImage] = useState("");
  const [signupData, setSignupData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    avatar: "",
  });

  function handleUserInput(e) {
    const { name, value } = e.target;
    setSignupData({
      ...signupData,
      [name]: value,
    });
  }

  function getImage(e) {
    e.preventDefault();
    const uploadedImage = e.target.files[0];
    if (uploadedImage) {
      setSignupData({
        ...signupData,
        avatar: uploadedImage,
      });
      const fileReader = new FileReader();
      fileReader.readAsDataURL(uploadedImage);
      fileReader.addEventListener("load", function () {
        setPreviewImage(this.result);
      });
    }
  }

  useEffect(() => {
    console.log(signupData);
  }, [signupData]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!signupData.email || !signupData.password || !signupData.username || !signupData.confirmPassword || !signupData.avatar) {
      toast.error("Please fill all details");
      return;
    }
    if (signupData.password !== signupData.confirmPassword) {
      toast.error("Password does not match");
      return;
    }
    if (signupData.username.length < 3) {
      toast.error("Name should be at least 3 characters");
      return;
    }
    if (!signupData.email.match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
      toast.error("Invalid email ID");
      return;
    }
    if (!signupData.password.match(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/)) {
      toast.error("Password must be 6-16 characters long with at least one number and one special character");
      return;
    }

    const formData = new FormData();
    formData.append("username", signupData.username);
    formData.append("email", signupData.email);
    formData.append("password", signupData.password);
    formData.append("confirmPassword", signupData.confirmPassword);
    formData.append("avatar", signupData.avatar);

    const { data } = await axios.post(registerRoute, formData);

    if (data.status === false) {
      toast.error(data.msg);
    }
    if (data.status === true) {
      localStorage.setItem("login-user", JSON.stringify(data.user));
      toast.success("Successful registration");
      navigate("/home");
      setSignupData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        avatar: "",
      });
    }
  }

  useEffect(() => {
    if (localStorage.getItem("login-user")) {
      navigate("/home");
    }
  }, []);

  return (
    <div className="h-[100vh] w-[100vw] bg-[url('./assets/bg.jpg')] bg-cover bg-center bg-fixed flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-[#00000058] flex flex-col rounded-3xl px-[4rem] pt-[1.5rem] pb-[2rem] shadow-[0_0_5px_gray]"
      >
        <div className="flex items-center justify-center pb-5">
          <h1 className="font-bold text-4xl text-[#7a1919]">Roamio</h1>
        </div>
        <label htmlFor="image_uploads" className="cursor-pointer">
          {previewImage ? (
            <img className="w-24 h-24 rounded-full m-auto" src={previewImage} />
          ) : (
            <BsPersonCircle className="w-24 h-24 rounded-full m-auto text-[#ebebeb]" />
          )}
        </label>
        <input
          onChange={getImage}
          className="hidden"
          type="file"
          id="image_uploads"
          accept=".jpg,.jpeg,.png,.svg"
        />
        <div className="flex items-center justify-center mt-[10px]">
          <p className="text-[#ebebeb]">Click to upload profile</p>
        </div>
        <input
          type="text"
          placeholder="Enter Username"
          name="username"
          value={signupData.username}
          onChange={handleUserInput}
          className="bg-transparent p-[1rem] border-[0.1rem] border-[#6f1420] rounded-2xl font-[1rem] text-[#ffffff] w-[100%] my-[1rem]"
        />
        <input
          type="email"
          placeholder="Enter Email"
          name="email"
          value={signupData.email}
          onChange={handleUserInput}
          className="bg-transparent p-[1rem] border-[0.1rem] border-[#6f1420] rounded-2xl font-[1rem] text-[#ffffff] w-[100%] mb-[1rem]"
        />
        <input
          type="password"
          placeholder="Enter password"
          name="password"
          value={signupData.password}
          onChange={handleUserInput}
          className="bg-transparent p-[1rem] border-[0.1rem] border-[#6f1420] rounded-2xl font-[1rem] text-[#ffffff] w-[100%] mb-[1rem]"
        />
        <input
          type="password"
          placeholder="Confirm password"
          name="confirmPassword"
          value={signupData.confirmPassword}
          onChange={handleUserInput}
          className="bg-transparent p-[1rem] border-[0.1rem] border-[#6f1420] rounded-2xl font-[1rem] text-[#ffffff] w-[100%] mb-[1.5rem]"
        />
        <button
          type="submit"
          className="bg-[#651225] hover:bg-[#ebe7ff] text-white hover:text-[#651225] p-[1rem] rounded-2xl font-[1rem] w-[100%] mb-[0.5rem]"
        >
          Register
        </button>
        <span className="text-[#ebebeb] mx-[1rem] text-lg">
          Already have an account? <Link to="/" className="text-[#00bcd4] hover:text-[#4e0eff]">Login</Link>
        </span>
      </form>
    </div>
  );
}

