import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './Components/Landing Page/Home'
import Login from './Components/Auth/Login'
import Signup from './Components/Auth/Signup'
import MainDash from './Components/Dashboard/MainDash'


const App = () => {
  return (
    <div>
     <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login/" element={<Login />} />
        <Route path="/registration/" element={<Signup />} />
        <Route path='/dashboard/' element={<MainDash />} />
      </Routes>
    </div>
  )
}

export default App