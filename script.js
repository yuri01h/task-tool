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

    const tableId = category === '労務' ? 'labor-task-table' : 'general-task-table';
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
    actionsCell.appendChild(editButton);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = '削除';
    deleteButton.className = 'delete-button';
    deleteButton.onclick = function() {
        deleteTask(row.rowIndex - 1, row.parentNode.parentNode.id);
    };
    actionsCell.appendChild(deleteButton);

    const messageButton = document.createElement('button');
    messageButton.textContent = 'メッセージ';
    messageButton.className = 'message-button';
    messageButton.onclick = function() {
        toggleMessageContainer(row.rowIndex - 1, row.parentNode.parentNode.id);
    };
    actionsCell.appendChild(messageButton);

    const messageContainer = document.createElement('div');
    messageContainer.className = 'message-container';
    const messageHeader = document.createElement('div');
    messageHeader.className = 'message-header';
    messageHeader.textContent = 'メッセージ';

    const messageForm = document.createElement('div');
    messageForm.className = 'message-form';
    const messageTextarea = document.createElement('textarea');
    messageTextarea.placeholder = 'ここにメッセージを入力...';
    const sendMessageButton = document.createElement('button');
    sendMessageButton.textContent = '送信';
    sendMessageButton.onclick = function() {
        sendMessage(messageTextarea.value, messageContainer, sender);
    };

    messageForm.appendChild(messageTextarea);
    messageForm.appendChild(sendMessageButton);
    messageContainer.appendChild(messageHeader);
    messageContainer.appendChild(messageForm);
    actionsCell.appendChild(messageContainer);

    updateRowStyle(row, progress, deadline);
}

function updateCells(row, task, progress, status, priority, deadline, assignee, sender) {
    row.cells[0].textContent = task;

    const progressBar = row.cells[1].querySelector('.progress-bar');
    progressBar.style.width = progress + '%';
    progressBar.textContent = progress + '%';

    row.cells[1].textContent = progress + '%';
    row.cells[1].appendChild(progressBar);

    row.cells[2].textContent = status;
    row.cells[3].textContent = ['高', '中', '低'][priority - 1];
    row.cells[4].textContent = deadline;
    row.cells[5].textContent = assignee;

    row.cells[5].className = getAssigneeColor(assignee);

    updateRowStyle(row, progress, deadline);
}

function updateRowStyle(row, progress, deadline) {
    row.classList.remove('category-high', 'category-medium', 'category-low', 'warning', 'overdue');
    if (progress >= 75) {
        row.classList.add('category-high');
    } else if (progress >= 50) {
        row.classList.add('category-medium');
    } else {
        row.classList.add('category-low');
    }

    const today = new Date();
    const deadlineDate = new Date(deadline);
    const timeDiff = deadlineDate.getTime() - today.getTime();
    const dayDiff = timeDiff / (1000 * 3600 * 24);

    if (dayDiff <= 3 && dayDiff >= 0) {
        row.classList.add('warning');
    } else if (dayDiff < 0) {
        row.classList.add('overdue');
    }
}

function checkWarnings() {
    const tables = ['labor-task-table', 'general-task-table'];
    let hasWarning = false;

    tables.forEach(tableId => {
        const table = document.getElementById(tableId).getElementsByTagName('tbody')[0];
        const rows = table.getElementsByTagName('tr');

        for (let i = 0; i < rows.length; i++) {
            if (rows[i].classList.contains('warning') || rows[i].classList.contains('overdue')) {
                hasWarning = true;
                break;
            }
        }
    });

    if (hasWarning) {
        document.getElementById('warning-message').style.display = 'block';
    } else {
        document.getElementById('warning-message').style.display = 'none';
    }
}

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
            let taskName = cells[0].textContent.toLowerCase();
            if (taskName.indexOf(searchInput) > -1) {
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
        const priorityA = ['高', '中', '低'].indexOf(a.cells[3].textContent);
        const priorityB = ['高', '中', '低'].indexOf(b.cells[3].textContent);
        return priorityA - priorityB;
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
        const messageList = container.querySelector('.message-list');
        if (!messageList) {
            const newMessageList = document.createElement('ul');
            newMessageList.className = 'message-list';
            container.appendChild(newMessageList);
        }
        const newMessage = document.createElement('li');
        newMessage.className = 'sender';
        newMessage.textContent = `${sender}: ${message}`;
        container.querySelector('.message-list').appendChild(newMessage);
        container.querySelector('textarea').value = '';
    } else {
        alert('メッセージと送信者を入力してください。');
    }
}
