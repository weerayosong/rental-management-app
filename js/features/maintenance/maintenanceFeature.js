import {
    getRoomMaintenance,
    createMaintenanceTicket,
    updateTicketStatus,
} from "../../database/maintenanceDB.js";

export async function renderMaintenanceSection(room) {
    const container = document.getElementById("maintenance-section-container");
    if (!container) return;

    container.innerHTML = "<p>Loading maintenance logs...</p>";

    const tickets = await getRoomMaintenance(room.id);

    // Filter out completed tickets to only show active issues
    const activeTickets = tickets.filter((t) => t.status !== "completed");

    let html = `<h4 style="margin-bottom: 1rem;">Maintenance Logs</h4>`;

    // 1. Active Tickets List
    if (activeTickets.length > 0) {
        html += `<div style="background-color: #FFFBEB; border: 1px solid #FCD34D; border-radius: 4px; padding: 1rem; margin-bottom: 1.5rem;">
            <h5 style="color: #D97706; margin-bottom: 0.5rem;">Active Issues (${activeTickets.length})</h5>`;

        activeTickets.forEach((ticket) => {
            html += `
                <div style="border-bottom: 1px solid #FDE68A; padding: 0.75rem 0; display: flex; flex-direction: column; gap: 0.5rem;">
                    <div>
                        <strong>${ticket.title}</strong>
                        <p style="font-size: 0.875rem; color: var(--color-text-muted); margin-top: 0.25rem;">${ticket.details || "No details provided."}</p>
                    </div>
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <span style="font-size: 0.75rem; font-weight: bold; color: var(--color-maintenance); text-transform: capitalize;">
                            Current: ${ticket.status.replace("_", " ")}
                        </span>
                        <select class="form-control update-ticket-status" data-ticket-id="${ticket.id}" style="width: auto; padding: 0.25rem; font-size: 0.875rem;">
                            <option value="" disabled selected>Update Status</option>
                            ${ticket.status === "pending" ? '<option value="in_progress">Mark In Progress</option>' : ""}
                            <option value="completed">Mark Completed</option>
                        </select>
                    </div>
                </div>
            `;
        });
        html += `</div>`;
    } else {
        html += `<p style="color: var(--color-text-muted); margin-bottom: 1.5rem;"><i class="fa-solid fa-wrench"></i> No active maintenance issues.</p>`;
    }

    // 2. Create Ticket Form
    html += `
        <h5 style="margin-bottom: 0.75rem;">Log New Issue</h5>
        <form id="create-ticket-form">
            <div class="form-group">
                <label>Issue Title</label>
                <input type="text" id="ticket-title" class="form-control" placeholder="e.g., Broken Air Conditioner" required>
            </div>
            <div class="form-group">
                <label>Details</label>
                <textarea id="ticket-details" class="form-control" rows="2" placeholder="Describe the issue..."></textarea>
            </div>
            <button type="submit" class="btn btn-primary" style="background-color: var(--color-maintenance); color: #fff;">Submit Ticket</button>
        </form>
    `;

    container.innerHTML = html;

    // Attach Event Listeners for Status Dropdown
    document.querySelectorAll(".update-ticket-status").forEach((select) => {
        select.addEventListener("change", async (e) => {
            const ticketId = e.target.getAttribute("data-ticket-id");
            const newStatus = e.target.value;
            e.target.disabled = true;

            const success = await updateTicketStatus(ticketId, newStatus);
            if (success) {
                // Refresh just the maintenance section to hide it if completed
                renderMaintenanceSection(room);
            } else {
                alert("Failed to update ticket status.");
                e.target.disabled = false;
            }
        });
    });

    // Attach Event Listener for Create Ticket Form
    document
        .getElementById("create-ticket-form")
        .addEventListener("submit", async (e) => {
            e.preventDefault();
            const submitBtn = e.target.querySelector('button[type="submit"]');
            submitBtn.textContent = "Saving...";
            submitBtn.disabled = true;

            const ticketData = {
                title: document.getElementById("ticket-title").value,
                details: document.getElementById("ticket-details").value,
                status: "pending",
            };

            const success = await createMaintenanceTicket(ticketData, room.id);
            if (success) {
                renderMaintenanceSection(room); // Refresh section to show the new ticket
            } else {
                alert("Failed to create ticket.");
                submitBtn.textContent = "Submit Ticket";
                submitBtn.disabled = false;
            }
        });
}
