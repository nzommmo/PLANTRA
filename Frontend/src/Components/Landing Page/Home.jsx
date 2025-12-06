import React from 'react'
import Navbar from "../../Constants/Navbar"
import Footer from "../../Constants/Footer"
import Hero from './Hero'
import CTA from './CTA'
import About from './About'
import Testimonials from './Testimonials'

const Home = () => {
  return (
    <div>
        <div><Navbar/></div>
        <main>
           <Hero/>
           <CTA/>
           <About/>
           <Testimonials/>
        </main>
        <div><Footer/></div>
    </div>
  )
}

export default Home