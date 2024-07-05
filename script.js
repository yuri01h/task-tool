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
