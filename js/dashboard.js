import { logoutUser } from './auth.js';

function setDashboardTitle() {
    console.log('Setting dashboard title');
    const titleElement = document.getElementById('dashboard-title');
    if (titleElement) {
        const path = window.location.pathname;
        console.log('Current path:', path);
        let role = 'User';
        let dashboardClass = 'user-dashboard';
        
        if (path.includes('/sport-admin/')) {
            role = 'Sport Admin';
            dashboardClass = 'sport-admin-dashboard';
        } else if (path.includes('/admin/')) {
            role = 'Admin';
            dashboardClass = 'admin-dashboard';
        } else if (path.includes('/coach/')) {
            role = 'Coach';
            dashboardClass = 'coach-dashboard';
        } else if (path.includes('/player/')) {
            role = 'Player';
            dashboardClass = 'player-dashboard';
        }
        
        console.log('Detected role:', role);
        console.log('Dashboard class:', dashboardClass);
        
        titleElement.textContent = `${role} Dashboard`;
        document.body.classList.add(dashboardClass);
        console.log('Dashboard title set and class added to body');
    } else {
        console.error('Dashboard title element not found');
    }
}

function setupNavigation() {
    console.log('Setting up navigation');
    const navElement = document.getElementById('nav-list');
    console.log('Nav element:', navElement);
    if (navElement) {
        const path = window.location.pathname;
        console.log('Current path:', path);
        let navItems = [];

        // Role-specific navigation items
        if (path.includes('/sport-admin/') || path.includes('/sports-admin/')) {
            console.log('Detected sport admin path');
            navItems = [
                { href: 'dashboard.html', icon: 'fa-home', text: 'Home' },
                { href: 'clubs.html', icon: 'fa-users', text: 'Clubs' },
                { href: 'fixtures.html', icon: 'fa-calendar-alt', text: 'Fixtures' },
                { href: 'players.html', icon: 'fa-running', text: 'Players' },
                { href: 'standings.html', icon: 'fa-trophy', text: 'Standings' },
                 // { href: '#', icon: 'fa-sign-out-alt', text: 'Logout', id: 'logout-button' }
            ];
        } else if (path.includes('/admin/')) {
            console.log('Detected admin path');
            navItems = [
                { href: 'dashboard.html', icon: 'fa-home', text: 'Home' },
                { href: 'users.html', icon: 'fa-users', text: 'Manage Users' },
                { href: 'settings.html', icon: 'fa-cog', text: 'System Settings' },
                { href: 'reports.html', icon: 'fa-chart-bar', text: 'View Reports' },
                { href: '#', icon: 'fa-sign-out-alt', text: 'Logout', id: 'logout-button' }
            ];
        } else if (path.includes('/coach/')) {
            console.log('Detected coach path');
            navItems = [
                { href: 'dashboard.html', icon: 'fa-home', text: 'Home' },
                { href: 'team.html', icon: 'fa-users', text: 'Team Roster' },
                { href: 'practice.html', icon: 'fa-calendar-alt', text: 'Practice Schedule' },
                { href: 'games.html', icon: 'fa-trophy', text: 'Game Schedule' },
                { href: '#', icon: 'fa-sign-out-alt', text: 'Logout', id: 'logout-button' }
            ];
        } else if (path.includes('/player/')) {
            console.log('Detected player path');
            navItems = [
                { href: 'dashboard.html', icon: 'fa-home', text: 'Home' },
                { href: 'schedule.html', icon: 'fa-calendar-alt', text: 'My Schedule' },
                { href: 'team.html', icon: 'fa-users', text: 'Team Information' },
                { href: 'stats.html', icon: 'fa-chart-line', text: 'Personal Stats' },
                { href: '#', icon: 'fa-sign-out-alt', text: 'Logout', id: 'logout-button' }
            ];
        } else {
            console.log('No specific role detected, using default navigation');
            navItems = [
                { href: 'dashboard.html', icon: 'fa-home', text: 'Home' },
                { href: 'schedule.html', icon: 'fa-calendar-alt', text: 'League Schedule' },
                { href: 'standings.html', icon: 'fa-trophy', text: 'Team Standings' },
                { href: 'news.html', icon: 'fa-newspaper', text: 'News and Updates' },
                { href: '#', icon: 'fa-sign-out-alt', text: 'Logout', id: 'logout-button' }
            ];
        }

        console.log('Navigation items:', navItems);

        // Generate navigation HTML
        navElement.innerHTML = navItems.map(item => `
            <li>
                <a href="${item.href}" ${item.id ? `id="${item.id}"` : ''}>
                    <i class="fas ${item.icon}"></i> ${item.text}
                </a>
            </li>
        `).join('');

        console.log('Navigation HTML set');

        // Setup logout functionality
        setupLogout();
    } else {
        console.error('Navigation list element not found');
    }
}

function setupLogout() {
    console.log('Setting up logout functionality');
    const logoutButton = document.getElementById('logout-button');
    console.log('Logout button:', logoutButton);
    if (logoutButton) {
        // Add text to the button for better visibility
        logoutButton.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
        
        // Add hover effect
        logoutButton.addEventListener('mouseenter', () => {
            logoutButton.style.backgroundColor = '#ff4d4d';
        });
        logoutButton.addEventListener('mouseleave', () => {
            logoutButton.style.backgroundColor = '';
        });

        logoutButton.addEventListener('click', (e) => {
            console.log('Logout button clicked');
            e.preventDefault();
            // Add a confirmation dialog
            if (confirm('Are you sure you want to logout?')) {
                logoutUser()
                    .then(() => {
                        console.log('Logout successful, redirecting to index.html');
                        window.location.href = '/index.html';
                    })
                    .catch((error) => {
                        console.error('Logout error:', error);
                        alert('Logout failed. Please try again.');
                    });
            }
        });
        console.log('Logout event listeners added');
    } else {
        console.error('Logout button not found');
    }
}

function setupMobileMenu() {
    console.log('Setting up mobile menu');
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            console.log('Mobile menu toggled');
            mainNav.classList.toggle('show');
        });

        // Add logout option to mobile menu
        const mobileLogoutItem = document.createElement('li');
        mobileLogoutItem.innerHTML = '<a href="#" id="mobile-logout-button"><i class="fas fa-sign-out-alt"></i> Logout</a>';
        mainNav.querySelector('ul').appendChild(mobileLogoutItem);

        // Setup logout functionality for mobile
        const mobileLogoutButton = document.getElementById('mobile-logout-button');
        if (mobileLogoutButton) {
            mobileLogoutButton.addEventListener('click', (e) => {
                e.preventDefault();
                logoutUser()
                    .then(() => {
                        console.log('Logout successful, redirecting to index.html');
                        window.location.href = '/index.html';
                    })
                    .catch((error) => {
                        console.error('Logout error:', error);
                    });
            });
        }

        console.log('Mobile menu and logout option set up');
    } else {
        console.error('Mobile menu elements not found');
    }
}

function initDashboard() {
    console.log('Initializing dashboard');
    setDashboardTitle();
    setupNavigation();
    setupMobileMenu();
    console.log('Dashboard initialization complete');
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM content loaded, initializing dashboard');
    initDashboard();
});
