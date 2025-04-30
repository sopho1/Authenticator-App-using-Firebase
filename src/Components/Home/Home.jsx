import React, { useEffect } from 'react'
import './Home.css'
import Intro from '../Intro/Intro'
import {auth} from '../../firebase'
import { getFirestore, doc, getDoc } from 'firebase/firestore'
import { ClipLoader } from 'react-spinners'

const db = getFirestore()

const Home = () => {

  const [ loading, setLoading] = React.useState(true)
  const [ username, setUsername] = React.useState('')

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const user = auth.currentUser;
        console.log('Current User:', user)
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid))
          console.log('Fetched User Document:', userDoc.data())
          if (userDoc.exists()) {
            const fetchedUsername = userDoc.data().username;
            setUsername(fetchedUsername || 'Guest');  // Set default username to 'Guest' if not found
            console.log('Username:', fetchedUsername);
          } else {
            console.error('No user data found in firestore!')
          }
        } else {
          console.error('No user is signed in!')
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsername();
  }, [])

  if (loading) {
      return (
        <div className="loading-container">
          <ClipLoader color="#36d7b7" size={50} loading={loading} />
        </div>
      )
    }

  return (
    <>
        <h2 className='home-username'>Welcome, {username}</h2>
        <Intro />
    </>
  )
}

export default Home