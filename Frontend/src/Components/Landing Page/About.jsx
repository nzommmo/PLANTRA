import React from 'react'
import { Star } from 'lucide-react'

const About = () => {
  return (
    <div className="relative m-2 p-2 rounded bg-gradient-to-br from-custom1 to-custom4 bg-opacity-50">
      <div className="flex lg:flex-row flex-col justify-between lg:p-12 lg:gap-32 gap-10 items-start">
        {/* ⭐ Stars */}
        <div className="flex gap-1 items-center lg:p-3 p-2 rounded-full bg-custom1 shadow-md flex-shrink-0">
          {[...Array(5)].map((_, index) => (
            <Star key={index} className="fill-amber-300 " color="" size={24} />
          ))}
          <div>
            <p className="text-custom9 text-sm font-semibold tracking-wider">4.97/5 reviews</p>
          </div>
        </div>

        {/* 📝 Text */}
        <div className="flex-1">
          <p className="!text-custom9 text-left lg:text-4xl text-2xl">
            We are passionate about empowering event organizers <span className='text-custom5'>to take control of their planning, stay on top of every detail, and deliver successful events with confidence and ease.</span> 
          </p>
        </div>
      </div>
        <div className='grid lg:grid-cols-4 grid-cols-2 gap-8  lg:p-12 lg:pt-0 pt-8'>
            <div>
                <h5 className='!text-custom9'>1,200+</h5>
                <p className='text-neutral-500 lg:text-base text-sm'>Successfully tracked and managed events with Plantra.</p>
                
            </div>
            <div>
                <h5 className='!text-custom9'>18,500+</h5>
                <p className='text-neutral-500 lg:text-base text-sm'>Deliverables and tasks completed on time across all events.</p>

            </div>
            <div>
                <h5 className='!text-custom9'>2,100+</h5>
                <p className='text-neutral-500 lg:text-base text-sm'>Organizers actively planning and executing events with confidence.</p>

            </div>
            <div>
                <h5 className='!text-custom9'>Up to 35%</h5>
                <p className='text-neutral-500 lg:text-base text-sm'>Reduced costs through improved organization and fewer planning delays.</p>

            </div>

        </div>

    </div>
  )
}

export default About
