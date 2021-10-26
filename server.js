const mysql = require("mysql2");
const env = require('dotenv').config();
const inquirer = require("inquirer");
require("console.table");

const db = mysql.createConnection(
    {
        host: process.env.DB_HOST,
        port: 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: 'employee_db'
    },
    console.log(`Connected to the database.`)
);



const viewEmployees = () => {
    db.query("SELECT employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(e.first_name, ' ' ,e.last_name) AS Manager FROM employee INNER JOIN role on role.id = employee.role_id INNER JOIN department on department.id = role.department_id LEFT JOIN employee e on employee.manager_id = e.id;", (err, res) => {
        if (err) throw err;
        console.table(res);
        initQuestions();
    })
}

const viewRoles = () => {
    db.query("SELECT role.id, title, name AS Department, salary FROM role JOIN department ON role.department_id = department.id;", (err, res) => {
        if (err) throw err;
        console.table(res);
        initQuestions();
    })
}

const viewDepartments = () => {
    db.query("SELECT * FROM department;", (err, res) => {
        if (err) throw err;
        console.table(res);
        initQuestions();
    })
}

const addDepartment = () => {
    inquirer.prompt(
        {
            type: 'input',
            name: 'addDep',
            message: 'What is the name of the department? ',
        })
        .then((res) => {
            db.query('INSERT INTO department SET ?', {
                name: res.addDep
            },
                (err, res) => {
                    if (err) throw err;
                    console.log('Added' + JSON.stringify(res) + 'to the database');
                    initQuestions();
                })
        })
}

const deleteDepartment = () => {
    let depOpt = [];
    db.query("SELECT id, name FROM department", (err, res) => {
        for (var i = 0; i < res.length; i++) {
            depOpt.push(Object(res[i]));
        }

        inquirer.prompt(
            {
                type: 'list',
                name: 'delDep',
                message: 'What is the name of the department? ',
                choices: function () {
                    var choiceArray = [];
                    for (var i = 0; i < depOpt.length; i++) {
                        choiceArray.push(depOpt[i])
                    }
                    return choiceArray;
                }
            })
            .then((res) => {
                for (i = 0; i < depOpt.length; i++) {
                    if (res.delDep === depOpt[i].name) {
                        newChoice = depOpt[i].id
                        db.query(`DELETE FROM department Where id = ${newChoice}`), (err, res) => {
                            if (err) throw err;
                        };
                        console.log("Department: " + res.delDep + " Deleted Succesfully");
                    }
                }
                initQuestions();
            })
    })
}

// Initial questions to ask
const initQuestions = () => {
    inquirer.prompt([
        {
            type: 'list',
            name: 'options',
            message: 'What would you like to do? ',
            choices: [
                'View All Departments',
                'View All Roles',
                'View All Employees',
                'Add Department',
                'Add Role',
                'Add Employee',
                'Update Employee Role',
                'Quit',
                'Delete Department'
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
                    addDepartment();
                    break;
                case 'Add Role':

                    break;
                case 'Add Employee':

                    break;
                case 'Update Employee Role':

                    break;
                case 'Quit':
                    process.exit();
                case 'Delete Department':
                    deleteDepartment();
                    break;
            }
        })

}

initQuestions();