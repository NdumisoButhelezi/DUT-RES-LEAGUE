// auth.js

import { auth, db } from './firebase-config.js';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { ROLES, SPORT_ADMINS } from './roles.js';

// Registration functionality
export function registerUser(email, password, role) {
  return createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log('User registered:', user);

      const finalRole = SPORT_ADMINS.includes(email) ? ROLES.SPORT_ADMIN : role;

      return setDoc(doc(db, "users", user.uid), {
        email: email,
        role: finalRole,
        createdAt: serverTimestamp()
      }).then(() => {
        console.log('User role added to Firestore');
        return { user, role: finalRole };
      });
    })
    .catch((error) => {
      console.error('Registration error:', error.message);
      throw error;
    });
}

// Login functionality
export function loginUser(email, password) {
  return signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log('User logged in:', user);
      return getUserProfile(user.uid).then(profile => {
        return { user, role: profile.role };
      });
    })
    .catch((error) => {
      console.error('Login error:', error.message);
      throw error;
    });
}

// Logout functionality
export function logoutUser() {
  return signOut(auth)
    .then(() => {
      console.log('User signed out');
    })
    .catch((error) => {
      console.error('Logout error:', error.message);
      throw error;
    });
}

// Get user profile
export function getUserProfile(userId) {
  return getDoc(doc(db, "users", userId))
    .then((docSnap) => {
      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        console.log("No such document!");
        return null;
      }
    })
    .catch((error) => {
      console.error('Error getting user profile:', error);
      throw error;
    });
}

// Update user profile
export function updateUserProfile(userId, profileData) {
  return updateDoc(doc(db, "users", userId), profileData)
    .then(() => {
      console.log('Profile updated successfully');
    })
    .catch((error) => {
      console.error('Error updating profile:', error);
      throw error;
    });
}

// Check auth state
export function onAuthStateChange(callback) {
  return onAuthStateChanged(auth, callback);
}

// Get path based on user role
export function getRoleBasedPath(role) {
  switch(role) {
    case ROLES.SYSTEM_ADMIN:
      return '/admin/dashboard.html';
    case ROLES.SPORT_ADMIN:
      return '/sport-admin/dashboard.html';
    case ROLES.COACH:
      return '/coach/dashboard.html';
    case ROLES.PLAYER:
      return '/player/dashboard.html';
    case ROLES.REGULAR_USER:
      return '/user/dashboard.html';
    default:
      console.error('Unknown role:', role);
      return '/index.html';
  }
}

// Check if email is a sport admin email
export function isSportAdminEmail(email) {
  return SPORT_ADMINS.includes(email);
}
