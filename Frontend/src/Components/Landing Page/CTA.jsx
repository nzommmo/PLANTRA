import React from 'react'
import { SlidersHorizontal } from 'lucide-react'
import Man1 from "../../assets/images/man1.jpeg"
import Man2 from "../../assets/images/man3.jpeg"


const CTA = () => {
  return (
    <div className='m-2 p-2 bg-white shadow-lg rounded'>
        <div className='flex lg:flex-row flex-col items-center justify-between lg:p-12'>
            <div className='flex flex-col'>
                <div className='flex items-center gap-4'>
                    <h4 className='!text-custom9 text-center pt-3'>Services</h4>
                    <div className='bg-custom2 p-2 rounded-full flex items-center'><SlidersHorizontal className='text-custom8' size={18}/></div>
                </div>
                <div className='lg:w-3/4'>
                    <h2 className='!text-black'>Plan Your Events With Ease & Clarity.</h2>
                    <p className='text-neutral-500 tracking-wide font-medium'>With Plantra, you can streamline every task, track progress in real time, and stay organized from start to finish making event planning simpler, faster, and stress-free.</p>
                </div>
                <div className='mt-5 pb-10'>
                    <button className='bg-custom9 text-white px-7 py-2 font-semibold rounded-full'>Start Your Free Trial</button>
                </div>
            </div>

            {/* Right Side of Services  */}
            <div className='grid lg:grid-cols-2 grid-cols-1 place-items-center gap-2  '>
                <div className=''>
                    <img className="rounded-2xl lg:w-[550px] " src={Man2} alt="" />
                </div>
                <div className='bg-custom6 p-2 rounded-2xl lg:max-w-fit '>
                    <h5>Task & Deliverable Management</h5>
                    <p className='lg:text-sm text-lg text-neutral-200'>Create, assign, and track all your event tasks in one place. Never miss a deadline.</p>

                </div>
                <div className='bg-custom9 rounded-2xl p-2 lg:max-w-fit'>
                    <h5 className='text-white text-md'>Checklists & Progress Tracking</h5>
                    <p className='lg:text-sm text-lg text-neutral-200'>Build custom checklists and monitor progress with real-time updates.</p>
                </div>
                <div>
                    <img className="rounded-2xl lg:w-[550px] " src={Man1}  alt="" />
                </div>
                
            </div>

        </div>
        
    </div>
  )
}

export default CTA