import React, { useState } from 'react'
import './SignUp.css'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Link } from 'react-router-dom'
import { auth } from '../../firebase'
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { ClipLoader } from 'react-spinners'
import { getFirestore, doc, setDoc } from 'firebase/firestore'


const db = getFirestore();

const SignUp = () => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username , setUsername] = useState('');
  const [role , setRole] = useState('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const googleprovider = new GoogleAuthProvider();
  const facebookprovider = new FacebookAuthProvider();

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const handleSignUp = async(e) => {
    e.preventDefault();

    if (!username) {
      setError('Username is required');
      return;
    }
    if (!validateEmail(email)) {
      setError('Invalid email format');
      return;
    }
    if (!validatePassword(password)) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        role: role,
        username: username,
        password: password,
      });
      console.log('User Signed Up:', userCredential.user);
      setError('');
      toast.success("User Signed Up Successfully")
      setLoading(true);
      setTimeout( () => {
        setLoading(false);
        navigate('/home');
      }, 2000
    ); 
  } catch (error) {
      setError(error.message);
      toast.error(error.message);
  }
};

  const handleGoogleSignUp = async () => {
    try {
      const result = await signInWithPopup(auth, googleprovider);
      console.log('User Signed Up with Google:', result.user);
      toast.success('User Signed Up with Google Successfully');
      navigate('/home');
    } catch (error) {
      console.error('Google SignUp error: ',error.message);
      toast.error(error.message);
    }
  }

  const handleFacebookSignUp = async () => {
    try {
      const result = await signInWithPopup(auth, facebookprovider);
      console.log('User Signed Up with Facebook:', result.user);
      toast.success('User Signed Up with Facebook Successfully');
      navigate('/home');
    } catch (error) {
      console.error('Facebook SignUp error: ',error.message);
      toast.error(error.message);
    }
  }

  return (
    <>
    <div className='signup'>
      <div className='signup-container'>
          <h1>Sign Up</h1>
          {error && <p className='error'>{error}</p>}
          <form onSubmit={handleSignUp}>
              <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)}/>
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}/>
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}/>
              <div className='role-container'>
              <label>
              <input type="radio" name="role" value="user" checked={role === "user"} onChange={(e) => setRole(e.target.value)} />
                      Guest
              </label>
              <label>
              <input type="radio" name="role" value="admin" checked={role === "admin"} onChange={(e) => setRole(e.target.value)} />
                      Admin
              </label>
              </div>
              <button type="submit">Sign Up</button>
          </form>

          <div className="social-login">
              <button onClick={handleGoogleSignUp} className="social-button google-button">
                <img src="/google-logo.png" alt="Google Logo" />
              </button>
              <button onClick={handleFacebookSignUp} className="social-button facebook-button">
                <img src="/facebook-logo.png" alt="Facebook Logo" />
              </button>
          </div>

          <p> Already have an account? <Link to="/login" className='login-button'> Log in </Link> </p>
        </div>
      </div>

      {loading && (
        <div className='loading-overlay'>
          <ClipLoader color='#007bff' loading={loading} size={50} />
        </div>
      )}

      <ToastContainer />
      </>
  )
}

export default SignUp