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

async function updateCoursesShift() {
  console.log("Iniciando actualización de turnos en cursos...");
  try {
    const querySnapshot = await getDocs(collection(db, "course"));
    console.log(`Encontrados ${querySnapshot.size} cursos.`);

    for (const courseDoc of querySnapshot.docs) {
      const data = courseDoc.data();
      
      if (!data.shift) {
        await updateDoc(doc(db, "course", courseDoc.id), { shift: "diurno" });
        console.log(`Actualizado curso: ${data.name} -> Turno: diurno`);
      } else {
        console.log(`Curso ya tiene turno: ${data.name} (${data.shift})`);
      }
    }
    console.log("Actualización de cursos completada.");
  } catch (error) {
    console.error("Error actualizando cursos:", error);
  }
  process.exit(0);
}

updateCoursesShift();
