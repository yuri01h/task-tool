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

    sortTable(table);
    document.getElementById('task-form').reset();
    checkWarnings();
});

function addCategory() {
    const newCategory = document.getElementById('new-category').value;
    if (newCategory) {
        const categorySelect = document.getElementById('category');
        const newOption = document.createElement('option');
        newOption.value = newCategory;
        newOption.text = newCategory;
        categorySelect.appendChild(newOption);
        categorySelect.value = newCategory;
        document.getElementById('new-category').value = '';

        const taskSections = document.getElementById('task-sections');
        const newSection = document.createElement('div');
        const newSectionTitle = document.createElement('h2');
        newSectionTitle.textContent = newCategory;
        newSection.appendChild(newSectionTitle);

        const newTable = document.createElement('table');
        newTable.id = `${newCategory}-task-table`;
        newTable.innerHTML = `
            <thead>
                <tr>
                    <th>タスク</th>
                    <th>進捗</th>
                    <th>ステータス</th>
                    <th>優先順位</th>
                    <th>期日</th>
                    <th>担当者</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
        newSection.appendChild(newTable);
        taskSections.appendChild(newSection);
    }
}

function getTableId(category) {
    switch (category) {
        case '労務':
            return 'labor-task-table';
        case '総務':
            return 'general-task-table';
        default:
            return `${category}-task-table`;
    }
}

function addCells(row, task, progress, status, priority, deadline, assignee, sender) {
    const taskCell = row.insertCell(0);
    const progressCell = row.insertCell(1);
    const statusCell = row.insertCell(2);
    const priorityCell = row.insertCell(3);
    const deadlineCell = row.insertCell(4);
    const assigneeCell = row.insertCell(5);
    const actionsCell = row.insertCell(6);

    taskCell.textContent = task;

    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    progressBar.style.width = progress + '%';
    progressBar.textContent = progress + '%';
    progressCell.textContent = progress + '%';
    progressCell.appendChild(progressBar);

    statusCell.textContent = status;
    priorityCell.textContent = ['高', '中', '低'][priority - 1];
    deadlineCell.textContent = deadline;
    assigneeCell.textContent = assignee;

    assigneeCell.className = getAssigneeColor(assignee);

    const editButton = document.createElement('button');
    editButton.textContent = '編集';
    editButton.className = 'edit-button';
    editButton.onclick = function() {
        editTask(row.rowIndex - 1, row.parentNode.parentNode.id);
    };
    actionsCell.appendChild(edit
    function editTask(index, tableId) {
    const table = document.getElementById(tableId).getElementsByTagName('tbody')[0];
    const row = table.rows[index];

    document.getElementById('category').value = tableId === 'labor-task-table' ? '労務' : '総務';
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
    checkWarnings();
}

function filterTasks() {
    const searchInput = document.getElementById('search').value.toLowerCase();
    const tables = ['labor-task-table', 'general-task-table'];

    tables.forEach(tableId => {
        const table = document.getElementById(tableId).getElementsByTagName('tbody')[0];
        const rows = table.getElementsByTagName('tr');

        for (let i = 0; i < rows.length; i++) {
            const cells = rows[i].getElementsByTagName('td');
            const taskName = cells[0].textContent.toLowerCase();
            const assigneeName = cells[5].textContent.toLowerCase();
            if (taskName.indexOf(searchInput) > -1 || assigneeName.indexOf(searchInput) > -1) {
                rows[i].style.display = "";
            } else {
                rows[i].style.display = "none";
            }
        }
    });
}

function sortTable(table) {
    const rows = Array.from(table.rows);

    rows.sort((a, b) => {
        const statusA = a.cells[2].textContent === '完了' ? 1 : 0;
        const statusB = b.cells[2].textContent === '完了' ? 1 : 0;

        if (statusA !== statusB) {
            return statusA - statusB;
        }

        const deadlineA = new Date(a.cells[4].textContent);
        const deadlineB = new Date(b.cells[4].textContent);
        return deadlineA - deadlineB;
    });

    rows.forEach(row => table.appendChild(row));
}

function getAssigneeColor(assignee) {
    const assigneeHash = assignee.split('').reduce((hash, char) => {
        return char.charCodeAt(0) + ((hash << 5) - hash);
    }, 0);

    const color = `hsl(${assigneeHash % 360}, 70%, 80%)`;
    return `background-color: ${color};`;
}

function toggleMessageContainer(index, tableId) {
    const table = document.getElementById(tableId).getElementsByTagName('tbody')[0];
    const row = table.rows[index];
    const messageContainer = row.querySelector('.message-container');
    messageContainer.style.display = messageContainer.style.display === 'none' ? 'block' : 'none';
}

function sendMessage(message, container, sender) {
    if (message && sender) {
        let messageList = container.querySelector('.message-list');
        if (!messageList) {
            messageList = document.createElement('ul');
            messageList.className = 'message-list';
            container.appendChild(messageList);
        }
        const newMessage = document.createElement('li');
        newMessage.className = 'sender';
        newMessage.textContent = `${sender}: ${message}`;
        messageList.appendChild(newMessage);
        container.querySelector('textarea').value = '';
    } else {
        alert('メッセージと送信者を入力してください。');
    }
}
