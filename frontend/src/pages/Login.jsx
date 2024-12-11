import { loginRoute } from "../utils/APIRoutes";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";

export default function Login() {
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  function handleUserInput(e) {
    const { name, value } = e.target;
    setLoginData({
      ...loginData,
      [name]: value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!loginData.password || !loginData.username) {
      toast.error("Please fill all details");
      return;
    }
    const { data } = await axios.post(loginRoute, loginData);

    if (data.status === false) {
      toast.error(data.msg);
    }
    if (data.status === true) {
      localStorage.setItem("login-user", JSON.stringify(data.user));
      toast.success("Successful login");
      navigate("/home");
      setLoginData({
        username: "",
        password: "",
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
        className="bg-[#00000045] flex flex-col rounded-3xl px-[4rem] pt-[2.5rem] pb-[2rem] shadow-[0_0_5px_gray] gap-2"
      >
        <div className="flex items-center justify-center">
          <h1 className="font-bold text-4xl text-[#7a1919]">Roamio</h1>
        </div>
        <input
          type="text"
          placeholder="Enter Username"
          name="username"
          value={loginData.username}
          onChange={handleUserInput}
          className="bg-transparent p-[1rem] border-[0.1rem] border-[#6f1420] rounded-2xl font-[1rem] text-[#ffffff] w-[100%] my-[1rem]"
        />
        <input
          type="password"
          placeholder="Enter Password"
          name="password"
          value={loginData.password}
          onChange={handleUserInput}
          className="bg-transparent p-[1rem] border-[0.1rem] border-[#6f1420] rounded-2xl font-[2rem] text-[#ffffff] w-[100%] mb-[1rem]"
        />
        <button
          type="submit"
          className="bg-[#651225] hover:bg-[#ebe7ff] text-white hover:text-[#651225] p-[1rem]  rounded-2xl font-[1rem] w-[100%] mb-[0.5rem]"
        >
          Login
        </button>
        <span className="text-[#ebebeb] mx-[1rem] text-lg">
          Don't have an account?{" "}
          <Link to="/register" className="text-[#00bcd4] hover:text-[#4e0eff]">
            Register
          </Link>
        </span>
      </form>
    </div>
  );
}
