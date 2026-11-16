
// ======================================
// PERSONAL WASTE TRACKER
// ======================================

// Get HTML elements
const wasteForm = document.getElementById("wasteForm");
const dateTimeInput = document.getElementById("dateTime");
const consistencyInput = document.getElementById("consistency");
const amountInput = document.getElementById("amount");
const notesInput = document.getElementById("notes");

const todayCount = document.getElementById("todayCount");
const weekCount = document.getElementById("weekCount");
const totalCount = document.getElementById("totalCount");
const historyContainer = document.getElementById("history");

// ======================================
// LOAD SAVED RECORDS
// ======================================

let records = [];

try {
    records = JSON.parse(localStorage.getItem("wasteRecords")) || [];
} catch (error) {
    console.error("Error loading records:", error);
    records = [];
}

// ======================================
// GET CURRENT LOCAL DATE AND TIME
// ======================================

function getLocalDateTime() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Set default date and time
dateTimeInput.value = getLocalDateTime();

// ======================================
// SAVE RECORDS TO LOCAL STORAGE
// ======================================

function saveData() {
    localStorage.setItem("wasteRecords", JSON.stringify(records));
}

// ======================================
// SAVE NEW RECORD
// ======================================

wasteForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const selectedDateTime = dateTimeInput.value;

    if (!selectedDateTime || !consistencyInput.value) {
        alert("Please complete the required fields.");
        return;
    }

    const newRecord = {
        id: Date.now(),
        dateTime: selectedDateTime,
        consistency: consistencyInput.value,
        amount: amountInput.value || "Not specified",
        notes: notesInput.value.trim()
    };

    // Add new record
    records.push(newRecord);

    // Save to browser storage
    saveData();

    // Update history and statistics immediately
    displayRecords();
    updateStatistics();

    // Reset form
    wasteForm.reset();

    // Restore current date and time
    dateTimeInput.value = getLocalDateTime();

    alert("Record saved successfully!");
});

// ======================================
// DISPLAY RECORD HISTORY
// ======================================

function displayRecords() {
    historyContainer.innerHTML = "";

    if (records.length === 0) {
        historyContainer.innerHTML =
            '<div class="empty">No records yet.</div>';
        return;
    }

    // Sort newest records first
    const sortedRecords = [...records].sort((a, b) => {
        return new Date(b.dateTime) - new Date(a.dateTime);
    });

    sortedRecords.forEach(function(record) {

        const recordCard = document.createElement("div");
        recordCard.className = "record-card";

        const recordInfo = document.createElement("div");
        recordInfo.className = "record-info";

        const date = new Date(record.dateTime);

        const dateText = document.createElement("h3");
        dateText.textContent = date.toLocaleString();

        const consistencyText = document.createElement("p");
        consistencyText.textContent =
            "Kahimtang sa Tae: " + record.consistency;

        const amountText = document.createElement("p");
        amountText.textContent = "Amount: " + record.amount;

        recordInfo.appendChild(dateText);
        recordInfo.appendChild(consistencyText);
        recordInfo.appendChild(amountText);

        if (record.notes) {
            const notesText = document.createElement("p");
            notesText.textContent = "Notes: " + record.notes;
            recordInfo.appendChild(notesText);
        }

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";

        deleteButton.addEventListener("click", function() {
            deleteRecord(record.id);
        });

        recordCard.appendChild(recordInfo);
        recordCard.appendChild(deleteButton);

        historyContainer.appendChild(recordCard);
    });
}

// ======================================
// DELETE RECORD
// ======================================

function deleteRecord(id) {

    if (confirm("Are you sure you want to delete this record?")) {

        records = records.filter(function(record) {
            return record.id !== id;
        });

        saveData();
        displayRecords();
        updateStatistics();
    }
}

// ======================================
// UPDATE STATISTICS
// ======================================

function updateStatistics() {

    const now = new Date();

    // Today's date in local time
    const today = getLocalDateTime().slice(0, 10);

    // Get Monday of the current week
    const startOfWeek = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    );

    const day = startOfWeek.getDay();

    const difference = day === 0 ? 6 : day - 1;

    startOfWeek.setDate(startOfWeek.getDate() - difference);

    const monday = startOfWeek.getFullYear() + "-" +
        String(startOfWeek.getMonth() + 1).padStart(2, "0") + "-" +
        String(startOfWeek.getDate()).padStart(2, "0");

    // Count today's records
    const todayRecords = records.filter(function(record) {
        return record.dateTime.slice(0, 10) === today;
    });

    // Count this week's records
    const weeklyRecords = records.filter(function(record) {
        const recordDate = record.dateTime.slice(0, 10);
        return recordDate >= monday && recordDate <= today;
    });

    // Display statistics
    todayCount.textContent = todayRecords.length;
    weekCount.textContent = weeklyRecords.length;
    totalCount.textContent = records.length;
}

// ======================================
// EXPORT RECORDS TO CSV
// ======================================

function exportCSV() {

    if (records.length === 0) {
        alert("No records available to export.");
        return;
    }

    const headers = [
        "Date and Time",
        "Consistency",
        "Amount",
        "Notes"
    ];

    const rows = records.map(function(record) {
        return [
            record.dateTime,
            record.consistency,
            record.amount,
            record.notes
        ];
    });

    function escapeCSV(value) {
        return '"' + String(value ?? "").replace(/"/g, '""') + '"';
    }

    const csvContent = [
        headers,
        ...rows
    ].map(function(row) {
        return row.map(escapeCSV).join(",");
    }).join("\n");

    const blob = new Blob(
        ["\uFEFF" + csvContent],
        { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "Bowel_Movement_Records.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}

// ======================================
// INITIAL DISPLAY WHEN PAGE LOADS
// ======================================

displayRecords();
updateStatistics();
