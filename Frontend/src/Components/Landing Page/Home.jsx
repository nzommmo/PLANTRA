import React from 'react'
import Navbar from "../../Constants/Navbar"
import Footer from "../../Constants/Footer"
import Hero from './Hero'

const Home = () => {
  return (
    <div>
        <div><Navbar/></div>
        <main>
           <Hero/>
        </main>
        <div><Footer/></div>
    </div>
  )
}

export default Home