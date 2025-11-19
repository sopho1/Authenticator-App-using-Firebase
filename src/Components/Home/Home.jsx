import React, { useEffect } from 'react';
import './Home.css';
import Intro from '../Intro/Intro';
import { auth } from '../../firebase';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { ClipLoader } from 'react-spinners';
import CountUp from 'react-countup';
import { useNavigate } from 'react-router-dom';

const db = getFirestore();

const highlightCards = [
  {
    title: 'Frictionless Sign-ins',
    badge: 'Realtime',
    description: 'Track every authentication event with clarity and zero guesswork.',
  },
  {
    title: 'Adaptive Security',
    badge: 'AI Assist',
    description: 'Automations surface risky sessions while trusted users sail through.',
  },
  {
    title: 'Experience Builder',
    badge: 'New',
    description: 'Design onboarding rituals, nudges, and journeys with drag-and-drop ease.',
  },
];

const insightMetrics = [
  { label: 'Daily Verified Sessions', value: 1240, suffix: '+' },
  { label: 'Avg. Approval Time', value: 1.8, suffix: 's' },
  { label: 'Retention Lift', value: 36, suffix: '%' },
];

const testimonials = [
  {
    quote: '“The new landing experience makes every login feel curated. Our team loves it.”',
    author: 'Nia Gomez · Growth Lead',
  },
  {
    quote: '“We ship faster because onboarding insights are finally in one beautiful view.”',
    author: 'Haruto Lin · Product Ops',
  },
];

const Home = ({ userRole }) => {
  const [loading, setLoading] = React.useState(true);
  const [username, setUsername] = React.useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const fetchedUsername = userDoc.data().username;
            setUsername(fetchedUsername || 'Guest');
          } else {
            console.error('No user data found in firestore!');
          }
        } else {
          console.error('No user is signed in!');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsername();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <ClipLoader color="#36d7b7" size={50} loading={loading} />
      </div>
    );
  }

  return (
    <div className="home-page">
      <Intro username={username} />

      <main className="home-content">
        <section className="home-overview" id="capabilities">
          <div className="copy">
            <p className="eyebrow">Personalized Control Room</p>
            <h2>Welcome, {username}. Everything you care about is staged here.</h2>
            <p>
              Surface wins, spot anomalies, and keep every identity conversation transparent. Your landing view adapts
              the moment you sign in.
            </p>
            <div className="home-tags">
              <span>Live Journeys</span>
              <span>Event Timelines</span>
              <span>Human-in-the-loop</span>
            </div>
          </div>
          <div className="overview-panel">
            <div>
              <p className="label">Active Journeys</p>
              <strong>08</strong>
            </div>
            <div>
              <p className="label">Signals Watched</p>
              <strong>42</strong>
            </div>
            <div>
              <p className="label">Playbooks</p>
              <strong>12</strong>
            </div>
          </div>
        </section>

        <section className="home-feature-grid">
          {highlightCards.map((card) => (
            <article key={card.title} className="feature-card">
              <span className="badge">{card.badge}</span>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </article>
          ))}
        </section>

        <section className="home-metrics" id="insights">
          {insightMetrics.map((metric) => (
            <div key={metric.label} className="metric-card">
              <p>{metric.label}</p>
              <h4>
                <CountUp end={metric.value} duration={2} decimals={metric.suffix === 's' ? 1 : 0} />
                <span>{metric.suffix}</span>
              </h4>
            </div>
          ))}
        </section>

        <section className="home-panels">
          <div className="panel narrative">
            <h3>Story-driven Journeys</h3>
            <p>
              Launch cinematic onboarding for every persona. Drag in motion, copy, and checkpoints that feel more like a
              concierge than a cold form.
            </p>
            <ul>
              <li>Modular welcome templates</li>
              <li>Conditional branching</li>
              <li>Automated nudges &amp; rituals</li>
            </ul>
          </div>

          <div className="panel timeline">
            <h3>Recent Highlights</h3>
            <ul>
              <li>
                <span>09:24</span>
                <p>Biometric login approved · West Coast</p>
              </li>
              <li>
                <span>10:02</span>
                <p>Journey “Creators” surpassed 2,000 verified fans</p>
              </li>
              <li>
                <span>11:45</span>
                <p>New automation trimmed review times by 38%</p>
              </li>
            </ul>
          </div>

          {userRole === 'admin' && (
            <div className="panel admin-cta">
              <h3>Admin Command</h3>
              <p>Monitor registrations, reshape roles, and resolve escalations with one click.</p>
              <button className="btn" onClick={() => navigate('/admin')}>
                Open Admin Dashboard
              </button>
            </div>
          )}
        </section>

        <section className="home-testimonials">
          {testimonials.map((item) => (
            <blockquote key={item.author}>
              <p>{item.quote}</p>
              <cite>{item.author}</cite>
            </blockquote>
          ))}
        </section>
      </main>
    </div>
  );
};

export default Home;