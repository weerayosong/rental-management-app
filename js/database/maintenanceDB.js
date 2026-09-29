import { supabase } from "../config/supabase.js";

export async function getRoomMaintenance(roomId) {
    try {
        const { data, error } = await supabase
            .from("maintenance")
            .select("*")
            .eq("room_id", roomId)
            .order("created_at", { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error(
            "Database Error - Failed to fetch maintenance logs:",
            error.message,
        );
        return [];
    }
}

export async function createMaintenanceTicket(ticketData, roomId) {
    try {
        const { error } = await supabase
            .from("maintenance")
            .insert([{ ...ticketData, room_id: roomId }]);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error(
            "Database Error - Failed to create maintenance ticket:",
            error.message,
        );
        return false;
    }
}

export async function updateTicketStatus(ticketId, newStatus) {
    try {
        const { error } = await supabase
            .from("maintenance")
            .update({ status: newStatus })
            .eq("id", ticketId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error(
            "Database Error - Failed to update ticket status:",
            error.message,
        );
        return false;
    }
}
