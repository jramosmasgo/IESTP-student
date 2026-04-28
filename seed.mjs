import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDxCnhIf4Y7r-PTkac7gWBrQKZ1TQuFOYk",
  authDomain: "student-attendance-8a244.firebaseapp.com",
  projectId: "student-attendance-8a244",
  storageBucket: "student-attendance-8a244.firebasestorage.app",
  messagingSenderId: "926914730061",
  appId: "1:926914730061:web:366cd04f3e9bbf0656e404"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const students = [
  {
    Semester: "V",
    degree: "ASISTENCIA ADMINISTRATIVA",
    dni: "81234567",
    email: "81234567@institutocajas.edu.pe",
    name: "Jorge",
    qr_data: "aK9dP2LmX8qZ",
    surname: "Lopez Huamani"
  },
  {
    Semester: "V",
    degree: "ASISTENCIA ADMINISTRATIVA",
    dni: "74561238",
    email: "74561238@institutocajas.edu.pe",
    name: "Maria",
    qr_data: "Zx7Pq1RtY5Lm",
    surname: "Ramirez Quispe"
  },
  {
    Semester: "V",
    degree: "ASISTENCIA ADMINISTRATIVA",
    dni: "76903421",
    email: "76903421@institutocajas.edu.pe",
    name: "Carlos",
    qr_data: "Qw8LmN2XpR6a",
    surname: "Perez Cahuana"
  }
];

async function seed() {
  for (const student of students) {
    try {
      console.log(`Creating user ${student.email}...`);
      const userCredential = await createUserWithEmailAndPassword(auth, student.email, student.dni);
      console.log(`Auth created for ${student.email}`);
      
      await addDoc(collection(db, "student"), student);
      console.log(`Firestore document created for ${student.name}`);
    } catch (e) {
      console.error(`Error processing ${student.name}:`, e.message);
    }
  }
  process.exit();
}

seed();
