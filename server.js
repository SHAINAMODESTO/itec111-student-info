/**
 * Student Info API — a tiny practice server for ITEC111
 * -------------------------------------------------------
 * Supports:
 *   POST   /students        -> submit a new student profile
 *   GET    /students        -> retrieve all student profiles
 *   GET    /students/:id    -> retrieve one student profile
 *   PUT    /students/:id    -> fully replace a student profile
 *   PATCH  /students/:id    -> partially update a student profile
 *   DELETE /students/:id    -> delete a student profile
 *
 * Data lives only in memory — restarting the server clears everything.
 * Run:
 *   npm install
 *   npm start
 * Server runs at: http://localhost:3000
 */

const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // lets us read JSON bodies from POST/PUT/PATCH

// In-memory "database"
let students = [];
let nextId = 1;

// Fields required when creating a NEW student (POST) or fully replacing one (PUT)
const REQUIRED_FIELDS = ["firstName", "lastName", "age", "course", "year", "motto"];
// middleName is intentionally optional — not everyone has one on record

function findStudent(id) {
  return students.find((s) => s.id === Number(id));
}

function missingFields(body) {
  return REQUIRED_FIELDS.filter(
    (field) => body[field] === undefined || body[field] === null || body[field] === ""
  );
}

// ---------------------------------------------------------
// POST /students — submit a new student profile
// ---------------------------------------------------------
app.post("/students", (req, res) => {
  const missing = missingFields(req.body);

  if (missing.length > 0) {
    return res.status(400).json({
      error: `Missing required field(s): ${missing.join(", ")}`,
      requiredFields: REQUIRED_FIELDS,
      optionalFields: ["middleName"],
    });
  }

  const { firstName, middleName, lastName, age, course, year, motto } = req.body;

  const newStudent = {
    id: nextId++,
    firstName,
    middleName: middleName || "",
    lastName,
    age,
    course,
    year,
    motto,
    createdAt: new Date().toISOString(),
  };

  students.push(newStudent);

  // 201 Created is the correct status code for a successful POST
  res.status(201).json(newStudent);
});

// ---------------------------------------------------------
// GET /students — retrieve every student profile
// ---------------------------------------------------------
app.get("/students", (req, res) => {
  res.status(200).json(students);
});

// ---------------------------------------------------------
// GET /students/:id — retrieve one specific student profile
// ---------------------------------------------------------
app.get("/students/:id", (req, res) => {
  const student = findStudent(req.params.id);

  if (!student) {
    return res.status(404).json({ error: `Student ${req.params.id} not found.` });
  }

  res.status(200).json(student);
});

// ---------------------------------------------------------
// PUT /students/:id — fully replace a student profile
// Client must send ALL required fields, or missing ones are lost.
// ---------------------------------------------------------
app.put("/students/:id", (req, res) => {
  const student = findStudent(req.params.id);

  if (!student) {
    return res.status(404).json({ error: `Student ${req.params.id} not found.` });
  }

  const missing = missingFields(req.body);

  if (missing.length > 0) {
    return res.status(400).json({
      error: `PUT requires the FULL profile. Missing field(s): ${missing.join(", ")}`,
      requiredFields: REQUIRED_FIELDS,
      optionalFields: ["middleName"],
    });
  }

  const { firstName, middleName, lastName, age, course, year, motto } = req.body;

  student.firstName = firstName;
  student.middleName = middleName || "";
  student.lastName = lastName;
  student.age = age;
  student.course = course;
  student.year = year;
  student.motto = motto;
  student.updatedAt = new Date().toISOString();

  res.status(200).json(student);
});

// ---------------------------------------------------------
// PATCH /students/:id — partially update a student profile
// Client sends ONLY the field(s) they want to change.
// Example: just updating "year" or just "motto".
// ---------------------------------------------------------
app.patch("/students/:id", (req, res) => {
  const student = findStudent(req.params.id);

  if (!student) {
    return res.status(404).json({ error: `Student ${req.params.id} not found.` });
  }

  const allowedFields = ["firstName", "middleName", "lastName", "age", "course", "year", "motto"];
  const receivedFields = Object.keys(req.body);
  const unknownFields = receivedFields.filter((f) => !allowedFields.includes(f));

  if (receivedFields.length === 0) {
    return res.status(400).json({
      error: "Send at least one field to update.",
      updatableFields: allowedFields,
    });
  }

  if (unknownFields.length > 0) {
    return res.status(400).json({
      error: `Unknown field(s): ${unknownFields.join(", ")}`,
      updatableFields: allowedFields,
    });
  }

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      student[field] = req.body[field];
    }
  });
  student.updatedAt = new Date().toISOString();

  res.status(200).json(student);
});

// ---------------------------------------------------------
// DELETE /students/:id — remove a student profile
// (bonus endpoint, handy for a future CRUD lesson)
// ---------------------------------------------------------
app.delete("/students/:id", (req, res) => {
  const index = students.findIndex((s) => s.id === Number(req.params.id));

  if (index === -1) {
    return res.status(404).json({ error: `Student ${req.params.id} not found.` });
  }

  students.splice(index, 1);
  res.status(204).send(); // 204 No Content — success, nothing to return
});

// ---------------------------------------------------------
// Friendly root route so opening the URL in a browser isn't confusing
// ---------------------------------------------------------
app.get("/", (req, res) => {
  res.send(
    "Student Info API is running. Try POST /students to submit a profile, then GET /students to see it!"
  );
});

app.listen(PORT, () => {
  console.log(`\n✅ Student Info API running on port ${PORT}`);
  console.log(`   Try these endpoints (replace the host with your own):`);
  console.log(`   POST   /students   body: { firstName, middleName?, lastName, age, course, year, motto }`);
  console.log(`   GET    /students`);
  console.log(`   GET    /students/1`);
  console.log(`   PUT    /students/1  (send the FULL profile)`);
  console.log(`   PATCH  /students/1  (send ONLY the field(s) to change)`);
  console.log(`   DELETE /students/1\n`);
});
