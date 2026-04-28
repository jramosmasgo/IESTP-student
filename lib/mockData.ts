// ─── Types ────────────────────────────────────────────────────────────────────

export type AttendanceStatus = "presente" | "tardanza" | "falta";

export interface Student {
  id: string;
  name: string;
  code: string;
  email: string;
  career: string;
  semester: string;
  avatarInitials: string;
  avatarColor: string;
}

export interface ScheduleEntry {
  id: string;
  course: string;
  day: string;
  time: string;
  room: string;
  teacher: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  /** Date in YYYY-MM-DD format */
  date: string;
  /** Time the QR was scanned, or '—' for falta */
  time: string;
  status: AttendanceStatus;
  note?: string;
}

// ─── Mock student (logged-in) ─────────────────────────────────────────────────

export const MOCK_STUDENT: Student = {
  id: "s001",
  name: "Carlos Eduardo Ramírez",
  code: "2021050123",
  email: "c.ramirez@universidad.edu.pe",
  career: "Ingeniería de Sistemas",
  semester: "VI Semestre",
  avatarInitials: "CR",
  avatarColor: "#4f46e5",
};

// ─── Mock schedule ────────────────────────────────────────────────────────────

export const MOCK_SCHEDULE: ScheduleEntry[] = [
  {
    id: "sch1",
    course: "Algoritmos y Estructuras de Datos",
    day: "Lunes",
    time: "08:00 – 10:00",
    room: "Aula B-204",
    teacher: "Dr. Mendoza",
  },
  {
    id: "sch2",
    course: "Base de Datos I",
    day: "Martes",
    time: "10:00 – 12:00",
    room: "Lab 301",
    teacher: "Mg. Torres",
  },
  {
    id: "sch3",
    course: "Desarrollo Web",
    day: "Miércoles",
    time: "08:00 – 10:00",
    room: "Lab 210",
    teacher: "Ing. Quispe",
  },
  {
    id: "sch4",
    course: "Redes y Comunicaciones",
    day: "Jueves",
    time: "14:00 – 16:00",
    room: "Aula C-101",
    teacher: "Dr. Vargas",
  },
  {
    id: "sch5",
    course: "Matemática Discreta",
    day: "Viernes",
    time: "10:00 – 12:00",
    room: "Aula A-305",
    teacher: "Mg. Flores",
  },
];

// ─── Mock attendance records (one per student per day) ───────────────────────

export const MOCK_ATTENDANCE: AttendanceRecord[] = [
  // ── Carlos Eduardo Ramírez (s001) ──
  { id: "a001", studentId: "s001", studentName: "Carlos Eduardo Ramírez", studentCode: "2021050123", date: "2026-04-21", time: "08:03", status: "presente" },
  { id: "a002", studentId: "s001", studentName: "Carlos Eduardo Ramírez", studentCode: "2021050123", date: "2026-04-22", time: "10:18", status: "tardanza", note: "Llegó 18 min tarde" },
  { id: "a003", studentId: "s001", studentName: "Carlos Eduardo Ramírez", studentCode: "2021050123", date: "2026-04-23", time: "—", status: "falta" },
  { id: "a004", studentId: "s001", studentName: "Carlos Eduardo Ramírez", studentCode: "2021050123", date: "2026-04-24", time: "07:55", status: "presente" },
  { id: "a005", studentId: "s001", studentName: "Carlos Eduardo Ramírez", studentCode: "2021050123", date: "2026-04-25", time: "08:01", status: "presente" },

  // ── María Lucía Herrera (s002) ──
  { id: "a006", studentId: "s002", studentName: "María Lucía Herrera", studentCode: "2021050456", date: "2026-04-21", time: "07:58", status: "presente" },
  { id: "a007", studentId: "s002", studentName: "María Lucía Herrera", studentCode: "2021050456", date: "2026-04-22", time: "08:02", status: "presente" },
  { id: "a008", studentId: "s002", studentName: "María Lucía Herrera", studentCode: "2021050456", date: "2026-04-23", time: "08:00", status: "presente" },
  { id: "a009", studentId: "s002", studentName: "María Lucía Herrera", studentCode: "2021050456", date: "2026-04-24", time: "—", status: "falta" },
  { id: "a010", studentId: "s002", studentName: "María Lucía Herrera", studentCode: "2021050456", date: "2026-04-25", time: "08:10", status: "tardanza", note: "Llegó 10 min tarde" },

  // ── Andrés Felipe Gutiérrez (s003) ──
  { id: "a011", studentId: "s003", studentName: "Andrés Felipe Gutiérrez", studentCode: "2021050789", date: "2026-04-21", time: "—", status: "falta" },
  { id: "a012", studentId: "s003", studentName: "Andrés Felipe Gutiérrez", studentCode: "2021050789", date: "2026-04-22", time: "08:05", status: "presente" },
  { id: "a013", studentId: "s003", studentName: "Andrés Felipe Gutiérrez", studentCode: "2021050789", date: "2026-04-23", time: "08:15", status: "presente" },
  { id: "a014", studentId: "s003", studentName: "Andrés Felipe Gutiérrez", studentCode: "2021050789", date: "2026-04-24", time: "08:22", status: "tardanza", note: "Llegó 22 min tarde" },
  { id: "a015", studentId: "s003", studentName: "Andrés Felipe Gutiérrez", studentCode: "2021050789", date: "2026-04-25", time: "08:00", status: "presente" },

  // ── Sofía Isabel Paredes (s004) ──
  { id: "a016", studentId: "s004", studentName: "Sofía Isabel Paredes", studentCode: "2021051001", date: "2026-04-21", time: "08:00", status: "presente" },
  { id: "a017", studentId: "s004", studentName: "Sofía Isabel Paredes", studentCode: "2021051001", date: "2026-04-22", time: "07:59", status: "presente" },
  { id: "a018", studentId: "s004", studentName: "Sofía Isabel Paredes", studentCode: "2021051001", date: "2026-04-23", time: "—", status: "falta" },
  { id: "a019", studentId: "s004", studentName: "Sofía Isabel Paredes", studentCode: "2021051001", date: "2026-04-24", time: "08:04", status: "presente" },
  { id: "a020", studentId: "s004", studentName: "Sofía Isabel Paredes", studentCode: "2021051001", date: "2026-04-25", time: "—", status: "falta" },
];

// ─── Attendance summary ───────────────────────────────────────────────────────

export const STUDENT_SUMMARY = {
  total: 20,
  present: 14,
  late: 3,
  absent: 3,
  percentage: 85,
};

// ─── Students list (for admin) ────────────────────────────────────────────────

export const MOCK_STUDENTS: Student[] = [
  {
    id: "s001",
    name: "Carlos Eduardo Ramírez",
    code: "2021050123",
    email: "c.ramirez@universidad.edu.pe",
    career: "Ing. de Sistemas",
    semester: "VI Sem.",
    avatarInitials: "CR",
    avatarColor: "#4f46e5",
  },
  {
    id: "s002",
    name: "María Lucía Herrera",
    code: "2021050456",
    email: "m.herrera@universidad.edu.pe",
    career: "Ing. de Sistemas",
    semester: "VI Sem.",
    avatarInitials: "MH",
    avatarColor: "#06b6d4",
  },
  {
    id: "s003",
    name: "Andrés Felipe Gutiérrez",
    code: "2021050789",
    email: "a.gutierrez@universidad.edu.pe",
    career: "Ing. de Sistemas",
    semester: "VI Sem.",
    avatarInitials: "AG",
    avatarColor: "#10b981",
  },
  {
    id: "s004",
    name: "Sofía Isabel Paredes",
    code: "2021051001",
    email: "s.paredes@universidad.edu.pe",
    career: "Ing. de Sistemas",
    semester: "VI Sem.",
    avatarInitials: "SP",
    avatarColor: "#f59e0b",
  },
];

// ─── Courses list ─────────────────────────────────────────────────────────────

export const MOCK_COURSES = [
  "Algoritmos y Estructuras de Datos",
  "Base de Datos I",
  "Desarrollo Web",
  "Redes y Comunicaciones",
  "Matemática Discreta",
];
