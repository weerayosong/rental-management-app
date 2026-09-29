import {
    getRoomBills,
    createBill,
    markBillAsPaid,
} from "../../database/billingDB.js";
import { renderRoomGrid } from "../rooms/roomFeature.js"; // To refresh UI

// Utility rates for calculation
const ELECTRICITY_RATE = 8;
const WATER_RATE = 18;

export async function renderBillingSection(room) {
    const container = document.getElementById("billing-section-container");
    if (!container) return;

    // Only show billing section if room is occupied or overdue
    if (room.status === "vacant" || room.status === "maintenance") {
        container.innerHTML = "";
        return;
    }

    container.innerHTML = "<p>Loading billing data...</p>";

    const bills = await getRoomBills(room.id);
    const unpaidBills = bills.filter((b) => b.payment_status === "unpaid");

    // Generate HTML for Billing Section
    let html = `<h4 style="margin-bottom: 1rem;">Billing & Utilities</h4>`;

    // 1. Unpaid Bills List
    if (unpaidBills.length > 0) {
        html += `<div style="background-color: #FEF2F2; border: 1px solid #F87171; border-radius: 4px; padding: 1rem; margin-bottom: 1.5rem;">
            <h5 style="color: #B91C1C; margin-bottom: 0.5rem;">Unpaid Bills (${unpaidBills.length})</h5>`;

        unpaidBills.forEach((bill) => {
            const formattedTotal = Number(bill.total_amount).toLocaleString();
            html += `
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #FCA5A5; padding: 0.5rem 0;">
                    <div>
                        <strong>${bill.billing_month}</strong><br>
                        <small>Total: ฿${formattedTotal}</small>
                    </div>
                    <button class="btn pay-bill-btn" data-bill-id="${bill.id}" style="background-color: var(--color-vacant); color: white; padding: 0.25rem 0.75rem; width: auto; font-size: 0.875rem;">Mark Paid</button>
                </div>
            `;
        });
        html += `</div>`;
    } else {
        html += `<p style="color: var(--color-vacant); margin-bottom: 1.5rem;"><i class="fa-solid fa-check-circle"></i> All bills are paid.</p>`;
    }

    // 2. Generate New Bill Form
    html += `
        <h5 style="margin-bottom: 0.75rem;">Generate New Bill</h5>
        <form id="create-bill-form">
            <div class="form-group">
                <label>Billing Month (1st Day of Month)</label>
                <input type="date" id="bill-month" class="form-control" required>
            </div>
            
            <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
                <div class="form-group" style="flex: 1; margin: 0;">
                    <label>Prev Electricity</label>
                    <input type="number" id="prev-elec" class="form-control" required>
                </div>
                <div class="form-group" style="flex: 1; margin: 0;">
                    <label>Curr Electricity</label>
                    <input type="number" id="curr-elec" class="form-control" required>
                </div>
            </div>

            <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem;">
                <div class="form-group" style="flex: 1; margin: 0;">
                    <label>Prev Water</label>
                    <input type="number" id="prev-water" class="form-control" required>
                </div>
                <div class="form-group" style="flex: 1; margin: 0;">
                    <label>Curr Water</label>
                    <input type="number" id="curr-water" class="form-control" required>
                </div>
            </div>

            <button type="submit" class="btn btn-primary">Generate Bill</button>
        </form>
    `;

    container.innerHTML = html;

    // Attach Event Listeners for Pay Buttons
    document.querySelectorAll(".pay-bill-btn").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
            const billId = e.target.getAttribute("data-bill-id");
            e.target.textContent = "Processing...";
            e.target.disabled = true;

            const success = await markBillAsPaid(billId, room.id);
            if (success) {
                // Refresh modal and grid
                await renderRoomGrid();
                renderBillingSection(room);
            } else {
                alert("Failed to update payment status.");
                e.target.textContent = "Mark Paid";
                e.target.disabled = false;
            }
        });
    });

    // Attach Event Listener for Create Bill Form
    document
        .getElementById("create-bill-form")
        .addEventListener("submit", async (e) => {
            e.preventDefault();
            const submitBtn = e.target.querySelector('button[type="submit"]');
            submitBtn.textContent = "Calculating & Saving...";
            submitBtn.disabled = true;

            const prevElec = parseInt(
                document.getElementById("prev-elec").value,
            );
            const currElec = parseInt(
                document.getElementById("curr-elec").value,
            );
            const prevWater = parseInt(
                document.getElementById("prev-water").value,
            );
            const currWater = parseInt(
                document.getElementById("curr-water").value,
            );

            // Calculation Logic
            const elecUnits = currElec - prevElec;
            const waterUnits = currWater - prevWater;

            if (elecUnits < 0 || waterUnits < 0) {
                alert(
                    "Current meter values must be greater than or equal to previous values.",
                );
                submitBtn.textContent = "Generate Bill";
                submitBtn.disabled = false;
                return;
            }

            const elecCost = elecUnits * ELECTRICITY_RATE;
            const waterCost = waterUnits * WATER_RATE;
            const totalAmount = Number(room.base_price) + elecCost + waterCost;

            const billData = {
                billing_month: document.getElementById("bill-month").value,
                prev_electricity_meter: prevElec,
                curr_electricity_meter: currElec,
                prev_water_meter: prevWater,
                curr_water_meter: currWater,
                total_amount: totalAmount,
            };

            const success = await createBill(billData, room.id);
            if (success) {
                document.getElementById("close-modal-btn").click(); // Close Modal to let user see grid update
                await renderRoomGrid(); // Refresh Grid to show overdue red color
            } else {
                alert("Failed to generate bill.");
                submitBtn.textContent = "Generate Bill";
                submitBtn.disabled = false;
            }
        });
}
