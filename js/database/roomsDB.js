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
