// js/club-management.js
import { db } from './firebase-config.js';
import { 
    collection, addDoc, getDocs, doc, updateDoc, deleteDoc, serverTimestamp, query, where 
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    const clubForm = document.getElementById('club-form');
    const clubsList = document.getElementById('clubs-list');
    const playersContainer = document.getElementById('players-container');

    if (clubForm) {
        // Create a new club
        clubForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const clubName = document.getElementById('club-name').value;
            const coachId = document.getElementById('coach-id').value;

            try {
                await addDoc(collection(db, "clubs"), {
                    name: clubName,
                    coachId: coachId,
                    players: [],
                    createdAt: serverTimestamp()
                });
                clubForm.reset();
                loadClubs();
            } catch (error) {
                console.error("Error adding club: ", error);
            }
        });
    }

    // Read clubs
    async function loadClubs() {
        if (clubsList) {
            clubsList.innerHTML = '';
            const querySnapshot = await getDocs(collection(db, "clubs"));
            querySnapshot.forEach((doc) => {
                const club = doc.data();
                const clubElement = document.createElement('div');
                clubElement.className = 'club-item';
                clubElement.innerHTML = `
                    <h3>${club.name}</h3>
                    <p><strong>Coach ID:</strong> ${club.coachId}</p>
                    <p><strong>Players:</strong> ${club.players.length}</p>
                    <div class="button-group">
                        <button onclick="editClub('${doc.id}')" class="btn btn-secondary"><i class="fas fa-edit"></i> Edit</button>
                        <button onclick="deleteClub('${doc.id}')" class="btn btn-danger"><i class="fas fa-trash-alt"></i> Delete</button>
                    </div>
                `;
                clubsList.appendChild(clubElement);
            });
        }
    }

    // Update a club
    window.editClub = async (clubId) => {
        const clubDoc = await doc(db, "clubs", clubId);
        const clubSnapshot = await clubDoc.get();
        const club = clubSnapshot.data();

        const newName = prompt("Enter new club name:", club.name);
        const newCoachId = prompt("Enter new coach ID:", club.coachId);

        if (newName && newCoachId) {
            try {
                await updateDoc(clubDoc, {
                    name: newName,
                    coachId: newCoachId
                });
                loadClubs();
            } catch (error) {
                console.error("Error updating club: ", error);
            }
        }
    }

    // Delete a club
    window.deleteClub = async (clubId) => {
        if (confirm("Are you sure you want to delete this club?")) {
            try {
                await deleteDoc(doc(db, "clubs", clubId));
                loadClubs();
            } catch (error) {
                console.error("Error deleting club: ", error);
            }
        }
    }

    // Load players for each club
    async function loadPlayers() {
        if (playersContainer) {
            playersContainer.innerHTML = '';
            const clubsSnapshot = await getDocs(collection(db, "clubs"));
            for (const clubDoc of clubsSnapshot.docs) {
                const club = clubDoc.data();
                const clubElement = document.createElement('div');
                clubElement.className = 'club-players';
                clubElement.innerHTML = `<h3>${club.name}</h3>`;
                
                const playersQuery = query(collection(db, "users"), where("role", "==", "player"));
                const playersSnapshot = await getDocs(playersQuery);
                const playersList = document.createElement('ul');
                
                let playersCount = 0;
                playersSnapshot.forEach((playerDoc) => {
                    const player = playerDoc.data();
                    if (club.players.includes(playerDoc.id)) {
                        const playerItem = document.createElement('li');
                        playerItem.innerHTML = `
                            <span>${player.name || player.email}</span>
                            <button onclick="removePlayer('${clubDoc.id}', '${playerDoc.id}')" class="btn btn-danger btn-sm"><i class="fas fa-user-minus"></i></button>
                        `;
                        playersList.appendChild(playerItem);
                        playersCount++;
                    }
                });
                
                if (playersCount === 0) {
                    clubElement.innerHTML += '<p>No players in this club.</p>';
                } else {
                    clubElement.appendChild(playersList);
                }

                const addPlayerButton = document.createElement('button');
                addPlayerButton.className = 'btn btn-primary';
                addPlayerButton.innerHTML = '<i class="fas fa-user-plus"></i> Add Player';
                addPlayerButton.onclick = () => addPlayer(clubDoc.id);
                clubElement.appendChild(addPlayerButton);

                playersContainer.appendChild(clubElement);
            }
        }
    }

    // Add a player to a club
    window.addPlayer = async (clubId) => {
        const playerEmail = prompt("Enter player's email:");
        if (playerEmail) {
            try {
                const usersQuery = query(collection(db, "users"), where("email", "==", playerEmail), where("role", "==", "player"));
                const userSnapshot = await getDocs(usersQuery);
                
                if (!userSnapshot.empty) {
                    const playerDoc = userSnapshot.docs[0];
                    const clubDoc = doc(db, "clubs", clubId);
                    await updateDoc(clubDoc, {
                        players: arrayUnion(playerDoc.id)
                    });
                    loadPlayers();
                } else {
                    alert("Player not found or not registered as a player.");
                }
            } catch (error) {
                console.error("Error adding player: ", error);
            }
        }
    }

    // Remove a player from a club
    window.removePlayer = async (clubId, playerId) => {
        if (confirm("Are you sure you want to remove this player from the club?")) {
            try {
                const clubDoc = doc(db, "clubs", clubId);
                await updateDoc(clubDoc, {
                    players: arrayRemove(playerId)
                });
                loadPlayers();
            } catch (error) {
                console.error("Error removing player: ", error);
            }
        }
    }

    // Initial load
    loadClubs();
    loadPlayers();
});
