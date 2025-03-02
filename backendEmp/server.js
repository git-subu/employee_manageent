const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(bodyParser.json());

// Multer Storage Engine (temporary storage before moving to DB)
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

// File Upload API - Save File to DB and Delete from Uploads
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded!");
  }
  console.log("request data----->", req.file);
  const filePath = req.file.path; // Get uploaded file path
  const fileName = req.file.originalname; // Get file name
  const fileType = req.file.mimetype; // Get file type
  const fileData = fs.readFileSync(filePath); // Read file as buffer (BLOB)

  const sql =
    "INSERT INTO employee_files (file_name, file_data, file_type) VALUES (?, ?, ?)";
  db.query(sql, [fileName, fileData, fileType], (err, result) => {
    if (err) {
      console.error("Error inserting file:", err);
      return res.status(500).send("Failed to save file.");
    }

    // Delete file from uploads folder after storing in DB
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Error deleting file:", err);
      } else {
        console.log(`Deleted file: ${filePath}`);
      }
    });

    res.json({ message: "File uploaded successfully!", fileName });
  });
});

// Fetch All Files
app.get("/files", (req, res) => {
  const sql = "SELECT id, file_name FROM employee_files";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching files:", err);
      return res.status(500).send("Error fetching files");
    }
    res.json(results);
  });
});

// Fetch File by ID
app.get("/files/:id", (req, res) => {
  const fileId = req.params.id;
  const sql =
    "SELECT file_name, file_data, file_type FROM employee_files WHERE id = ?";

  db.query(sql, [fileId], (err, results) => {
    if (err || results.length === 0) {
      console.error("Error fetching file:", err);
      return res.status(404).send("File not found");
    }

    const file = results[0];
    res.setHeader("Content-Type", file.file_type);
    res.send(file.file_data);
  });
});

// Delete File API
app.delete("/delete/:id", (req, res) => {
  const fileId = req.params.id;

  // Delete file entry from database
  const deleteSql = "DELETE FROM employee_files WHERE id = ?";
  db.query(deleteSql, [fileId], (err, result) => {
    if (err) {
      console.error("Error deleting from database:", err);
      return res.status(500).send("Error deleting file record.");
    }
    res.json({ message: "File deleted successfully!" });
  });
});

// CREATE Employee (POST)
app.post("/employees", (req, res) => {
  const { empNo, empName, empDOB, empAge, DateofJoin, hikepercent } = req.body;
  const sql =
    "INSERT INTO employees (empNo, empName, empDOB, empAge, DateofJoin, hikepercent) VALUES (?, ?, ?, ?, ?, ?)";
  db.query(
    sql,
    [empNo, empName, empDOB, empAge, DateofJoin, hikepercent],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res
        .status(201)
        .json({ message: "Employee added successfully", id: result.insertId });
    }
  );
});

// READ Employees (GET)
app.get("/employees", (req, res) => {
  db.query("SELECT * FROM employees", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

//  READ Single Employee by ID (GET)
// app.get("/employees/:id", (req, res) => {
//     const { id } = req.params;
//     db.query("SELECT * FROM employees WHERE empNo = ?", [id], (err, result) => {
//         if (err) return res.status(500).json({ error: err.message });
//         if (result.length === 0) return res.status(404).json({ message: "Employee not found" });
//         res.json(result[0]);
//     });
// });

// UPDATE Employee (PUT)
app.put("/employees/:id", (req, res) => {
  const { id } = req.params;
  const { empName, empDOB, empAge, DateofJoin, hikepercent } = req.body;
  const sql =
    "UPDATE employees SET empName=?, empDOB=?, empAge=?, DateofJoin=?, hikepercent=? WHERE empNo=?";
  db.query(
    sql,
    [empName, empDOB, empAge, DateofJoin, hikepercent, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Employee updated successfully" });
    }
  );
});

// DELETE Employee (DELETE)
app.delete("/employees/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM employees WHERE empNo=?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Employee deleted successfully" });
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
