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

const generatePhone = () => {
  const rest = Math.floor(10000000 + Math.random() * 90000000);
  return `9${rest}`;
};

async function updateStudents() {
  console.log("Iniciando actualización de estudiantes...");
  try {
    const querySnapshot = await getDocs(collection(db, "student"));
    console.log(`Encontrados ${querySnapshot.size} estudiantes.`);

    for (const studentDoc of querySnapshot.docs) {
      const data = studentDoc.data();
      
      const updates = {};
      if (!data.phone) updates.phone = generatePhone();
      if (!data.emergency_phone) updates.emergency_phone = generatePhone();

      if (Object.keys(updates).length > 0) {
        await updateDoc(doc(db, "student", studentDoc.id), updates);
        console.log(`Actualizado estudiante: ${data.name} ${data.surname} (${studentDoc.id})`);
      } else {
        console.log(`Estudiante ya tiene datos: ${data.name} ${data.surname}`);
      }
    }
    console.log("Actualización completada exitosamente.");
  } catch (error) {
    console.error("Error actualizando estudiantes:", error);
  }
  process.exit(0);
}

updateStudents();
