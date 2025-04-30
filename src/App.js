import './App.css';
import { Navigate, Route, BrowserRouter as Router, Routes, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import Intro from './Components/Intro/Intro';
import SignUp from './Components/SignUp/SignUp';
import Home from './Components/Home/Home';
import Login from './Components/Login/Login';
import Navbar from './Components/Navbar/Navbar';
import { ClipLoader } from 'react-spinners';

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [userRole, setUserRole] = useState(null); // State to hold user role
  const navigate = useNavigate(); // Now this is inside the Router context

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth State Changed:', user);
      if (user) {
        try {
          const db = getFirestore();
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setIsAuthenticated(true);
            setUserRole(userData.role); // Save the user's role in state
          } else {
            console.error('No user data found!');
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setIsAuthenticated(false);
      navigate('/login'); // Use navigate here
    } catch (error) {
      console.error('Error Signing Out', error);
    }
  };

  return (
    <div className="App">
      <Navbar isAuthenticated={isAuthenticated} onSignOut={handleSignOut} />
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated === null ? (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100vh',
                }}
              >
                <ClipLoader color="007bff" loading={true} size={50} />
              </div> // Show a loading state while determining auth
            ) : (
              <Navigate to={isAuthenticated ? '/home' : '/login'} />
            )
          }
        />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/intro" element={<Intro />} />
      </Routes>
    </div>
  );
}

export default AppWrapper;