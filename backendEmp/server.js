const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// 🚀 CREATE Employee (POST)
app.post("/employees", (req, res) => {
    const {empNo, empName, empDOB, empAge, DateofJoin, hikepercent } = req.body;
    console.log('Request body-------->',req.body)
    const sql = "INSERT INTO employees (empNo, empName, empDOB, empAge, DateofJoin, hikepercent) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(sql, [empNo,empName, empDOB, empAge, DateofJoin, hikepercent], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Employee added successfully", id: result.insertId });
    });
});

// 📋 READ Employees (GET)
app.get("/employees", (req, res) => {
    db.query("SELECT * FROM employees", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 🔍 READ Single Employee by ID (GET)
// app.get("/employees/:id", (req, res) => {
//     const { id } = req.params;
//     db.query("SELECT * FROM employees WHERE empNo = ?", [id], (err, result) => {
//         if (err) return res.status(500).json({ error: err.message });
//         if (result.length === 0) return res.status(404).json({ message: "Employee not found" });
//         res.json(result[0]);
//     });
// });

// ✏️ UPDATE Employee (PUT)
app.put("/employees/:id", (req, res) => {
    const { id } = req.params;
    const {empName, empDOB, empAge, DateofJoin, hikepercent } = req.body;
    const sql = "UPDATE employees SET empName=?, empDOB=?, empAge=?, DateofJoin=?, hikepercent=? WHERE empNo=?";
    db.query(sql, [empName, empDOB, empAge, DateofJoin, hikepercent, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Employee updated successfully" });
    });
});

// ❌ DELETE Employee (DELETE)
app.delete("/employees/:id", (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM employees WHERE empNo=?", [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Employee deleted successfully" });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
