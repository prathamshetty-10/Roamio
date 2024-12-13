
import { Route, Routes } from 'react-router-dom'
import './App.css'
import Register from './Pages/Register.jsx'
import Login from './Pages/Login.jsx'
import Home from './Pages/Home.jsx'
import Profile from './pages/Profile.jsx'
import Friends from './pages/Friends.jsx'
import AddFriends from './pages/AddFriends.jsx'
import Requests from './pages/Requests.jsx'
function App() {
  

  return (
    <>
    <Routes>
      <Route path="/register" element={<Register/>}></Route>
      <Route path="/" element={<Login/>}></Route>
      <Route path="/home" element={<Home/>}></Route>
      <Route path="/profile" element={<Profile/>}></Route>
      <Route path="/friends" element={<Friends/>}></Route>
      <Route path="/addFriend" element={<AddFriends/>}></Route>
      <Route path="/requests" element={<Requests/>}></Route>
    </Routes>
      
    </>
  )
}

export default App

