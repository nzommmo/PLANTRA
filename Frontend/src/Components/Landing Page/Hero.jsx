import React from 'react'
import heroimage from "../../assets/images/hero.jpg"

const Hero = () => {
  return (
    <div
    className="bg-cover bg-center lg:h-[400px] h-screen m-2 rounded"
    style={{ backgroundImage: `url(${heroimage})` }}>
      <div className='flex items-center justify-center md:pt-12 pt-34'>
        <div className='lg:w-2/5'>
        <h2 className='text-center'>Organize Events. Track Progress. Stress Less.</h2>
        <p className='text-neutral-200 mt--2 md:text-lg text-xl text-center p-2'>Plantra streamlines your event planning by organizing deliverables, checklists, and timelines in one intuitive dashboard. Stay organized and in control, so you can focus on creating unforgettable experiences.</p>
        </div>
      </div>
      <div className='flex items-center justify-center text-white  lg:mt-4 mt-10 '>
        <button className='bg-custom5 lg:px-6 lg:py-1 px-8 py-2 rounded-full font-bold'>Get Started</button>
      </div>

     </div>
      
    
  )
}

export default Hero