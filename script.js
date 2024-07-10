document.addEventListener('DOMContentLoaded', loadTasks);

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

function saveTasks() {
    const tasks = {};
    document.querySelectorAll('table').forEach(table => {
        const category = table.id.replace('-task-table', '');
        tasks[category] = [];
        table.querySelectorAll('tbody tr').forEach(row => {
            const task = {
                task: row.cells[0].textContent,
                progress: row.cells[1].querySelector('.progress-bar').textContent.replace('%', ''),
                status: row.cells[2].textContent,
                priority: ['高', '中', '低'].indexOf(row.cells[3].textContent) + 1,
                deadline: row.cells[4].textContent,
                assignee: row.cells[5].textContent
            };
            tasks[category].push(task);
        });
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks'));
    if (!tasks) return;

    for (const category in tasks) {
        if (tasks.hasOwnProperty(category)) {
            if (!document.getElementById(`${category}-task-table`)) {
                addCategory(category);
            }
            const table = document.getElementById(`${category}-task-table`).querySelector('tbody');
            tasks[category].forEach(taskData => {
                const newRow = table.insertRow();
                addCells(newRow, taskData.task, taskData.progress, taskData.status, taskData.priority, taskData.deadline, taskData.assignee, '');
            });
        }
    }
    checkWarnings();
}

function addCategory(newCategory) {
    if (typeof newCategory !== 'string') {
        newCategory = document.getElementById('new-category').value.trim();
    }
    if (newCategory) {
        const categorySelect = document.getElementById('category');
        const newOption = new Option(newCategory, newCategory);
        categorySelect.add(newOption);
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

function deleteTask(index, tableId) {
    const table = document.getElementById(tableId).getElementsByTagName('tbody')[0];
    table.deleteRow(index);
    document.getElementById('edit-index').value = '';
    saveTasks();
    checkWarnings();
}
