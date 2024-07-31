// main.js

import { auth } from './firebase-config.js';
import { 
    loginUser, 
    registerUser, 
    logoutUser, 
    getUserProfile, 
    updateUserProfile, 
    onAuthStateChange, 
    getRoleBasedPath,
    isSportAdminEmail
} from './auth.js';
import { ROLES, SPORT_ADMINS } from './roles.js';

function navigateTo(path) {
    console.log('Navigating to:', path);
    window.location.href = path;
}

// Login form submission
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    loginUser(email, password)
      .then(({ user, role }) => {
        console.log('Login successful:', user.email);
        const path = getRoleBasedPath(role);
        navigateTo(path);
      })
      .catch((error) => {
        console.error('Login error:', error);
        const errorElement = document.getElementById('login-error');
        if (errorElement) {
          errorElement.textContent = error.message;
          errorElement.style.display = 'block';
        }
      });
  });
}

// Registration form submission
const registerForm = document.getElementById('register-form');
const emailInput = document.getElementById('email');
const roleSelect = document.getElementById('role');

if (registerForm && emailInput && roleSelect) {
  // Add note about reserved email addresses
  const noteElement = document.createElement('p');
  noteElement.textContent = 'Note: Certain email addresses are reserved for sports administrators.';
  noteElement.style.color = 'blue';
  registerForm.insertBefore(noteElement, registerForm.firstChild);

  // Disable role selection for sport admin emails
  emailInput.addEventListener('input', (e) => {
    const email = e.target.value;
    if (isSportAdminEmail(email)) {
      roleSelect.value = 'sportAdmin';
      roleSelect.disabled = true;
    } else {
      roleSelect.disabled = false;
    }
  });

  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = emailInput.value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const selectedRole = roleSelect.value;

    // Map the selected role to the ROLES object
    let role;
    switch(selectedRole) {
      case 'player':
        role = ROLES.PLAYER;
        break;
      case 'coach':
        role = ROLES.COACH;
        break;
      case 'sportAdmin':
        role = ROLES.SPORT_ADMIN;
        break;
      case 'regularUser':
        role = ROLES.REGULAR_USER;
        break;
      default:
        console.error('Invalid role selected');
        return;
    }

    if (password !== confirmPassword) {
      const errorElement = document.getElementById('register-error');
      if (errorElement) {
        errorElement.textContent = 'Passwords do not match';
        errorElement.style.display = 'block';
      }
      return;
    }

    registerUser(email, password, role)
      .then(({ user, role }) => {
        console.log('Registration successful:', user.email, 'Role:', role);
        const path = getRoleBasedPath(role);
        navigateTo(path);
      })
      .catch((error) => {
        console.error('Registration error:', error);
        const errorElement = document.getElementById('register-error');
        if (errorElement) {
          errorElement.textContent = error.message;
          errorElement.style.display = 'block';
        }
    });
});
}

// Logout functionality
const logoutButton = document.getElementById('logout-button');
if (logoutButton) {
logoutButton.addEventListener('click', (e) => {
  e.preventDefault();
  logoutUser()
    .then(() => {
      console.log('Logout successful');
      navigateTo('/index.html');
    })
    .catch((error) => {
      console.error('Logout error:', error);
    });
});
}

// Check auth state
onAuthStateChange((user) => {
if (user) {
  console.log('User is signed in:', user.email);
  getUserProfile(user.uid).then(profile => {
    if (profile) {
      console.log('User profile:', profile);
      const path = getRoleBasedPath(profile.role);
      if (window.location.pathname !== path) {
        navigateTo(path);
      }
    } else {
      console.error('User profile not found');
      logoutUser().then(() => {
        navigateTo('/index.html');
      });
    }
  });
} else {
  console.log('User is signed out');
  if (window.location.pathname !== '/index.html' && 
      window.location.pathname !== '/pages/login.html' && 
      window.location.pathname !== '/pages/register.html') {
    navigateTo('/index.html');
  }
}
});

// Update profile functionality (if needed)
const updateProfileForm = document.getElementById('update-profile-form');
if (updateProfileForm) {
updateProfileForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  if (user) {
    const name = document.getElementById('name').value;
    const bio = document.getElementById('bio').value;

    updateUserProfile(user.uid, { name, bio })
      .then(() => {
        console.log('Profile updated successfully');
        // You might want to refresh the page or update the UI here
      })
      .catch((error) => {
        console.error('Error updating profile:', error);
        // Display error message to user
      });
  } else {
    console.error('No user is currently signed in');
  }
});
}
