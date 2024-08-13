import { db } from './firebase-config.js';
import { 
    collection, addDoc, getDocs, doc, updateDoc, deleteDoc, serverTimestamp, arrayUnion, arrayRemove
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    const groupForm = document.getElementById('group-form');
    const groupsList = document.getElementById('groups-list');

    // Create a new group
    groupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const groupName = document.getElementById('group-name').value;

        try {
            await addDoc(collection(db, "groups"), {
                name: groupName,
                teams: [],
                createdAt: serverTimestamp()
            });
            showMessage(`Group "${groupName}" created successfully`);
            groupForm.reset();
            loadGroups();
        } catch (error) {
            console.error("Error adding group: ", error);
            showMessage(`Error creating group: ${error.message}`, true);
        }
    });

    // Load and display groups
    async function loadGroups() {
        groupsList.innerHTML = '';
        try {
            const groupsSnapshot = await getDocs(collection(db, "groups"));
            const allTeams = await getAllTeams();
            const assignedTeams = new Set();

            groupsSnapshot.forEach((groupDoc) => {
                const group = groupDoc.data();
                group.teams.forEach(teamId => assignedTeams.add(teamId));
                
                const groupElement = document.createElement('div');
                groupElement.className = 'group-item';
                groupElement.innerHTML = `
                    <h3>${group.name}</h3>
                    <p>Teams: ${group.teams.length}</p>
                    <select id="team-select-${groupDoc.id}" class="team-select">
                        <option value="">Select Team</option>
                    </select>
                    <div class="button-group">
                        <button onclick="addTeamToGroup('${groupDoc.id}')" class="btn btn-add"><i class="fas fa-plus"></i> Add Team</button>
                        <button onclick="editGroup('${groupDoc.id}', '${group.name}')" class="btn btn-edit"><i class="fas fa-edit"></i> Edit</button>
                        <button onclick="deleteGroup('${groupDoc.id}')" class="btn btn-delete"><i class="fas fa-trash"></i> Delete</button>
                    </div>
                    <ul id="team-list-${groupDoc.id}" class="team-list"></ul>
                `;
                groupsList.appendChild(groupElement);
                
                const teamSelect = groupElement.querySelector(`#team-select-${groupDoc.id}`);
                allTeams.forEach(team => {
                    if (!assignedTeams.has(team.id) && !group.teams.includes(team.id)) {
                        const option = new Option(team.name, team.id);
                        teamSelect.add(option);
                    }
                });
                
                loadTeamsForGroup(groupDoc.id, group.teams);
            });
        } catch (error) {
            console.error("Error loading groups: ", error);
            showMessage(`Error loading groups: ${error.message}`, true);
        }
    }

    // Get all teams
    async function getAllTeams() {
        const teamsSnapshot = await getDocs(collection(db, "clubs"));
        return teamsSnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
    }

    // Load teams for a specific group
    async function loadTeamsForGroup(groupId, groupTeams) {
        const teamList = document.getElementById(`team-list-${groupId}`);
        teamList.innerHTML = '';

        try {
            const teamsSnapshot = await getDocs(collection(db, "clubs"));
            const teamsMap = new Map(teamsSnapshot.docs.map(doc => [doc.id, doc.data().name]));

            groupTeams.forEach((teamId) => {
                const li = document.createElement('li');
                li.className = 'team-item';
                li.innerHTML = `
                    <span>${teamsMap.get(teamId) || 'Unknown Team'}</span>
                    <button onclick="removeTeamFromGroup('${groupId}', '${teamId}')" class="btn btn-remove"><i class="fas fa-times"></i> Remove</button>
                `;
                teamList.appendChild(li);
            });
        } catch (error) {
            console.error("Error loading teams for group: ", error);
            showMessage(`Error loading teams for group: ${error.message}`, true);
        }
    }

    // Add team to group
    window.addTeamToGroup = async (groupId) => {
        const teamSelect = document.getElementById(`team-select-${groupId}`);
        const teamId = teamSelect.value;
        if (!teamId) return;

        try {
            const groupRef = doc(db, "groups", groupId);
            await updateDoc(groupRef, {
                teams: arrayUnion(teamId)
            });
            showMessage("Team added to group successfully");
            loadGroups();
        } catch (error) {
            console.error("Error adding team to group: ", error);
            showMessage(`Error adding team to group: ${error.message}`, true);
        }
    };

    // Remove team from group
    window.removeTeamFromGroup = async (groupId, teamId) => {
        try {
            const groupRef = doc(db, "groups", groupId);
            await updateDoc(groupRef, {
                teams: arrayRemove(teamId)
            });
            showMessage("Team removed from group successfully");
            loadGroups();
        } catch (error) {
            console.error("Error removing team from group: ", error);
            showMessage(`Error removing team from group: ${error.message}`, true);
        }
    };

    // Edit group
    window.editGroup = async (groupId, currentName) => {
        const newName = prompt("Enter new group name:", currentName);
        if (newName && newName !== currentName) {
            try {
                await updateDoc(doc(db, "groups", groupId), { name: newName });
                showMessage(`Group updated successfully to "${newName}"`);
                loadGroups();
            } catch (error) {
                console.error("Error updating group: ", error);
                showMessage(`Error updating group: ${error.message}`, true);
            }
        }
    };

    // Delete group
    window.deleteGroup = async (groupId) => {
        if (confirm("Are you sure you want to delete this group?")) {
            try {
                await deleteDoc(doc(db, "groups", groupId));
                showMessage("Group deleted successfully");
                loadGroups();
            } catch (error) {
                console.error("Error deleting group: ", error);
                showMessage(`Error deleting group: ${error.message}`, true);
            }
        }
    };

    // Helper function for showing messages
    function showMessage(message, isError = false) {
        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        messageElement.className = isError ? 'message error' : 'message success';
        document.body.insertBefore(messageElement, document.body.firstChild);
        setTimeout(() => messageElement.remove(), 5000);
    }

    // Initial load
    loadGroups();
});
