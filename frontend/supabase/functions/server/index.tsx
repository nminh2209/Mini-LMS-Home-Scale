import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-31b90bb5/health", (c) => {
  return c.json({ status: "ok" });
});

// ===== CLASSES =====
// Get all classes
app.get("/make-server-31b90bb5/classes", async (c) => {
  try {
    const classes = await kv.getByPrefix("class:");
    return c.json({ classes });
  } catch (error) {
    console.log(`Error fetching classes: ${error}`);
    return c.json({ error: "Failed to fetch classes" }, 500);
  }
});

// Create a new class
app.post("/make-server-31b90bb5/classes", async (c) => {
  try {
    const body = await c.req.json();
    const classId = `class:${Date.now()}`;
    const classData = {
      id: classId,
      name: body.name,
      schedule: body.schedule, // e.g., "Mon/Wed 6:00 PM"
      level: body.level, // e.g., "Grade 10", "IELTS Prep"
      createdAt: new Date().toISOString(),
    };
    await kv.set(classId, classData);
    return c.json({ class: classData });
  } catch (error) {
    console.log(`Error creating class: ${error}`);
    return c.json({ error: "Failed to create class" }, 500);
  }
});

// Update a class
app.put("/make-server-31b90bb5/classes/:id", async (c) => {
  try {
    const classId = c.req.param("id");
    const body = await c.req.json();
    const existing = await kv.get(classId);
    if (!existing) {
      return c.json({ error: "Class not found" }, 404);
    }
    const updated = { ...existing, ...body };
    await kv.set(classId, updated);
    return c.json({ class: updated });
  } catch (error) {
    console.log(`Error updating class: ${error}`);
    return c.json({ error: "Failed to update class" }, 500);
  }
});

// Delete a class
app.delete("/make-server-31b90bb5/classes/:id", async (c) => {
  try {
    const classId = c.req.param("id");
    await kv.del(classId);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting class: ${error}`);
    return c.json({ error: "Failed to delete class" }, 500);
  }
});

// ===== STUDENTS =====
// Get all students (optionally filtered by classId)
app.get("/make-server-31b90bb5/students", async (c) => {
  try {
    const classId = c.req.query("classId");
    const allStudents = await kv.getByPrefix("student:");
    
    if (classId) {
      const filtered = allStudents.filter(s => s.classId === classId);
      return c.json({ students: filtered });
    }
    
    return c.json({ students: allStudents });
  } catch (error) {
    console.log(`Error fetching students: ${error}`);
    return c.json({ error: "Failed to fetch students" }, 500);
  }
});

// Create a new student
app.post("/make-server-31b90bb5/students", async (c) => {
  try {
    const body = await c.req.json();
    const studentId = `student:${Date.now()}`;
    const studentData = {
      id: studentId,
      classId: body.classId,
      name: body.name,
      email: body.email,
      phone: body.phone,
      parentName: body.parentName,
      parentPhone: body.parentPhone,
      monthlyFee: body.monthlyFee || 0,
      createdAt: new Date().toISOString(),
    };
    await kv.set(studentId, studentData);
    return c.json({ student: studentData });
  } catch (error) {
    console.log(`Error creating student: ${error}`);
    return c.json({ error: "Failed to create student" }, 500);
  }
});

// Update a student
app.put("/make-server-31b90bb5/students/:id", async (c) => {
  try {
    const studentId = c.req.param("id");
    const body = await c.req.json();
    const existing = await kv.get(studentId);
    if (!existing) {
      return c.json({ error: "Student not found" }, 404);
    }
    const updated = { ...existing, ...body };
    await kv.set(studentId, updated);
    return c.json({ student: updated });
  } catch (error) {
    console.log(`Error updating student: ${error}`);
    return c.json({ error: "Failed to update student" }, 500);
  }
});

// Delete a student
app.delete("/make-server-31b90bb5/students/:id", async (c) => {
  try {
    const studentId = c.req.param("id");
    await kv.del(studentId);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting student: ${error}`);
    return c.json({ error: "Failed to delete student" }, 500);
  }
});

// ===== ATTENDANCE =====
// Get attendance records (filtered by classId and/or date)
app.get("/make-server-31b90bb5/attendance", async (c) => {
  try {
    const classId = c.req.query("classId");
    const date = c.req.query("date");
    const allRecords = await kv.getByPrefix("attendance:");
    
    let filtered = allRecords;
    if (classId) {
      filtered = filtered.filter(r => r.classId === classId);
    }
    if (date) {
      filtered = filtered.filter(r => r.date === date);
    }
    
    return c.json({ records: filtered });
  } catch (error) {
    console.log(`Error fetching attendance: ${error}`);
    return c.json({ error: "Failed to fetch attendance" }, 500);
  }
});

// Save attendance for a session
app.post("/make-server-31b90bb5/attendance", async (c) => {
  try {
    const body = await c.req.json();
    const recordId = `attendance:${body.classId}:${body.date}:${Date.now()}`;
    const attendanceData = {
      id: recordId,
      classId: body.classId,
      studentId: body.studentId,
      date: body.date,
      status: body.status, // "present", "absent", "late"
      createdAt: new Date().toISOString(),
    };
    await kv.set(recordId, attendanceData);
    return c.json({ record: attendanceData });
  } catch (error) {
    console.log(`Error saving attendance: ${error}`);
    return c.json({ error: "Failed to save attendance" }, 500);
  }
});

// Batch save attendance
app.post("/make-server-31b90bb5/attendance/batch", async (c) => {
  try {
    const { classId, date, records } = await c.req.json();
    const savedRecords = [];
    
    for (const record of records) {
      const recordId = `attendance:${classId}:${date}:${record.studentId}`;
      const attendanceData = {
        id: recordId,
        classId,
        studentId: record.studentId,
        date,
        status: record.status,
        createdAt: new Date().toISOString(),
      };
      await kv.set(recordId, attendanceData);
      savedRecords.push(attendanceData);
    }
    
    return c.json({ records: savedRecords });
  } catch (error) {
    console.log(`Error batch saving attendance: ${error}`);
    return c.json({ error: "Failed to batch save attendance" }, 500);
  }
});

// ===== TUITION =====
// Get tuition records
app.get("/make-server-31b90bb5/tuition", async (c) => {
  try {
    const studentId = c.req.query("studentId");
    const allRecords = await kv.getByPrefix("tuition:");
    
    if (studentId) {
      const filtered = allRecords.filter(r => r.studentId === studentId);
      return c.json({ records: filtered });
    }
    
    return c.json({ records: allRecords });
  } catch (error) {
    console.log(`Error fetching tuition records: ${error}`);
    return c.json({ error: "Failed to fetch tuition records" }, 500);
  }
});

// Record tuition payment
app.post("/make-server-31b90bb5/tuition", async (c) => {
  try {
    const body = await c.req.json();
    const recordId = `tuition:${body.studentId}:${body.month}`;
    const tuitionData = {
      id: recordId,
      studentId: body.studentId,
      amount: body.amount,
      month: body.month, // e.g., "2026-01"
      status: body.status || "paid",
      paidAt: new Date().toISOString(),
    };
    await kv.set(recordId, tuitionData);
    return c.json({ record: tuitionData });
  } catch (error) {
    console.log(`Error recording tuition payment: ${error}`);
    return c.json({ error: "Failed to record tuition payment" }, 500);
  }
});

// ===== ASSIGNMENTS =====
// Get assignments
app.get("/make-server-31b90bb5/assignments", async (c) => {
  try {
    const classId = c.req.query("classId");
    const allAssignments = await kv.getByPrefix("assignment:");
    
    if (classId) {
      const filtered = allAssignments.filter(a => a.classId === classId);
      return c.json({ assignments: filtered });
    }
    
    return c.json({ assignments: allAssignments });
  } catch (error) {
    console.log(`Error fetching assignments: ${error}`);
    return c.json({ error: "Failed to fetch assignments" }, 500);
  }
});

// Create assignment
app.post("/make-server-31b90bb5/assignments", async (c) => {
  try {
    const body = await c.req.json();
    const assignmentId = `assignment:${Date.now()}`;
    const assignmentData = {
      id: assignmentId,
      classId: body.classId,
      title: body.title,
      description: body.description,
      dueDate: body.dueDate,
      createdAt: new Date().toISOString(),
    };
    await kv.set(assignmentId, assignmentData);
    return c.json({ assignment: assignmentData });
  } catch (error) {
    console.log(`Error creating assignment: ${error}`);
    return c.json({ error: "Failed to create assignment" }, 500);
  }
});

// ===== VOCABULARY =====
// Get vocabulary lists
app.get("/make-server-31b90bb5/vocabulary", async (c) => {
  try {
    const classId = c.req.query("classId");
    const allVocab = await kv.getByPrefix("vocab:");
    
    if (classId) {
      const filtered = allVocab.filter(v => v.classId === classId);
      return c.json({ vocabulary: filtered });
    }
    
    return c.json({ vocabulary: allVocab });
  } catch (error) {
    console.log(`Error fetching vocabulary: ${error}`);
    return c.json({ error: "Failed to fetch vocabulary" }, 500);
  }
});

// Create vocabulary list
app.post("/make-server-31b90bb5/vocabulary", async (c) => {
  try {
    const body = await c.req.json();
    const vocabId = `vocab:${Date.now()}`;
    const vocabData = {
      id: vocabId,
      classId: body.classId,
      week: body.week,
      words: body.words, // Array of { word, definition, example }
      createdAt: new Date().toISOString(),
    };
    await kv.set(vocabId, vocabData);
    return c.json({ vocabulary: vocabData });
  } catch (error) {
    console.log(`Error creating vocabulary list: ${error}`);
    return c.json({ error: "Failed to create vocabulary list" }, 500);
  }
});

// ===== SCORES =====
// Get scores
app.get("/make-server-31b90bb5/scores", async (c) => {
  try {
    const studentId = c.req.query("studentId");
    const allScores = await kv.getByPrefix("score:");
    
    if (studentId) {
      const filtered = allScores.filter(s => s.studentId === studentId);
      return c.json({ scores: filtered });
    }
    
    return c.json({ scores: allScores });
  } catch (error) {
    console.log(`Error fetching scores: ${error}`);
    return c.json({ error: "Failed to fetch scores" }, 500);
  }
});

// Record score
app.post("/make-server-31b90bb5/scores", async (c) => {
  try {
    const body = await c.req.json();
    const scoreId = `score:${body.studentId}:${Date.now()}`;
    const scoreData = {
      id: scoreId,
      studentId: body.studentId,
      assignmentId: body.assignmentId,
      score: body.score,
      maxScore: body.maxScore,
      type: body.type, // "homework", "test", "quiz"
      createdAt: new Date().toISOString(),
    };
    await kv.set(scoreId, scoreData);
    return c.json({ score: scoreData });
  } catch (error) {
    console.log(`Error recording score: ${error}`);
    return c.json({ error: "Failed to record score" }, 500);
  }
});

Deno.serve(app.fetch);