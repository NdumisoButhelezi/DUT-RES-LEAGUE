// dashboard.js

function setDashboardTitle() {
    const titleElement = document.getElementById('dashboard-title');
    const body = document.body;
    if (titleElement) {
        const path = window.location.pathname;
        console.log('Current path:', path); // Debug log
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
        
        console.log('Detected role:', role); // Debug log
        titleElement.textContent = `${role} Dashboard`;
        body.classList.add(dashboardClass);
    }
}

function loadDashboardContent() {
    const contentElement = document.getElementById('dashboard-content');
    if (contentElement) {
        const path = window.location.pathname;
        console.log('Loading content for path:', path); // Debug log
        let content = '';

        if (path.includes('/sport-admin/')) {
            content = `
                <h2>Welcome, Sport Admin!</h2>
                <p>Manage sports activities and events.</p>
                <ul>
                    <li>Schedule Games</li>
                    <li>Manage Teams</li>
                    <li>View League Standings</li>
                </ul>
            `;
        } else if (path.includes('/admin/')) {
            content = `
                <h2>Welcome, Admin!</h2>
                <p>Here you can manage the entire system.</p>
                <ul>
                    <li>Manage Users</li>
                    <li>System Settings</li>
                    <li>View Reports</li>
                </ul>
            `;
        } else if (path.includes('/coach/')) {
            content = `
                <h2>Welcome, Coach!</h2>
                <p>Manage your team and view schedules.</p>
                <ul>
                    <li>Team Roster</li>
                    <li>Practice Schedule</li>
                    <li>Game Schedule</li>
                </ul>
            `;
        } else if (path.includes('/player/')) {
            content = `
                <h2>Welcome, Player!</h2>
                <p>View your schedule and team information.</p>
                <ul>
                    <li>My Schedule</li>
                    <li>Team Information</li>
                    <li>Personal Stats</li>
                </ul>
            `;
        } else {
            content = `
                <h2>Welcome, User!</h2>
                <p>View general information about the league.</p>
                <ul>
                    <li>League Schedule</li>
                    <li>Team Standings</li>
                    <li>News and Updates</li>
                </ul>
            `;
        }

        console.log('Content to be inserted:', content); // Debug log
        contentElement.innerHTML = content;
    } else {
        console.error('Dashboard content element not found'); // Debug log
    }
}

function setupLogout() {
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            // Call your logout function here
            console.log('Logout clicked');
            // For example: auth.logoutUser();
        });
    }
}

function initDashboard() {
    console.log('Initializing dashboard'); // Debug log
    setDashboardTitle();
    loadDashboardContent();
    setupLogout();
}

// Call initDashboard when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded'); // Debug log
    initDashboard();
});
