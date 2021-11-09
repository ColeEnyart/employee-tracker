const mysql = require("mysql2");
const env = require('dotenv').config();
const inquirer = require("inquirer");
require("console.table");
const proc = require("./procs");

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

function viewDepartments() {
    proc.getDepartments()
        .then((res) => {
            console.table(res);
            init();
        })
        .catch((err) => { throw err })
}

function viewRoles() {
    proc.getRoles()
        .then((res) => {
            console.table(res);
            init();
        })
        .catch((err) => { throw err })
}

function viewEmployees() {
    proc.getEmployees()
        .then((res) => {
            console.table(res);
            init();
        })
        .catch((err) => { throw err })
}

function addDepartment() {
    inquirer.prompt(
        {
            type: 'input',
            name: 'addDep',
            message: 'What is the name of the department? ',
        })
        .then((res) => {
            proc.addDepartment(res.addDep);
            console.log('Added ' + res.addDep + ' to the database');
            init();
        })
        .catch((err) => { throw (err) });
}

function addRole() {
    let dep = [];

    proc.getDepartments()
        .then((res) => {
            for (let i = 0; i < res.length; i++) {
                dep.push({ name: res[i].name, value: res[i].id });
            }

            return inquirer.prompt([{
                name: "title",
                type: "input",
                message: "What is the name of the role? "
            },
            {
                name: "salary",
                type: "input",
                message: "What is the salary of the role? "
            },
            {
                name: "department",
                type: "list",
                message: "Which department does the role belong to? ",
                choices: dep
            }])
        })
        .then((res) => {
            proc.addRole(res.title, res.salary, res.department);
            console.log('Added role ' + res.title + ' to the database');
            init()
        })
        .catch((err) => { throw (err) });
}

function addEmployee() {
    Promise.all([proc.getRoles(), proc.getManagers()])
        .then((lists) => {

            let roleList = lists[0].map(r => r.title);
            let managers = lists[1].map(m => m.first_name + " " + m.last_name).sort();

            inquirer.prompt([
                {
                    type: "input",
                    message: "What is the employee's first name?",
                    name: "firstName"
                },
                {
                    type: "input",
                    message: "What is the employee's last name?",
                    name: "lastName"
                },
                {
                    type: "list",
                    message: "What is the employee's role?",
                    name: "employeeRole",
                    choices: roleList
                },
                {
                    type: "list",
                    message: "Who is the employee's manager?",
                    name: "employeeManager",
                    choices: [...managers, 'None']
                },
            ])
                .then(res => {
                    let selectedRole = res.employeeRole;
                    let selectedManager = res.employeeManager;

                    let roleIndexNumber = lists[0].findIndex(function (role) {
                        return selectedRole === role.title;
                    })

                    let roleID = lists[0][roleIndexNumber].id;

                    let managerIndexNumber = lists[1].findIndex(function (manager) {
                        return selectedManager === manager.first_name + " " + manager.last_name;
                    })

                    let managerID = (managerIndexNumber === -1) ? null : lists[1][managerIndexNumber].id;

                    proc.addEmployee(res.firstName, res.lastName, roleID, managerID).then(res => { init() }).catch(err => { console.log(err) });
                    console.log('Added employee ' + res.firstName + ' ' + res.lastName + ' to the database');
                })
        })
        .catch(err =>
            console.log(err));
}

function updateEmployee() {
    Promise.all([proc.getEmployees(), proc.getRoles()])
        .then((values) => {
            
            let currentEmployees = values[0].map(function (employee) {
                return employee.first_name + " " + employee.last_name;
            })

            let currentRoles = values[1].map(function (employee) {
                return employee.title;
            })
            inquirer.prompt([
                {
                    type: "list",
                    message: "Which employee's role do you want to update? ",
                    name: "employeeName",
                    choices: currentEmployees
                },
                {
                    type: "list",
                    message: "Which role do you want to assign the selected employee? ",
                    name: "selectRole",
                    choices: currentRoles
                }
                ])
                .then(res => {
                    let selectedEmployee = res.employeeName;
                    let selectedRole = res.selectRole;
                    let employeeIndexNumber = values[0].findIndex(function (employee) {
                        return selectedEmployee === employee.first_name + " " + employee.last_name;
                    })

                    let thisEmployeeId = values[0][employeeIndexNumber].id;

                    let roleIndexNumber = values[1].findIndex(function (role) {
                        return selectedRole === role.title;
                    })

                    let roleID = values[1][roleIndexNumber].id;

                    db.query(`UPDATE employee SET role_id = ? WHERE id= ?`, [roleID, thisEmployeeId], (err, res) => {
                        console.log("Updated" + selectedEmployee + "'s role")
                        init();
                    })
                })
        })
}

function deleteDepartment() {
    let depOpt = [];
    db.query("SELECT id, name FROM department", (err, res) => {
        for (var i = 0; i < res.length; i++) {
            depOpt.push(Object(res[i]));
        }
        console.table(res);

        inquirer.prompt(
            {
                type: 'list',
                name: 'delDep',
                message: 'Select a department to delete ',
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
                        
                        proc.deleteDepartment(newChoice).then(res => { init() }).catch(err => { console.log(err) });
                        console.log("Department: " + res.delDep + " Deleted Succesfully");
                    }
                }
            })
    })
}

function deleteRole() {
    let roleOpt = [];
    db.query("SELECT id, title FROM role", (err, res) => {
        for (var i = 0; i < res.length; i++) {
            roleOpt.push(Object(res[i]));
        }
        console.table(res);

        inquirer.prompt(
            {
                type: 'list',
                name: 'delRole',
                message: 'Select a role to delete ',
                choices: roleOpt.map(r => r.title),
            })
            .then((res) => {
                for (i = 0; i < roleOpt.length; i++) {
                    if (res.delRole === roleOpt[i].title) {
                        newChoice = roleOpt[i].id
                        
                        proc.deleteRole(newChoice).then(res => { init() }).catch(err => { console.log(err) });
                        console.log("Role: " + res.delRole + " Deleted Succesfully");
                    }
                }
                init();
            })
    })
}

function deleteEmployee() {
    let empList = [];
    db.query("SELECT id, first_name, last_name FROM employee", (err, res) => {
        empList = res;
        console.table(res);

        inquirer
            .prompt([
                {
                    type: "list",
                    message: "Which employee would you like to delete?",
                    name: "employee",
                    choices: empList.map(r => r.first_name + " " + r.last_name),

                },
            ])
            .then((res) => {
                empId = empList.find(e => e.first_name + " " + e.last_name === res.employee).id;
                
                proc.deleteEmployee(empId).then(res => { init() }).catch(err => { console.log(err) });
                console.log("Employee: " + res.employee + " deleted Succesfully");
            });
    }
    );
};

// Initial questions to ask
function init() {
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
                'Delete Department',
                'Delete Role',
                'Delete Employee'
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
                    addRole();
                    break;
                case 'Add Employee':
                    addEmployee();
                    break;
                case 'Update Employee Role':
                    updateEmployee();
                    break;
                case 'Quit':
                    process.exit();
                case 'Delete Department':
                    deleteDepartment();
                    break;
                case 'Delete Role':
                    deleteRole();
                    break;
                case 'Delete Employee':
                    deleteEmployee();
                    break;
            }
        })

}

init();