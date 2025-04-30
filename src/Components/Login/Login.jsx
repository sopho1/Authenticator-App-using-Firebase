import React, { useState } from 'react';
import './Login.css';
import { Link } from 'react-router-dom';
import { auth } from '../../firebase';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ClipLoader } from 'react-spinners';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError('Invalid email format');
      return;
    }
    if (!validatePassword(password)) {
      setError('Invalid Password');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('User Logged In:', userCredential.user);
      setError(''); // Clear error message on successful login
      toast.success('User Logged In Successfully');
      setLoading(true); 
      setTimeout(() => {
        setLoading(false); // Stop loading animation after 1 second
        navigate('/home'); // Redirect to home page after successful login
      }, 2000);
    } catch (error) {
        if (error.code === 'auth/network-request-failed') {
        toast.error('Network error. Please check your internet connection.');
        setError('Network error. Please check your internet connection.');
      } else if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        toast.error('Invalid email or password.');
        setError('Invalid email or password.');
      } else {
        toast.error('An unexpected error occurred. Please try again.');
        setError('An unexpected error occurred. Please try again.');
      }
      console.error('Login error:', error.message);
    }
  };

    const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleprovider);
      console.log('User Logged In:', result.user);
      toast.success('User Logged In Successfully');
      setTimeout(() => {
        navigate('/home');
      }, 1000);
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      const result = await signInWithPopup(auth, facebookprovider);
      console.log('User Logged In:', result.user);
      toast.success('User Logged In with Facebook Successfully');
      setTimeout(() => {
        navigate('/home');
      }, 1000);
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
    }
  }

  return (
    <>

    <div className='login'>
      <div className='login-container'>
        <h1>Login</h1>
        {error && <p className='error'>{error}</p>}
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Login</button>
        </form>

        <div className="social-login">
            <button onClick={handleGoogleLogin} className="social-button google-button">
              <img src="/google-logo.png" alt="Google Logo" />
            </button>
            <button onClick={handleFacebookLogin} className="social-button facebook-button">
              <img src="/facebook-logo.png" alt="Facebook Logo" />
            </button>
        </div>

        <p> Don't have an account? <Link to="/SignUp" className='signup-button'> Sign Up </Link> </p>
      </div>
      </div>
      {loading && (
        <div className='loading-overlay'>
          <ClipLoader color='#007bff' loading={loading} size={50} />
        </div>
      )}
        <ToastContainer />
    </>
  );
};

export default Login;