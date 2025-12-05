import React from 'react'
import heroimage from "../../assets/images/hero.jpg"

const Hero = () => {
  return (
    <div
    className="bg-cover bg-center h-[400px] m-2 rounded"
    style={{ backgroundImage: `url(${heroimage})` }}>
      <div className='flex items-center justify-center pt-12'>
        <div className='w-2/5'>
        <h2 className='text-center'>Organize Events. Track Progress. Stress Less.</h2>
        <p className='text-neutral-200 mt--2'>Plantra streamlines your event planning by organizing deliverables, checklists, and timelines in one intuitive dashboard. Stay organized and in control, so you can focus on creating unforgettable experiences.</p>
        </div>
      </div>
      <div className='flex items-center justify-center text-white mt-4 '>
        <button className='bg-custom5 px-6 py-1 rounded-full'>Get Started</button>
      </div>

     </div>
      
    
  )
}

export default Hero