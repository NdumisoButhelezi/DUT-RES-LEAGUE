import { db } from './firebase-config.js';
import { 
    collection, addDoc, getDocs, doc, updateDoc, deleteDoc, serverTimestamp, query, where 
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    const generateGroupFixturesBtn = document.getElementById('generate-group-fixtures');
    const generateKnockoutFixturesBtn = document.getElementById('generate-knockout-fixtures');
    const fixturesList = document.getElementById('fixtures-list');

    generateGroupFixturesBtn.addEventListener('click', generateGroupFixtures);
    generateKnockoutFixturesBtn.addEventListener('click', generateKnockoutFixtures);

    async function generateGroupFixtures() {
        try {
            const groupsSnapshot = await getDocs(collection(db, "groups"));
            for (const groupDoc of groupsSnapshot.docs) {
                const group = groupDoc.data();
                const teams = group.teams;
                const fixtures = createRoundRobinFixtures(teams);
                
                for (const fixture of fixtures) {
                    await addDoc(collection(db, "fixtures"), {
                        groupId: groupDoc.id,
                        homeTeam: fixture.homeTeam,
                        awayTeam: fixture.awayTeam,
                        date: null,
                        venue: null,
                        stage: 'group',
                        status: 'scheduled',
                        createdAt: serverTimestamp()
                    });
                }
            }
            showMessage("Group fixtures generated successfully");
            loadFixtures();
        } catch (error) {
            console.error("Error generating group fixtures: ", error);
            showMessage(`Error generating group fixtures: ${error.message}`, true);
        }
    }

    function createRoundRobinFixtures(teams) {
        const fixtures = [];
        for (let i = 0; i < teams.length; i++) {
            for (let j = i + 1; j < teams.length; j++) {
                fixtures.push({ homeTeam: teams[i], awayTeam: teams[j] });
                fixtures.push({ homeTeam: teams[j], awayTeam: teams[i] });
            }
        }
        return fixtures;
    }

    async function generateKnockoutFixtures() {
        try {
            // Assuming top 2 teams from each group qualify for knockout stage
            const groupsSnapshot = await getDocs(collection(db, "groups"));
            const qualifiedTeams = [];
            
            for (const groupDoc of groupsSnapshot.docs) {
                const group = groupDoc.data();
                // Here you would typically sort teams based on their performance in the group stage
                // For simplicity, we're just taking the first two teams from each group
                qualifiedTeams.push(...group.teams.slice(0, 2));
            }

            // Shuffle the qualified teams
            const shuffledTeams = qualifiedTeams.sort(() => 0.5 - Math.random());

            // Generate fixtures for the first knockout round
            for (let i = 0; i < shuffledTeams.length; i += 2) {
                await addDoc(collection(db, "fixtures"), {
                    homeTeam: shuffledTeams[i],
                    awayTeam: shuffledTeams[i + 1],
                    date: null,
                    venue: null,
                    stage: 'knockout',
                    round: 'Round of 16', // Adjust based on the number of teams
                    status: 'scheduled',
                    createdAt: serverTimestamp()
                });
            }

            showMessage("Knockout fixtures generated successfully");
            loadFixtures();
        } catch (error) {
            console.error("Error generating knockout fixtures: ", error);
            showMessage(`Error generating knockout fixtures: ${error.message}`, true);
        }
    }

    async function loadFixtures() {
        fixturesList.innerHTML = '';
        try {
            const fixturesSnapshot = await getDocs(collection(db, "fixtures"));
            const teamsSnapshot = await getDocs(collection(db, "clubs"));
            const teamsMap = new Map(teamsSnapshot.docs.map(doc => [doc.id, doc.data().name]));

            fixturesSnapshot.forEach((doc) => {
                const fixture = doc.data();
                const fixtureElement = document.createElement('div');
                fixtureElement.className = 'fixture-item';
                fixtureElement.innerHTML = `
                    <p>${teamsMap.get(fixture.homeTeam)} vs ${teamsMap.get(fixture.awayTeam)}</p>
                    <p>Stage: ${fixture.stage}, Status: ${fixture.status}</p>
                    ${fixture.date ? `<p>Date: ${new Date(fixture.date).toLocaleString()}</p>` : ''}
                    ${fixture.venue ? `<p>Venue: ${fixture.venue}</p>` : ''}
                    <button onclick="editFixture('${doc.id}')">Edit</button>
                    <button onclick="deleteFixture('${doc.id}')">Delete</button>
                `;
                fixturesList.appendChild(fixtureElement);
            });
        } catch (error) {
            console.error("Error loading fixtures: ", error);
            showMessage(`Error loading fixtures: ${error.message}`, true);
        }
    }

    window.editFixture = async (fixtureId) => {
        // Implement edit functionality
        console.log("Edit fixture:", fixtureId);
    };

    window.deleteFixture = async (fixtureId) => {
        if (confirm("Are you sure you want to delete this fixture?")) {
            try {
                await deleteDoc(doc(db, "fixtures", fixtureId));
                showMessage("Fixture deleted successfully");
                loadFixtures();
            } catch (error) {
                console.error("Error deleting fixture: ", error);
                showMessage(`Error deleting fixture: ${error.message}`, true);
            }
        }
    };

    function showMessage(message, isError = false) {
        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        messageElement.style.padding = '10px';
        messageElement.style.marginBottom = '10px';
        messageElement.style.backgroundColor = isError ? '#ffcccc' : '#ccffcc';
        document.body.insertBefore(messageElement, document.body.firstChild);
        setTimeout(() => messageElement.remove(), 5000);
    }

    // Initial load
    loadFixtures();
});