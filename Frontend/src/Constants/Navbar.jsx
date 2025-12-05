import React from 'react'

const Navbar = () => {
  return (
    <div className='relative'>
      <div className='flex items-center justify-between m-2 p-2 bg-custom8 rounded '>
        <div>
          <p className='text-white font-bold'>PLANTRA</p>
        </div>
        <div>
        <ul className='flex items-center justify-center gap-10 text-white'>
          <li>Home</li>
          <li>About Us</li>
          <li>Contact Us</li>

        </ul>
        </div>
        <div className='flex justify-between gap-10 items-center '>
          <div>
            <button className='bg-custom2 px-3 rounded-full'>Signup</button>
          </div>
          <div>
            <button className='bg-custom7 px-3 rounded-full text-white'>Signin</button>
          </div>

        </div>

      </div>
      
    </div>
  )
}

export default Navbar