import { fetchRooms, updateRoomStatus } from "../../database/roomsDB.js";

// Modal DOM Elements
let modalOverlay;
let closeModalBtn;
let updateStatusForm;
let roomStatusSelect;
let modalRoomIdInput;
let modalRoomTitle;

/**
 * Setup event listeners for the Room Details Modal
 */
export function initRoomModal() {
    modalOverlay = document.getElementById("room-modal");
    closeModalBtn = document.getElementById("close-modal-btn");
    updateStatusForm = document.getElementById("update-status-form");
    roomStatusSelect = document.getElementById("room-status-select");
    modalRoomIdInput = document.getElementById("modal-room-id");
    modalRoomTitle = document.getElementById("modal-room-title");

    if (!modalOverlay) return;

    // Close modal via button
    closeModalBtn.addEventListener("click", closeRoomModal);

    // Close modal by clicking outside the modal content
    modalOverlay.addEventListener("click", (e) => {
        if (e.target === modalOverlay) closeRoomModal();
    });

    // Handle status update submission
    updateStatusForm.addEventListener("submit", handleStatusUpdate);
}

/**
 * Opens the modal and populates it with the selected room's data
 * @param {Object} room - The room object from the database
 */
function openRoomModal(room) {
    modalRoomTitle.textContent = `Room ${room.room_number} Details`;
    modalRoomIdInput.value = room.id;
    roomStatusSelect.value = room.status;

    modalOverlay.classList.remove("hidden");
}

function closeRoomModal() {
    modalOverlay.classList.add("hidden");
}

/**
 * Handles the form submission to update room status
 */
async function handleStatusUpdate(e) {
    e.preventDefault(); // Prevent page reload

    const roomId = modalRoomIdInput.value;
    const newStatus = roomStatusSelect.value;

    // UI Feedback: Change button text while updating
    const submitBtn = updateStatusForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Updating...";
    submitBtn.disabled = true;

    // Call database module
    const success = await updateRoomStatus(roomId, newStatus);

    if (success) {
        closeRoomModal();
        // Re-render the grid to show the new status color dynamically
        await renderRoomGrid();
    } else {
        alert(
            "Failed to update room status. Please check console for details.",
        );
    }

    // Reset button state
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
}

/**
 * Initializes the room grid by fetching data and rendering DOM elements.
 */
export async function renderRoomGrid() {
    const gridContainer = document.getElementById("room-grid-container");
    if (!gridContainer) return;

    gridContainer.innerHTML =
        '<p style="grid-column: 1 / -1; text-align: center;">Loading property data...</p>';

    const rooms = await fetchRooms();

    if (rooms.length === 0) {
        gridContainer.innerHTML =
            '<p style="grid-column: 1 / -1; text-align: center; color: var(--color-overdue);">No rooms found or unable to connect to the database.</p>';
        return;
    }

    gridContainer.innerHTML = "";

    rooms.forEach((room) => {
        const roomCard = document.createElement("div");
        roomCard.className = "room-card";
        roomCard.setAttribute("data-status", room.status);

        const formattedPrice = Number(room.base_price).toLocaleString();

        roomCard.innerHTML = `
            <div class="room-header">
                <span class="room-number">${room.room_number}</span>
                <span class="room-floor">Fl. ${room.floor}</span>
            </div>
            <div class="room-status-badge">${room.status}</div>
            <div style="margin-top: 0.5rem; font-size: 0.875rem; color: var(--color-text-muted);">
                Rent: ฿${formattedPrice}
            </div>
        `;

        // Bind click event to open the modal
        roomCard.addEventListener("click", () => {
            openRoomModal(room);
        });

        gridContainer.appendChild(roomCard);
    });
}
