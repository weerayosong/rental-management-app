import { supabase } from "../config/supabase.js";

export async function getRoomBills(roomId) {
    try {
        const { data, error } = await supabase
            .from("billing")
            .select("*")
            .eq("room_id", roomId)
            .order("billing_month", { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error("Database Error - Failed to fetch bills:", error.message);
        return [];
    }
}

export async function createBill(billData, roomId) {
    try {
        // 1. Insert new bill
        const { error: billError } = await supabase
            .from("billing")
            .insert([
                { ...billData, room_id: roomId, payment_status: "unpaid" },
            ]);

        if (billError) throw billError;

        // 2. Automatically update room status to 'overdue'
        const { error: roomError } = await supabase
            .from("rooms")
            .update({ status: "overdue" })
            .eq("id", roomId);

        if (roomError) throw roomError;

        return true;
    } catch (error) {
        console.error("Database Error - Failed to create bill:", error.message);
        return false;
    }
}

export async function markBillAsPaid(billId, roomId) {
    try {
        // 1. Update bill status
        const { error: billError } = await supabase
            .from("billing")
            .update({
                payment_status: "paid",
                paid_at: new Date().toISOString(),
            })
            .eq("id", billId);

        if (billError) throw billError;

        // 2. Check if there are any other unpaid bills left for this room
        const { data: unpaidBills, error: checkError } = await supabase
            .from("billing")
            .select("id")
            .eq("room_id", roomId)
            .eq("payment_status", "unpaid");

        if (checkError) throw checkError;

        // 3. If no unpaid bills left, revert room status back to 'occupied'
        if (unpaidBills.length === 0) {
            const { error: roomError } = await supabase
                .from("rooms")
                .update({ status: "occupied" })
                .eq("id", roomId);

            if (roomError) throw roomError;
        }

        return true;
    } catch (error) {
        console.error(
            "Database Error - Failed to update bill status:",
            error.message,
        );
        return false;
    }
}
