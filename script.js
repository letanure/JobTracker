let originalData = [];

function initializeData() {
    const rows = document.querySelectorAll('#jobTableBody tr');
    originalData = Array.from(rows).map(row => row.innerHTML);
    updateStats();
}

function addRow() {
    const tbody = document.getElementById('jobTableBody');
    const newRow = tbody.insertRow(0);
    newRow.innerHTML = `
        <td><span class="priority priority-medium"></span>Medium</td>
        <td class="company-name"><input class="editable" placeholder="Company Name"></td>
        <td><input class="editable" placeholder="Position Title"></td>
        <td class="date"><input class="editable" type="date" value="${new Date().toISOString().split('T')[0]}"></td>
        <td><span class="status status-applied">Applied</span></td>
        <td><input class="editable" placeholder="Current Phase"></td>
        <td><span class="next-task"><input class="editable" placeholder="Next Task"></span></td>
        <td class="date"><input class="editable" type="date"></td>
        <td class="contact"><input class="editable" placeholder="Name & Email"></td>
        <td class="salary"><input class="editable" placeholder="Salary Range"></td>
        <td><input class="editable" placeholder="Location"></td>
        <td class="notes"><input class="editable" placeholder="Notes"></td>
        <td><button onclick="saveRow(this)">Save</button></td>
    `;
    updateStats();
}

function editRow(button) {
    const row = button.closest('tr');
    const cells = row.querySelectorAll('td');
    
    // Make cells editable (simplified for demo)
    alert('Edit functionality would be implemented here. In a real app, you would make cells editable or open a modal.');
}

function saveRow(button) {
    const row = button.closest('tr');
    // Save functionality would be implemented here
    button.textContent = 'Edit';
    button.onclick = function() { editRow(this); };
    updateStats();
}

function filterByStatus(status) {
    const rows = document.querySelectorAll('#jobTableBody tr');
    rows.forEach(row => {
        const statusCell = row.querySelector('.status');
        if (!status || statusCell.textContent.trim() === status) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function filterByPriority(priority) {
    const rows = document.querySelectorAll('#jobTableBody tr');
    rows.forEach(row => {
        const priorityCell = row.cells[0];
        if (!priority || priorityCell.textContent.trim() === priority) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function updateStats() {
    const rows = document.querySelectorAll('#jobTableBody tr:not([style*="display: none"])');
    let total = rows.length;
    let active = 0;
    let interviews = 0;
    let offers = 0;
    let rejections = 0;
    
    rows.forEach(row => {
        const status = row.querySelector('.status').textContent.trim();
        if (status !== 'Rejected' && status !== 'Withdrawn') active++;
        if (status.includes('Interview') || status === 'Final Round') interviews++;
        if (status === 'Offer') offers++;
        if (status === 'Rejected') rejections++;
    });
    
    document.getElementById('totalApps').textContent = total;
    document.getElementById('activeApps').textContent = active;
    document.getElementById('interviews').textContent = interviews;
    document.getElementById('offers').textContent = offers;
    document.getElementById('rejections').textContent = rejections;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeData);