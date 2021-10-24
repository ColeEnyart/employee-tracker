const mysql = require("mysql12");
const inquirer = require("inquirer");
const table = require("console.table");

const db = mysql.creatConnection (
    {
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'employee_db'
      },
      console.log(`Connected to the database.`)
);