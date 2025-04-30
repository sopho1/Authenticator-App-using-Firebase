import React from 'react'
import './Intro.css'
import car from '../../Car.mp4'

const Intro = () => {
  return (
   <>
   <div className='video-container'>
    <video src={car} autoPlay loop muted />
    
    <div className="hero-text">
      <h1>WELCOME TO OUR WEBSITE</h1>
    </div>
    </div>
   
   </>
  )
}

export default Intro