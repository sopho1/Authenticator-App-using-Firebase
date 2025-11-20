import React, { useCallback, useEffect, useState } from 'react'
import './SignUp.css'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Link } from 'react-router-dom'
import { auth } from '../../firebase'
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { ClipLoader } from 'react-spinners'
import { getFirestore, doc, setDoc } from 'firebase/firestore'
import { loadStripe } from '@stripe/stripe-js'


const db = getFirestore();

const publishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY
const stripePromise = publishableKey ? loadStripe(publishableKey) : null
const monthlyPriceId = process.env.REACT_APP_STRIPE_ADMIN_MONTHLY_PRICE_ID
const yearlyPriceId = process.env.REACT_APP_STRIPE_ADMIN_YEARLY_PRICE_ID

const SignUp = () => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username , setUsername] = useState('');
  const [role , setRole] = useState('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
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

  const completeSignUp = useCallback(
    async (formData) => {
      try {
        setError('');
        setLoading(true);
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          role: formData.role,
          username: formData.username,
          password: formData.password,
          subscriptionPlan: formData.role === 'admin' ? formData.billingCycle : 'guest',
          subscriptionStatus: formData.role === 'admin' ? 'active' : 'n/a',
        });
        toast.success(formData.role === 'admin' ? 'Admin account activated!' : 'User Signed Up Successfully');
        navigate('/home');
      } catch (error) {
        setError(error.message);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  const initiateAdminCheckout = async (formData) => {
    if (!stripePromise) {
      toast.error('Stripe publishable key is missing. Please update your environment variables.');
      return;
    }

    const priceId = formData.billingCycle === 'monthly' ? monthlyPriceId : yearlyPriceId;
    if (!priceId) {
      toast.error('Stripe price IDs are not configured.');
      return;
    }

    sessionStorage.setItem('pendingAdminSignUp', JSON.stringify(formData));

    try {
      setIsProcessingCheckout(true);
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to initialize.');
      }

      const { error: checkoutError } = await stripe.redirectToCheckout({
        mode: 'subscription',
        lineItems: [{ price: priceId, quantity: 1 }],
        customerEmail: formData.email,
        successUrl: `${window.location.origin}/signup?checkout=success&plan=${formData.billingCycle}`,
        cancelUrl: `${window.location.origin}/signup?checkout=cancel`,
      });

      if (checkoutError) {
        sessionStorage.removeItem('pendingAdminSignUp');
        toast.error(checkoutError.message);
      } else {
        toast.info('Redirecting to Stripe Checkout…');
      }
    } catch (err) {
      sessionStorage.removeItem('pendingAdminSignUp');
      toast.error(err.message);
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkoutStatus = params.get('checkout');

    if (!checkoutStatus) return;

    if (checkoutStatus === 'success') {
      const stored = sessionStorage.getItem('pendingAdminSignUp');
      if (stored) {
        const parsed = JSON.parse(stored);
        setEmail(parsed.email);
        setPassword(parsed.password);
        setUsername(parsed.username);
        setRole('admin');
        setBillingCycle(parsed.billingCycle);
        sessionStorage.removeItem('pendingAdminSignUp');
        toast.success('Payment confirmed. Completing admin sign up...');
        completeSignUp(parsed);
      } else {
        toast.success('Payment confirmed. Please submit your details to finish sign up.');
      }
    }

    if (checkoutStatus === 'cancel') {
      sessionStorage.removeItem('pendingAdminSignUp');
      toast.info('Admin checkout canceled.');
    }

    window.history.replaceState({}, document.title, window.location.pathname);
  }, [completeSignUp]);

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

    const formData = { username, email, password, role, billingCycle };

    if (role === 'admin') {
      await initiateAdminCheckout(formData);
      return;
    }

    await completeSignUp(formData);
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
              {role === 'admin' && (
                <div className='plan-selector'>
                  <p>Select admin plan</p>
                  <label className={`plan-option ${billingCycle === 'monthly' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="billingCycle"
                      value="monthly"
                      checked={billingCycle === 'monthly'}
                      onChange={(e) => setBillingCycle(e.target.value)}
                    />
                    <span>$20 / month</span>
                  </label>
                  <label className={`plan-option ${billingCycle === 'yearly' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="billingCycle"
                      value="yearly"
                      checked={billingCycle === 'yearly'}
                      onChange={(e) => setBillingCycle(e.target.value)}
                    />
                    <span>$200 / year</span>
                  </label>
                </div>
              )}
              <button type="submit" disabled={loading || isProcessingCheckout}>
                {role === 'admin' ? 'Pay & Sign Up as Admin' : 'Sign Up'}
              </button>
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

      {(loading || isProcessingCheckout) && (
        <div className='loading-overlay'>
          <ClipLoader color='#007bff' loading={loading || isProcessingCheckout} size={50} />
        </div>
      )}

      <ToastContainer />
      </>
  )
}

export default SignUp