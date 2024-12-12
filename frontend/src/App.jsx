
import { Route, Routes } from 'react-router-dom'
import './App.css'
import Register from './Pages/Register.jsx'
import Login from './Pages/Login.jsx'
import Home from './Pages/Home.jsx'
import Profile from './pages/Profile.jsx'

function App() {
  

  return (
    <>
    <Routes>
      <Route path="/register" element={<Register/>}></Route>
      <Route path="/" element={<Login/>}></Route>
      <Route path="/home" element={<Home/>}></Route>
      <Route path="/profile" element={<Profile/>}></Route>
    
    </Routes>
      
    </>
  )
}

export default App

