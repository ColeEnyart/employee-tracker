const mysql = require("mysql2");
const inquirer = require("inquirer");
const table = require("console.table");

const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: '6642',
        database: 'employee_db'
    },
    console.log(`Connected to the database.`)
);

// Initial questions to ask
const initQuestions = () => {
    inquirer.prompt([
        {
            type: 'list',
            name: 'options',
            message: 'What would you like to do?',
            choices: [
                'View All Departments',
                'View All Roles',
                'View All Employees',
                'Add Department',
                'Add Role',
                'Add Employee',
                'Update Employee Role',
                'Quit'
            ]
        }
    ])
    .then((res) => {
        switch (res.options) {
            case 'View All Departments':
                viewDepartments();
                break;
            case 'View All Roles':
                viewRoles();
                break;
            case 'View All Employees':
                viewEmployees();
                break;
            case 'Add Department':
                
                break;
            case 'Add Role':
                
                break;
            case 'Add Employee':
                
                break;
            case 'Update Employee Role':
                
                break;
            case 'Quit':
                process.exit();
        }
    })

}

const viewEmployees = () => {
    db.query("SELECT employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(e.first_name, ' ' ,e.last_name) AS Manager FROM employee INNER JOIN role on role.id = employee.role_id INNER JOIN department on department.id = role.department_id LEFT JOIN employee e on employee.manager_id = e.id;", (err, res) => {
        if(err) throw err;
        console.table(res);
        initQuestions();
    })
}

const viewRoles = () => {
    db.query("SELECT role.id, title, name AS Department, salary FROM role JOIN department ON role.department_id = department.id;", (err, res) => {
        if(err) throw err;
        console.table(res);
        initQuestions();
    })
}

const viewDepartments = () => {
    db.query("SELECT * FROM department;", (err, res) => {
        if(err) throw err;
        console.table(res);
        initQuestions();
    })
}

initQuestions();