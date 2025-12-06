import React from 'react'
import { QuoteIcon,Instagram} from 'lucide-react'
import Profile from "../../assets/images/profile.jpeg"
import facebooklogo from "../../assets/images/facebook.png"
import twitterlogo from "../../assets/images/twitter.png"
import instagramlogo from "../../assets/images/instagram.png"

const Testimonials = () => {
  return (
    <div className='m-2 p-2 rounded'>
        <div className='lg:p-12'>
        <div className='flex lg:flex-row flex-col lg:items-center items-start lg:justify-between justify-start'>
            <div>
                <p className='!text-custom7 lg:text-4xl text-2xl'>
                    Life-Changing <br />
                    Stories from Our Users
                </p>
                <p className='pt-1 text-neutral-500'>Discover the impact of Plantra and our services through experiences</p>
            </div>
            <div className='lg:mx-6 mt-6'>
                <button className='bg-custom9 text-white px-7 py-2 font-semibold rounded-full'>Give Feedback</button>
            </div>

        </div>
        <div className='grid lg:grid-cols-3 grid-cols-1 mt-10 gap-4'>
            <div className='bg-custom1 p-6 rounded-md h-fit '>
                <div>
                <p className='flex gap-2'><QuoteIcon className='fill-custom5 ' color=''/> <span className='lg:text-xl text-lg font-semibold'>Planning Has Never Been This Easy</span></p>
                <p className='pt-2'>Plantra has completely changed how we organize events. Everything is structured, automated, and stress-free. It saves us hours every week.</p>
                </div>

                <div className='flex items-center justify-between pt-4'>
                    <div className='flex items-center gap-3'>
                        <img  className="rounded-full w-10 h-10  " src={Profile} />
                        <div>
                            <p className='font-semibold'>John Doe</p>
                            <p className='text-sm text-neutral-500'>Solfest Generation</p>

                        </div>
                    </div>
                    <div>
                        <img src={instagramlogo} className='w-6 h-6' alt="" />
                    </div>
                </div>
            </div>
                <div className='bg-custom1 p-6 rounded-md h-fit '>
                <div>
                <p className='flex gap-2'><QuoteIcon className='fill-custom5 ' color=''/> <span className='text-xl font-semibold'>Our Team Finally Works in Sync</span></p>
                <p className='pt-2'>The collaboration tools areh-fit a game-changer. Everyone knows their tasks, deadlines, and updates instantly. No more confusion or last-minute rush.</p>
                </div>

                <div className='flex items-center justify-between pt-4'>
                    <div className='flex items-center gap-3'>
                        <img  className="rounded-full w-10 h-10  " src={Profile} />
                        <div>
                            <p className='font-semibold'>John Doe</p>
                            <p className='text-sm text-neutral-500'>Solfest Generation</p>

                        </div>
                    </div>
                    <div>
                        <img src={twitterlogo} className='w-6 h-6' alt="" />
                    </div>
                </div>
            </div>
            <div className='bg-custom1 p-6 rounded-md h-fit '>
                <div>
                <p className='flex gap-2'><QuoteIcon className='fill-custom5 ' color=''/> <span className='text-xl font-semibold'>Checklists That Actually Keep You Accountable</span></p>
                <p className='pt-2'>Creating custom checklists for different events has improved our consistency. We no longer forget important steps or repeat errors.</p>
                </div>

                <div className='flex items-center justify-between pt-4'>
                    <div className='flex items-center gap-3'>
                        <img  className="rounded-full w-10 h-10  " src={Profile} />
                        <div>
                            <p className='font-semibold'>John Doe</p>
                            <p className='text-sm text-neutral-500'>Solfest Generation</p>

                        </div>
                    </div>
                    <div>
                        <img src={facebooklogo} className='w-6 h-6' alt="" />
                    </div>
                </div>
            </div>
            <div className='bg-custom1 p-6 rounded-md h-fit '>
                <div>
                <p className='flex gap-2'><QuoteIcon className='fill-custom5 ' color=''/> <span className='text-xl font-semibold'>Organizing Multiple Events Is Now a Breeze</span></p>
                <p className='pt-2'>We manage several events at the same time, and Plantra keeps everything synchronized perfectly. It’s the most reliable planning tool we’ve used.</p>
                </div>

                <div className='flex items-center justify-between pt-4'>
                    <div className='flex items-center gap-3'>
                        <img  className="rounded-full w-10 h-10  " src={Profile} />
                        <div>
                            <p className='font-semibold'>John Doe</p>
                            <p className='text-sm text-neutral-500'>Solfest Generation</p>

                        </div>
                    </div>
                    <div>
                        <img src={twitterlogo} className='w-6 h-6' alt="" />
                    </div>
                </div>
            </div>
            <div className='bg-custom1 p-6 rounded-md h-fit '>
                <div>
                <p className='flex gap-2'><QuoteIcon className='fill-custom5 ' color=''/> <span className='text-xl font-semibold'>A Must-Have for Every Event Organizer</span></p>
                <p className='pt-2'>From budgeting to task assignments, Plantra brings everything into one place. It’s intuitive, modern, and truly built for event professionals.</p>
                </div>

                <div className='flex items-center justify-between pt-4'>
                    <div className='flex items-center gap-3'>
                        <img  className="rounded-full w-10 h-10  " src={Profile} />
                        <div>
                            <p className='font-semibold'>John Doe</p>
                            <p className='text-sm text-neutral-500'>Solfest Generation</p>

                        </div>
                    </div>
                    <div>
                        <img src={instagramlogo} className='w-6 h-6' alt="" />
                    </div>
                </div>
            </div>
            <div className='bg-custom1 p-6 rounded-md h-fit'>
                <div>
                <p className='flex gap-2'><QuoteIcon className='fill-custom5 ' color=''/> <span className='text-xl font-semibold'>Planning Has Never Been This Easy</span></p>
                <p className='pt-2'>Plantra has completely changed how we organize events. Everything is structured, automated, and stress-free. It saves us hours every week.</p>
                </div>

                <div className='flex items-center justify-between pt-4'>
                    <div className='flex items-center gap-3'>
                        <img  className="rounded-full w-10 h-10  " src={Profile} />
                        <div>
                            <p className='font-semibold'>John Doe</p>
                            <p className='text-sm text-neutral-500'>Solfest Generation</p>

                        </div>
                    </div>
                    <div>
                        <img src={instagramlogo} className='w-6 h-6' alt="" />
                    </div>
                </div>
            </div>

        </div>
        </div>
        
    </div>
  )
}

export default Testimonials