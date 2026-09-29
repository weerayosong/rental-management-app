import { renderRoomGrid } from "./features/rooms/roomFeature.js";

/**
 * Application Entry Point
 * Listens for DOM load to ensure all HTML elements are ready before executing scripts.
 */
document.addEventListener("DOMContentLoaded", () => {
    console.log("App successfully loaded. Initializing visual room grid...");

    // Execute the Phase 3 core feature
    renderRoomGrid();
});
