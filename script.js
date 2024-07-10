function deleteCategory(category) {
    const table = document.getElementById(`${category}-task-table`);
    if (table) {
        table.parentNode.remove();
        document.querySelector(`#category option[value="${category}"]`).remove();
        saveTasks();
    }
}

document.getElementById('task-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const category = document.getElementById('category').value;
    const task = document.getElementById('task').value;
    const progress = document.getElementById('progress').value;
    const status = document.getElementById('status').value;
    const priority = document.getElementById('priority').value;
    const deadline = document.getElementById('deadline').value;
    const assignee = document.getElementById('assignee').value;
    const sender = document.getElementById('sender').value;
    const editIndex = document.getElementById('edit-index').value;

    const tableId = getTableId(category);
    const table = document.getElementById(tableId).getElementsByTagName('tbody')[0];

    if (editIndex === '') {
        const newRow = table.insertRow();
        addCells(newRow, task, progress, status, priority, deadline, assignee, sender);
    } else {
        const row = table.rows[editIndex];
        updateCells(row, task, progress, status, priority, deadline, assignee, sender);
        document.getElementById('edit-index').value = '';
    }

    saveTasks();
    sortTable(table);
    document.getElementById('task-form').reset();
    checkWarnings();
});

function addCells(row, task, progress, status, priority, deadline, assignee, sender) {
    row.innerHTML = `
        <td>${task}</td>
        <td>${progress}%<div class="progress-bar" style="width: ${progress}%">${progress}%</div></td>
        <td>${status}</td>
        <td>${['高', '中', '低'][priority - 1]}</td>
        <td>${deadline}</td>
        <td style="${getAssigneeColor(assignee)}">${assignee}</td>
        <td>
            <button class="edit-button" onclick="editTask(${row.rowIndex - 1}, '${row.parentNode.parentNode.id}')">編集</button>
            <button class="delete-button" onclick="deleteTask(${row.rowIndex - 1}, '${row.parentNode.parentNode.id}')">削除</button>
            <button class="message-button" onclick="toggleMessageContainer(${row.rowIndex - 1}, '${row.parentNode.parentNode.id}')">メッセージ</button>
            <div class="message-container">
                <div class="message-header">メッセージ</div>
                <div class="message-form">
                    <textarea placeholder="ここにメッセージを入力..."></textarea>
                    <button onclick="sendMessage(this.previousElementSibling.value, this.parentNode.parentNode, '${sender}')">送信</button>
                </div>
                <ul class="message-list"></ul>
            </div>
        </td>
    `;
    updateRowStyle(row, progress, status, deadline);
}

function editTask(index, tableId) {
    const row = document.getElementById(tableId).rows[index + 1]; // +1 because of the header row

    document.getElementById('category').value = tableId.replace('-task-table', '');
    document.getElementById('task').value = row.cells[0].textContent;
    document.getElementById('progress').value = parseInt(row.cells[1].querySelector('.progress-bar').textContent);
    document.getElementById('status').value = row.cells[2].textContent;
    document.getElementById('priority').value = ['高', '中', '低'].indexOf(row.cells[3].textContent) + 1;
    document.getElementById('deadline').value = row.cells[4].textContent;
    document.getElementById('assignee').value = row.cells[5].textContent;
    document.getElementById('sender').value = '';
    document.getElementById('edit-index').value = index;
}

function deleteTask(index, tableId) {
    const table = document.getElementById(tableId).getElementsByTagName('tbody')[0];
    table.deleteRow(index);
    document.getElementById('edit-index').value = '';

    const category = tableId.replace('-task-table', '');
    if (!table.rows.length) {
        deleteCategory(category);
    }

    saveTasks();
    checkWarnings();
}

function deleteCategory(category) {
    const table = document.getElementById(`${category}-task-table`);
    if (table) {
        table.parentNode.remove();
        document.querySelector(`#category option[value="${category}"]`).remove();
        saveTasks();
    }
}

function filterTasks() {
    const searchInput = document.getElementById('search').value.toLowerCase();
    const tables = document.querySelectorAll('table');

    tables.forEach(table => {
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
            const taskName = row.cells[0].textContent.toLowerCase();
            const assigneeName = row.cells[5].textContent.toLowerCase();
            row.style.display = taskName.includes(searchInput) || assigneeName.includes(searchInput) ? '' : 'none';
        });
    });
}

function sortTable(table) {
    const rows = Array.from(table.rows).slice(1); // exclude header row

    rows.sort((a, b) => {
        const statusA = a.cells[2].textContent === '完了' ? 1 : 0;
        const statusB = b.cells[2].textContent === '完了' ? 1 : 0;

        if (statusA !== statusB) return statusA - statusB;

        const deadlineA = new Date(a.cells[4].textContent);
        const deadlineB = new Date(b.cells[4].textContent);
        return deadlineA - deadlineB;
    });

    rows.forEach(row => table.appendChild(row));
}

function getAssigneeColor(assignee) {
    const assigneeHash = assignee.split('').reduce((hash, char) => char.charCodeAt(0) + ((hash << 5) - hash), 0);
    const color = `hsl(${assigneeHash % 360}, 70%, 80%)`;
    return `background-color: ${color};`;
}

function toggleMessageContainer(index, tableId) {
    const row = document.getElementById(tableId).rows[index + 1]; // +1 because of the header row
    const messageContainer = row.querySelector('.message-container');
    messageContainer.style.display = messageContainer.style.display === 'none' ? 'block' : 'none';
}

function sendMessage(message, container, sender) {
    if (message && sender) {
        const messageList = container.querySelector('.message-list');
        const newMessage = document.createElement('li');
        newMessage.className = 'sender';
        newMessage.textContent = `${sender}: ${message}`;
        messageList.appendChild(newMessage);
        container.querySelector('textarea').value = '';
    } else {
        alert('メッセージと送信者を入力してください。');
    }
}

function checkWarnings() {
    const tables = document.querySelectorAll('table');
    let hasWarning = false;

    tables.forEach(table => {
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
            if (row.classList.contains('warning') || row.classList.contains('overdue')) hasWarning = true;
        });
    });

    document.getElementById('warning-message').style.display = hasWarning ? 'block' : 'none';
}
