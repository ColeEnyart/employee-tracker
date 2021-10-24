USE employee_db;

-- View all departments
SELECT * FROM department;

-- View all roles
SELECT role.id, title, name AS Department, salary FROM role
JOIN department ON role.department_id = department.id;

-- View all employees
SELECT * FROM employee;

-- Add department
INSERT INTO department (name)
VALUES
    ()

-- Add roles
INSERT INTO role (title, salary, department_id)
VALUES
    ()

-- Add employee
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
    ()

-- Update employee role
Update employee
SET role_id = ()
WHERE id = (employee.id)
