import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function updateStudentsShift() {
  console.log("Iniciando actualización de turnos en estudiantes...");
  try {
    const querySnapshot = await getDocs(collection(db, "student"));
    console.log(`Encontrados ${querySnapshot.size} estudiantes.`);

    for (const studentDoc of querySnapshot.docs) {
      const data = studentDoc.data();
      
      if (!data.shift) {
        await updateDoc(doc(db, "student", studentDoc.id), { shift: "diurno" });
        console.log(`Actualizado estudiante: ${data.name} ${data.surname} -> Turno: diurno`);
      } else {
        console.log(`Estudiante ya tiene turno: ${data.name} (${data.shift})`);
      }
    }
    console.log("Actualización de estudiantes completada.");
  } catch (error) {
    console.error("Error actualizando estudiantes:", error);
  }
  process.exit(0);
}

updateStudentsShift();
