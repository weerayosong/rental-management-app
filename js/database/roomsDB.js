import { supabase } from "../config/supabase.js";

/**
 * Fetch all rooms from the Supabase database.
 * Orders the result by room_number to maintain consistent UI rendering.
 *
 * @returns {Promise<Array>} Array of room objects, or empty array if failed
 */
export async function fetchRooms() {
    try {
        const { data, error } = await supabase
            .from("rooms")
            .select("*")
            .order("room_number", { ascending: true });

        if (error) {
            throw error;
        }

        return data;
    } catch (error) {
        console.error("Database Error - Failed to fetch rooms:", error.message);
        return [];
    }
}

/**
 * Updates the status of a specific room.
 * @param {string} roomId - The UUID of the room
 * @param {string} newStatus - The new status to set
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
export async function updateRoomStatus(roomId, newStatus) {
    try {
        const { error } = await supabase
            .from("rooms")
            .update({ status: newStatus })
            .eq("id", roomId);

        if (error) {
            throw error;
        }

        return true;
    } catch (error) {
        console.error(
            "Database Error - Failed to update room status:",
            error.message,
        );
        return false;
    }
}
