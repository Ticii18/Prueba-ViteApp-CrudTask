import './style.css'

fetch("http://localhost:3000/api/tasks")
.then(e => e.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));