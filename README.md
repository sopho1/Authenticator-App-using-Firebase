# Authentication App

This is a React-based authentication app for managing user sign-up, login, and role-based access. It integrates Firebase for authentication, Firestore for database management, and React Router for navigation.

---

## Features

- User authentication (Sign Up, Login, and Logout)
- Role-based access control
- Admin registration gated behind Stripe Checkout
- Firebase integration for authentication and Firestore
- Responsive navigation bar
- Loading spinner for authentication state determination

---

## Tech Stack

- **Frontend**: React, React Router
- **Backend**: Firebase Authentication, Firestore
- **Styling**: CSS
- **State Management**: React Hooks

---

## Prerequisites

Before running this project, ensure you have the following installed:

- Node.js (v14 or higher)
- npm or yarn
- Firebase account

---

## Installation

1. Clone the repository:
   ``bash
   git clone https://github.com/sopho1/Authenticator-App-using-Firebase.git
   cd Authentication App

2. npm install   

3. Set up Firebase:

    Create a Firebase project at Firebase Console

    Enable Email/Password, Google, and Facebook sign-in methods

    Copy your Firebase config and paste it into the project folder firebase.js

4. Configure Stripe Checkout for admin onboarding:

    - Create a Stripe account (test mode is fine) and create two recurring Prices: $20/month and $200/year.
    - Create a `.env` file in the project root and add:

      ```
      REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
      REACT_APP_STRIPE_ADMIN_MONTHLY_PRICE_ID=price_monthly_xxx
      REACT_APP_STRIPE_ADMIN_YEARLY_PRICE_ID=price_yearly_xxx
      ```

    - Restart `npm start` whenever `.env` changes so React picks up the new environment variables.

5. npm start  

## Acknowledgments
React
Firebase
React Router
