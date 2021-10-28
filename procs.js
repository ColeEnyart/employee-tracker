const mysql = require("mysql2");
const env = require('dotenv').config();

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

module.exports = {

    getDepartments: function() {
        return new Promise((resolve, reject) => {
            db.query("SELECT id, name FROM department", (err, res) => {
                err && reject(err) || resolve(res);
            })
        })
    },
    getRoles: function() {
        return new Promise((resolve, reject) => {
            db.query(`SELECT role.id, title, name AS Department, salary FROM role JOIN department ON role.department_id = department.id;`, (err, res) => {
                err && reject(err) || resolve(res);
            })
        });
    },
    getEmployees: function() {
        return new Promise((resolve, reject) => {
            db.query(`SELECT employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(e.first_name, ' ' ,e.last_name) AS Manager FROM employee INNER JOIN role on role.id = employee.role_id INNER JOIN department on department.id = role.department_id LEFT JOIN employee e on employee.manager_id = e.id`, (err, res) => {
                err && reject(err) || resolve(res);
            })
        });
    },
    addDepartment: function(addDep) {
        return new Promise((resolve, reject) => {
            db.query('INSERT INTO department SET ?',
            {
                name: addDep,
            },
            (err, res) => {
                err && reject(err) || resolve(res);
            })
        });
    },
    addRole: function(title, salary, department) {
        return new Promise((resolve, reject) => {
            db.query("INSERT INTO role SET ?",
            {
                title: title,
                salary: salary,
                department_id: department,
            },
            (err, res) => {
                err && reject(err) || resolve(res);
            })
        })
    },
    addEmployee: function(firstName, lastName, roleID, managerID) {
        return new Promise((resolve, reject) => {
            db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`, [firstName, lastName, roleID, managerID], (err, res) => {
                err && reject(err) || resolve(res);
            })
        })
    },
    updateEmployee: function(id, firstName, lastName, roleId, managerId) {
        return new Promise((resolve, reject) => {
            db.query(`UPDATE employee SET first_name = ?, last_name = ?, role_id = ?, manager_id = ? WHERE id = ?`, [firstName, lastName, roleId, managerId, id], (err, res) => {
                err && reject(err) || resolve(res);
            })
        })
    },
    deleteDepartment: function() {

    },
    deleteRole: function() {

    },
    deleteEmployee: function(id) {
        return new Promise((resolve, reject) => {
            db.query(`DELETE FROM employee WHERE id = ?`, [id], (err, res) => {
                err && reject(err) || resolve(res);
            })
        })
    },
    getManagers: function() {
        return new Promise((resolve, reject) => {
            db.query('SELECT first_name, last_name, id FROM employee WHERE manager_id IS NULL', (err, res) => {
                err && reject(err) || resolve(res);
            })
        });
    },
}