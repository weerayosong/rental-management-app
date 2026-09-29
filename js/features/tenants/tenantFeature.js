import {
    getActiveTenant,
    createTenant,
    checkoutTenant,
} from "../../database/tenantsDB.js";
import { renderRoomGrid } from "../rooms/roomFeature.js"; // To refresh grid after check-in/out

/**
 * Renders the tenant section inside the room modal based on room status.
 * @param {string} roomId - The UUID of the room
 * @param {string} roomStatus - The current status of the room
 */
export async function renderTenantSection(roomId, roomStatus) {
    const container = document.getElementById("tenant-section-container");
    if (!container) return;

    container.innerHTML = "<p>Loading tenant information...</p>";

    if (roomStatus === "vacant") {
        // Render Check-In Form
        container.innerHTML = `
            <h4 style="margin-bottom: 1rem;">Check-In New Tenant</h4>
            <form id="checkin-form">
                <div class="form-group">
                    <label>First Name</label>
                    <input type="text" id="tenant-fname" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>Last Name</label>
                    <input type="text" id="tenant-lname" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>Phone Number</label>
                    <input type="text" id="tenant-phone" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>Citizen ID</label>
                    <input type="text" id="tenant-citizen-id" class="form-control" required>
                </div>
                <div style="display: flex; gap: 1rem;">
                    <div class="form-group" style="flex: 1;">
                        <label>Lease Start Date</label>
                        <input type="date" id="tenant-start" class="form-control" required>
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label>Lease End Date</label>
                        <input type="date" id="tenant-end" class="form-control" required>
                    </div>
                </div>
                <button type="submit" class="btn btn-primary" style="background-color: var(--color-vacant);">Check In Tenant</button>
            </form>
        `;

        document
            .getElementById("checkin-form")
            .addEventListener("submit", async (e) => {
                e.preventDefault();
                const submitBtn = e.target.querySelector("button");
                submitBtn.textContent = "Processing...";
                submitBtn.disabled = true;

                const tenantData = {
                    first_name: document.getElementById("tenant-fname").value,
                    last_name: document.getElementById("tenant-lname").value,
                    phone: document.getElementById("tenant-phone").value,
                    citizen_id:
                        document.getElementById("tenant-citizen-id").value,
                    lease_start_date:
                        document.getElementById("tenant-start").value,
                    lease_end_date: document.getElementById("tenant-end").value,
                };

                const success = await createTenant(tenantData, roomId);
                if (success) {
                    document.getElementById("close-modal-btn").click(); // Close Modal
                    await renderRoomGrid(); // Refresh UI
                } else {
                    alert("Failed to check in tenant.");
                    submitBtn.textContent = "Check In Tenant";
                    submitBtn.disabled = false;
                }
            });
    } else {
        // Fetch and display active tenant details
        const tenant = await getActiveTenant(roomId);

        if (tenant) {
            container.innerHTML = `
                <h4 style="margin-bottom: 1rem;">Current Tenant Information</h4>
                <div style="background: #F9FAFB; padding: 1rem; border-radius: 4px; margin-bottom: 1rem;">
                    <p><strong>Name:</strong> ${tenant.first_name} ${tenant.last_name}</p>
                    <p><strong>Phone:</strong> ${tenant.phone}</p>
                    <p><strong>Citizen ID:</strong> ${tenant.citizen_id}</p>
                    <p><strong>Contract:</strong> ${tenant.lease_start_date} to ${tenant.lease_end_date}</p>
                </div>
                <button id="checkout-btn" class="btn btn-primary" style="background-color: var(--color-overdue);">Check Out Tenant</button>
            `;

            document
                .getElementById("checkout-btn")
                .addEventListener("click", async (e) => {
                    if (
                        confirm(
                            "Are you sure you want to check out this tenant? The room will be set to vacant.",
                        )
                    ) {
                        e.target.textContent = "Processing...";
                        e.target.disabled = true;

                        const success = await checkoutTenant(tenant.id, roomId);
                        if (success) {
                            document.getElementById("close-modal-btn").click();
                            await renderRoomGrid();
                        } else {
                            alert("Failed to check out tenant.");
                            e.target.textContent = "Check Out Tenant";
                            e.target.disabled = false;
                        }
                    }
                });
        } else {
            container.innerHTML =
                "<p>No active tenant found for this room.</p>";
        }
    }
}
