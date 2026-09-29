import { supabase } from "../config/supabase.js";

/**
 * Fetch the currently active tenant for a specific room.
 * @param {string} roomId - The UUID of the room
 * @returns {Promise<Object|null>} Tenant object if found, otherwise null
 */
export async function getActiveTenant(roomId) {
    try {
        const { data, error } = await supabase
            .from("tenants")
            .select("*")
            .eq("room_id", roomId)
            .eq("is_active", true)
            .maybeSingle(); // We expect only one active tenant per room

        // PGRST116 means no rows returned, which is normal for a vacant room
        if (error && error.code !== "PGRST116") throw error;

        return data || null;
    } catch (error) {
        console.error(
            "Database Error - Failed to fetch active tenant:",
            error.message,
        );
        return null;
    }
}

/**
 * Creates a new tenant record and automatically updates the room status to 'occupied'.
 * @param {Object} tenantData - Object containing tenant details
 * @param {string} roomId - The UUID of the room
 * @returns {Promise<boolean>} True if successful
 */
export async function createTenant(tenantData, roomId) {
    try {
        // 1. Insert new tenant record
        const { error: tenantError } = await supabase
            .from("tenants")
            .insert([{ ...tenantData, room_id: roomId, is_active: true }]);

        if (tenantError) throw tenantError;

        // 2. Update room status to occupied
        const { error: roomError } = await supabase
            .from("rooms")
            .update({ status: "occupied" })
            .eq("id", roomId);

        if (roomError) throw roomError;

        return true;
    } catch (error) {
        console.error(
            "Database Error - Failed to create tenant:",
            error.message,
        );
        return false;
    }
}

/**
 * Checks out a tenant by setting is_active to false and reverting room status to vacant.
 * @param {string} tenantId - The UUID of the tenant
 * @param {string} roomId - The UUID of the room
 * @returns {Promise<boolean>} True if successful
 */
export async function checkoutTenant(tenantId, roomId) {
    try {
        // 1. Deactivate the tenant record (keep room_id for history, just set is_active to false)
        const { error: tenantError } = await supabase
            .from("tenants")
            .update({ is_active: false })
            .eq("id", tenantId);

        if (tenantError) throw tenantError;

        // 2. Set room back to vacant
        const { error: roomError } = await supabase
            .from("rooms")
            .update({ status: "vacant" })
            .eq("id", roomId);

        if (roomError) throw roomError;

        return true;
    } catch (error) {
        console.error(
            "Database Error - Failed to checkout tenant:",
            error.message,
        );
        return false;
    }
}
