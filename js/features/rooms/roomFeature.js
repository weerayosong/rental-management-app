import { fetchRooms } from "../../database/roomsDB.js";

/**
 * Initializes the room grid by fetching data and rendering DOM elements.
 * Applies specific status colors based on the single source of truth (database).
 */
export async function renderRoomGrid() {
    const gridContainer = document.getElementById("room-grid-container");
    if (!gridContainer) return;

    // Display a simple loading state
    gridContainer.innerHTML =
        '<p style="grid-column: 1 / -1; text-align: center;">Loading property data...</p>';

    // Fetch data from the database module
    const rooms = await fetchRooms();

    // Handle empty state or error state
    if (rooms.length === 0) {
        gridContainer.innerHTML =
            '<p style="grid-column: 1 / -1; text-align: center; color: var(--color-overdue);">No rooms found or unable to connect to the database.</p>';
        return;
    }

    // Clear loading state
    gridContainer.innerHTML = "";

    // Generate HTML for each room block
    rooms.forEach((room) => {
        const roomCard = document.createElement("div");
        roomCard.className = "room-card";

        // This data attribute triggers the dynamic CSS colors defined in grid.css
        roomCard.setAttribute("data-status", room.status);

        // Format price to include commas (e.g., 5,000)
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

        // Placeholder for Phase 4: Modal interaction
        roomCard.addEventListener("click", () => {
            console.log(
                `Room ${room.room_number} clicked. Phase 4 Modal logic will be implemented here.`,
            );
        });

        gridContainer.appendChild(roomCard);
    });
}
