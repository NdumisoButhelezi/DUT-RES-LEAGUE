// js/fixture-management.js
import { db } from './firebase-config.js';
import { 
    collection, addDoc, getDocs, doc, updateDoc, deleteDoc, serverTimestamp, query, where, arrayUnion, arrayRemove
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    const groupForm = document.getElementById('group-form');
    const groupsList = document.getElementById('groups-list');
    const fixtureForm = document.getElementById('fixture-form');
    const fixturesList = document.getElementById('fixtures-list');
    const standingsList = document.getElementById('standings-list');
    const knockoutFixtures = document.getElementById('knockout-fixtures');
    const groupSelect = document.getElementById('group-select');
    const homeTeamSelect = document.getElementById('home-team');
    const awayTeamSelect = document.getElementById('away-team');

    // Load groups
    async function loadGroups() {
        const querySnapshot = await getDocs(collection(db, "groups"));
        groupSelect.innerHTML = '<option value="">Select Group</option>';
        groupsList.innerHTML = '';
        
        querySnapshot.forEach((doc) => {
            const group = doc.data();
            const option = new Option(group.name, doc.id);
            groupSelect.add(option);
            
            const groupElement = document.createElement('div');
            groupElement.className = 'group-item';
            groupElement.innerHTML = `
                <h3>${group.name}</h3>
                <p>Teams: ${group.teams.length}</p>
                <button onclick="addTeamToGroup('${doc.id}')" class="btn btn-secondary">Add Team</button>
            `;
            groupsList.appendChild(groupElement);
        });
    }

    // Create a new group
    if (groupForm) {
        groupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const groupName = document.getElementById('group-name').value;

            try {
                await addDoc(collection(db, "groups"), {
                    name: groupName,
                    teams: [],
                    createdAt: serverTimestamp()
                });
                groupForm.reset();
                loadGroups();
            } catch (error) {
                console.error("Error adding group: ", error);
            }
        });
    }

    // Add team to group
    window.addTeamToGroup = async (groupId) => {
        const clubs = await getClubs();
        const clubOptions = Object.entries(clubs).map(([id, name]) => `<option value="${id}">${name}</option>`).join('');
        const teamSelect = prompt(`Select a team to add to the group:\n<select>${clubOptions}</select>`);
        
        if (teamSelect) {
            try {
                const groupRef = doc(db, "groups", groupId);
                await updateDoc(groupRef, {
                    teams: arrayUnion(teamSelect)
                });
                loadGroups();
            } catch (error) {
                console.error("Error adding team to group: ", error);
            }
        }
    }

    // Load clubs for a specific group
    async function loadClubsForGroup(groupId) {
        const groupDoc = await doc(db, "groups", groupId).get();
        const groupTeams = groupDoc.data().teams;
        
        homeTeamSelect.innerHTML = '<option value="">Select Home Team</option>';
        awayTeamSelect.innerHTML = '<option value="">Select Away Team</option>';
        
        const clubs = await getClubs();
        groupTeams.forEach(teamId => {
            const option = new Option(clubs[teamId], teamId);
            homeTeamSelect.add(option.cloneNode(true));
            awayTeamSelect.add(option);
        });
    }

    // Create a new fixture
    if (fixtureForm) {
        fixtureForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const groupId = groupSelect.value;
            const homeTeam = homeTeamSelect.value;
            const awayTeam = awayTeamSelect.value;
            const fixtureDate = document.getElementById('fixture-date').value;
            const venue = document.getElementById('venue').value;

            if (homeTeam === awayTeam) {
                alert("Home team and away team cannot be the same.");
                return;
            }

            try {
                await addDoc(collection(db, "fixtures"), {
                    groupId,
                    homeTeam,
                    awayTeam,
                    date: fixtureDate,
                    venue,
                    homeScore: null,
                    awayScore: null,
                    status: 'scheduled',
                    createdAt: serverTimestamp()
                });
                fixtureForm.reset();
                loadFixtures();
            } catch (error) {
                console.error("Error adding fixture: ", error);
            }
        });
    }

  // Read fixtures
async function loadFixtures() {
    if (fixturesList) {
        fixturesList.innerHTML = '';
        const querySnapshot = await getDocs(collection(db, "fixtures"));
        const clubs = await getClubs();
        const groups = await getGroups();

        querySnapshot.forEach((doc) => {
            const fixture = doc.data();
            const fixtureElement = document.createElement('div');
            fixtureElement.className = 'fixture-item';
            fixtureElement.innerHTML = `
                <h3>${groups[fixture.groupId]} - ${clubs[fixture.homeTeam]} vs ${clubs[fixture.awayTeam]}</h3>
                <p><strong>Date:</strong> ${new Date(fixture.date).toLocaleString()}</p>
                <p><strong>Venue:</strong> ${fixture.venue}</p>
                <p><strong>Status:</strong> ${fixture.status}</p>
                ${fixture.status === 'completed' ? 
                    `<p><strong>Score:</strong> ${fixture.homeScore} - ${fixture.awayScore}</p>` : 
                    `<button onclick="updateFixtureScore('${doc.id}')" class="btn btn-primary">Update Score</button>`
                }
                <div class="button-group">
                    <button onclick="editFixture('${doc.id}')" class="btn btn-secondary"><i class="fas fa-edit"></i> Edit</button>
                    <button onclick="deleteFixture('${doc.id}')" class="btn btn-danger"><i class="fas fa-trash-alt"></i> Delete</button>
                </div>
            `;
            fixturesList.appendChild(fixtureElement);
        });
    }
}

// Get all clubs
async function getClubs() {
    const querySnapshot = await getDocs(collection(db, "clubs"));
    const clubs = {};
    querySnapshot.forEach((doc) => {
        clubs[doc.id] = doc.data().name;
    });
    return clubs;
}

// Get all groups
async function getGroups() {
    const querySnapshot = await getDocs(collection(db, "groups"));
    const groups = {};
    querySnapshot.forEach((doc) => {
        groups[doc.id] = doc.data().name;
    });
    return groups;
}

// Update fixture score
window.updateFixtureScore = async (fixtureId) => {
    const homeScore = prompt("Enter home team score:");
    const awayScore = prompt("Enter away team score:");

    if (homeScore !== null && awayScore !== null) {
        try {
            await updateDoc(doc(db, "fixtures", fixtureId), {
                homeScore: parseInt(homeScore),
                awayScore: parseInt(awayScore),
                status: 'completed'
            });
            loadFixtures();
            updateStandings();
        } catch (error) {
            console.error("Error updating fixture score: ", error);
        }
    }
}

// Update standings
async function updateStandings() {
    const groupsSnapshot = await getDocs(collection(db, "groups"));
    const fixturesSnapshot = await getDocs(collection(db, "fixtures"));
    const clubs = await getClubs();

    const standings = {};

    groupsSnapshot.forEach((groupDoc) => {
        const groupId = groupDoc.id;
        const groupData = groupDoc.data();
        standings[groupId] = {};

        groupData.teams.forEach((teamId) => {
            standings[groupId][teamId] = {
                played: 0,
                won: 0,
                drawn: 0,
                lost: 0,
                goalsFor: 0,
                goalsAgainst: 0,
                points: 0
            };
        });
    });

    fixturesSnapshot.forEach((fixtureDoc) => {
        const fixture = fixtureDoc.data();
        if (fixture.status === 'completed') {
            const groupId = fixture.groupId;
            const homeTeam = fixture.homeTeam;
            const awayTeam = fixture.awayTeam;

            standings[groupId][homeTeam].played++;
            standings[groupId][awayTeam].played++;

            standings[groupId][homeTeam].goalsFor += fixture.homeScore;
            standings[groupId][homeTeam].goalsAgainst += fixture.awayScore;
            standings[groupId][awayTeam].goalsFor += fixture.awayScore;
            standings[groupId][awayTeam].goalsAgainst += fixture.homeScore;

            if (fixture.homeScore > fixture.awayScore) {
                standings[groupId][homeTeam].won++;
                standings[groupId][homeTeam].points += 3;
                standings[groupId][awayTeam].lost++;
            } else if (fixture.homeScore < fixture.awayScore) {
                standings[groupId][awayTeam].won++;
                standings[groupId][awayTeam].points += 3;
                standings[groupId][homeTeam].lost++;
            } else {
                standings[groupId][homeTeam].drawn++;
                standings[groupId][awayTeam].drawn++;
                standings[groupId][homeTeam].points++;
                standings[groupId][awayTeam].points++;
            }
        }
    });

    displayStandings(standings, clubs);
    checkGroupCompletion(standings);
}

// Display standings
function displayStandings(standings, clubs) {
    standingsList.innerHTML = '';
    for (const [groupId, groupStandings] of Object.entries(standings)) {
        const groupElement = document.createElement('div');
        groupElement.className = 'group-standings';
        groupElement.innerHTML = `<h3>Group ${groupId}</h3>`;

        const table = document.createElement('table');
        table.innerHTML = `
            <tr>
                <th>Team</th>
                <th>P</th>
                <th>W</th>
                <th>D</th>
                <th>L</th>
                <th>GF</th>
                <th>GA</th>
                <th>Pts</th>
            </tr>
        `;

        const sortedTeams = Object.entries(groupStandings).sort((a, b) => b[1].points - a[1].points);

        sortedTeams.forEach(([teamId, stats]) => {
            const row = table.insertRow();
            row.innerHTML = `
                <td>${clubs[teamId]}</td>
                <td>${stats.played}</td>
                <td>${stats.won}</td>
                <td>${stats.drawn}</td>
                <td>${stats.lost}</td>
                <td>${stats.goalsFor}</td>
                <td>${stats.goalsAgainst}</td>
                <td>${stats.points}</td>
            `;
        });

        groupElement.appendChild(table);
        standingsList.appendChild(groupElement);
    }
}

// Check if group stage is complete and initiate knockout stage
function checkGroupCompletion(standings) {
    for (const groupStandings of Object.values(standings)) {
        const teamsInGroup = Object.keys(groupStandings).length;
        const matchesPlayed = groupStandings[Object.keys(groupStandings)[0]].played;

        if (matchesPlayed === teamsInGroup - 1) {
            const sortedTeams = Object.entries(groupStandings).sort((a, b) => b[1].points - a[1].points);
            const topTwoTeams = sortedTeams.slice(0, 2).map(team => team[0]);
            initiateKnockoutStage(topTwoTeams);
        }
    }
}

 // Initiate knockout stage
 async function initiateKnockoutStage(qualifiedTeams) {
    // Check if knockout stage already exists
    const knockoutSnapshot = await getDocs(collection(db, "knockout_fixtures"));
    if (knockoutSnapshot.size > 0) {
        console.log("Knockout stage already initiated");
        return;
    }

    // Shuffle the qualified teams
    const shuffledTeams = qualifiedTeams.sort(() => 0.5 - Math.random());

    // Create round of 16 fixtures
    for (let i = 0; i < shuffledTeams.length; i += 2) {
        await addDoc(collection(db, "knockout_fixtures"), {
            stage: "Round of 16",
            homeTeam: shuffledTeams[i],
            awayTeam: shuffledTeams[i + 1],
            date: null,
            venue: null,
            homeScore: null,
            awayScore: null,
            winner: null,
            nextFixtureId: null,
            createdAt: serverTimestamp()
        });
    }

    loadKnockoutFixtures();
}

// Load knockout fixtures
async function loadKnockoutFixtures() {
    if (knockoutFixtures) {
        knockoutFixtures.innerHTML = '';
        const querySnapshot = await getDocs(collection(db, "knockout_fixtures"));
        const clubs = await getClubs();

        const fixtures = {
            "Round of 16": [],
            "Quarter-finals": [],
            "Semi-finals": [],
            "Final": []
        };

        querySnapshot.forEach((doc) => {
            const fixture = { id: doc.id, ...doc.data() };
            fixtures[fixture.stage].push(fixture);
        });

        for (const [stage, stageFixtures] of Object.entries(fixtures)) {
            const stageElement = document.createElement('div');
            stageElement.className = 'knockout-stage';
            stageElement.innerHTML = `<h3>${stage}</h3>`;

            stageFixtures.forEach((fixture) => {
                const fixtureElement = document.createElement('div');
                fixtureElement.className = 'knockout-fixture';
                fixtureElement.innerHTML = `
                    <p>${clubs[fixture.homeTeam]} vs ${clubs[fixture.awayTeam]}</p>
                    ${fixture.date ? `<p>Date: ${new Date(fixture.date).toLocaleString()}</p>` : ''}
                    ${fixture.venue ? `<p>Venue: ${fixture.venue}</p>` : ''}
                    ${fixture.homeScore !== null ? 
                        `<p>Score: ${fixture.homeScore} - ${fixture.awayScore}</p>` : 
                        `<button onclick="updateKnockoutFixture('${fixture.id}')" class="btn btn-primary">Update Fixture</button>`
                    }
                `;
                stageElement.appendChild(fixtureElement);
            });

            knockoutFixtures.appendChild(stageElement);
        }
    }
}

// Update knockout fixture
window.updateKnockoutFixture = async (fixtureId) => {
    const fixtureRef = doc(db, "knockout_fixtures", fixtureId);
    const fixtureSnap = await getDoc(fixtureRef);
    const fixture = fixtureSnap.data();

    const date = prompt("Enter fixture date (YYYY-MM-DD HH:MM):", fixture.date);
    const venue = prompt("Enter fixture venue:", fixture.venue);
    const homeScore = prompt("Enter home team score:");
    const awayScore = prompt("Enter away team score:");

    if (date && venue && homeScore !== null && awayScore !== null) {
        const winner = parseInt(homeScore) > parseInt(awayScore) ? fixture.homeTeam : fixture.awayTeam;

        try {
            await updateDoc(fixtureRef, {
                date: new Date(date).toISOString(),
                venue,
                homeScore: parseInt(homeScore),
                awayScore: parseInt(awayScore),
                winner
            });

            await advanceWinner(fixture.stage, winner, fixtureId);
            loadKnockoutFixtures();
        } catch (error) {
            console.error("Error updating knockout fixture: ", error);
        }
    }
}

// Advance winner to next stage
async function advanceWinner(currentStage, winner, currentFixtureId) {
    const nextStage = getNextStage(currentStage);
    if (!nextStage) return; // If it's the final, no need to advance

    const nextFixturesSnapshot = await getDocs(query(collection(db, "knockout_fixtures"), where("stage", "==", nextStage)));
    
    let nextFixture = nextFixturesSnapshot.docs.find(doc => !doc.data().homeTeam || !doc.data().awayTeam);

    if (!nextFixture) {
        // Create new fixture for the next stage
        const newFixtureRef = await addDoc(collection(db, "knockout_fixtures"), {
            stage: nextStage,
            homeTeam: winner,
            awayTeam: null,
            date: null,
            venue: null,
            homeScore: null,
            awayScore: null,
            winner: null,
            createdAt: serverTimestamp()
        });
        await updateDoc(doc(db, "knockout_fixtures", currentFixtureId), { nextFixtureId: newFixtureRef.id });
    } else {
        // Update existing fixture
        if (!nextFixture.data().homeTeam) {
            await updateDoc(doc(db, "knockout_fixtures", nextFixture.id), { homeTeam: winner });
        } else {
            await updateDoc(doc(db, "knockout_fixtures", nextFixture.id), { awayTeam: winner });
        }
        await updateDoc(doc(db, "knockout_fixtures", currentFixtureId), { nextFixtureId: nextFixture.id });
    }
}

// Get next stage
function getNextStage(currentStage) {
    const stages = ["Round of 16", "Quarter-finals", "Semi-finals", "Final"];
    const currentIndex = stages.indexOf(currentStage);
    return stages[currentIndex + 1] || null;
}

// Event listeners and initial loads
groupSelect.addEventListener('change', (e) => {
    loadClubsForGroup(e.target.value);
});

loadGroups();
loadFixtures();
updateStandings();
loadKnockoutFixtures();
});