import React from 'react'

const Footer = () => {
  return (
    <div className='bg-custom8 m-2 rounded p-2 text-white pb-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='!text-[#fff]'>Ready To Work With Us?</h2>
          <p>Experience top-notch customer service and let us guide you on your event planning.</p>
        </div>
        <div>
          <img src="#" alt="" srcset="" />
        </div>
      </div>
      <div className='my-2'>
        <hr className='text-neutral-400 opacity-40' />
      </div>

      <div className='flex justify-between mt-6'>
        <div className='w-2/6'>
        <div>
          <h5>PLANTRA</h5>
          <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Aperiam natus necessitatibus asperiores quod, laborum quo dolore </p>
        </div>
        <div className='flex mt-4 border border-neutral-400 max-w-fit rounded-lg'>
          <input
           type="text" 
           placeholder='Write your email here' 
           className='p-1 placeholder-neutral-300 outline-none'/>   
          <button className='px-2 py-1 rounded-md bg-custom10 m-1'> Submit</button>       
        </div>
        </div>
        <div className='flex gap-12 mr-32'>
          <div>
            <ul className='flex flex-col gap-1'>
              <li className=''>Home</li>
              <li className='text-neutral-300'>About Us</li>
              <li className='text-neutral-300'>Collection</li>
              <li className='text-neutral-300'>Blog & News</li>
            </ul>
          </div>
          <div>
            <ul className='flex flex-col gap-1'>
              <li>Security</li>
              <li className='text-neutral-300'>Privacy Policy</li>
              <li className='text-neutral-300'>User Agreement</li>
              <li className='text-neutral-300'>Copyright</li>
            </ul>
          </div>
          <div>
            <ul className='flex flex-col gap-1'>
              <li>Social Media</li>
              <li className='text-neutral-300'>Instagram</li>
              <li className='text-neutral-300'>Facebook</li>
              <li className='text-neutral-300'>Twitter</li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  )
}

export default Footer