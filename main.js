import './style.css';

const taskForm = document.getElementById('taskForm');
const taskList = document.getElementById('taskList');
const errorMessages = document.getElementById('errorMessages');

// Función para mostrar las tareas en el UL
function displayTasks(tasks) {
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${task.title} - ${task.description} - ${task.isComplete ? 'Completada' : 'Pendiente'}</span>
            <button class="edit-btn" onclick="editTask(${task.id})">Editar</button>
            <button class="delete-btn" onclick="deleteTask(${task.id})">Eliminar</button>
        `;
        taskList.appendChild(li);
    });
}

// Obtener las tareas desde el backend y mostrarlas
async function fetchTasks() {
    try {
        const response = await fetch("http://localhost:3000/api/tasks");
        const tasks = await response.json();
        displayTasks(tasks);
    } catch (error) {
        console.error('Error al obtener las tareas:', error);
    }
}

// Agregar una nueva tarea
taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const taskData = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        isComplete: document.getElementById('completed').checked,
    };


    try {
        const response = await fetch("http://localhost:3000/api/tasks", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            if (errorData.errors) {
                // Mostrar errores de validación
                errorMessages.innerHTML = 'Errores en los datos: '+ 'Los caracteres deben ser superior a 5 y con un maximo de 255 ';
            } else {
                throw new Error(`Error ${response.status}: ${errorData.error}`);
            }
        } else {
            const data = await response.json();
            console.log(data.message);
            fetchTasks(); // Recargar la lista de tareas
            taskForm.reset(); // Limpiar el formulario
            errorMessages.innerHTML = ''; // Limpiar mensajes de error
        }
    } catch (error) {
        console.error('Error al agregar la tarea:', error.message);
    }
});

// Eliminar una tarea
window.deleteTask = async function (id) {
    console.log('Deleting task with ID:', id);

    try {
        const response = await fetch(`http://localhost:3000/api/tasks/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const errorData = await response.json();
            errorMessages.innerHTML = 'Error al eliminar la tarea: ' + errorData.error;
        } else {
            const data = await response.json();
            console.log(data.message);
            fetchTasks(); // Recargar la lista de tareas
            errorMessages.innerHTML = ''; // Limpiar mensajes de error
        }
    } catch (error) {
        console.error('Error al eliminar la tarea:', error.message);
    }
};

// Editar una tarea (simplemente cargar los datos en el formulario)
window.editTask = async function (id) {
    console.log('Editing task with ID:', id);

    try {
        const response = await fetch(`http://localhost:3000/api/tasks/${id}`);
        const task = await response.json();

        document.getElementById('title').value = task.title;
        document.getElementById('description').value = task.description;
        document.getElementById('completed').checked = task.isComplete;

        // Cambiar el botón de submit para que actúe como actualización
        const submitButton = taskForm.querySelector('button[type="submit"]');
        submitButton.textContent = 'Actualizar Tarea';
        taskForm.onsubmit = function (e) {
            e.preventDefault();
            updateTask(id);
        };
    } catch (error) {
        console.error('Error al obtener la tarea para editar:', error);
    }
};

// Actualizar una tarea
async function updateTask(id) {
    const taskData = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        isComplete: document.getElementById('completed').checked,
    };

    try {
        const response = await fetch(`http://localhost:3000/api/tasks/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            if (errorData.errors) {
                // Mostrar errores de validación
                errorMessages.innerHTML = 'Errores en los datos: ' + errorData.errors.map(e => e.msg).join(', ');
            } else {
                throw new Error(`Error ${response.status}: ${errorData.error}`);
            }
        } else {
            const data = await response.json();
            console.log(data.message);
            fetchTasks(); // Recargar la lista de tareas
            taskForm.reset(); // Limpiar el formulario

            // Restaurar el botón de submit
            const submitButton = taskForm.querySelector('button[type="submit"]');
            submitButton.textContent = 'Agregar Tarea';
            taskForm.onsubmit = function (e) {
                e.preventDefault();
                addTask();
            };
            errorMessages.innerHTML = ''; // Limpiar mensajes de error
        }
    } catch (error) {
        console.error('Error al actualizar la tarea:', error.message);
    }
}

// Inicializar la lista de tareas al cargar la página
fetchTasks();
