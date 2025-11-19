import React from 'react';
import './Intro.css';
import car from '../../Car.mp4';

const Intro = ({ username = 'Explorer' }) => {
  return (
    <section className="video-container" id="hero">
      <video src={car} autoPlay loop muted playsInline />

      <div className="hero-text">
        <p className="eyebrow">Seamless Identity · Trusted Access</p>
        <h1>
          Welcome back, <span>{username}</span>
        </h1>
        <p className="subtitle">
          Manage every login, approval, and insight from one elegant experience. Security meets storytelling.
        </p>
        <div className="hero-cta">
          <a href="#capabilities" className="btn primary">
            Explore Highlights
          </a>
          <a href="#insights" className="btn ghost">
            View Insights
          </a>
        </div>
      </div>
    </section>
  );
};

export default Intro;