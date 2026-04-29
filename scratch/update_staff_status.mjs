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

async function updateStaffStatus() {
  console.log("Iniciando actualización de estado (activo) en staff...");
  try {
    const querySnapshot = await getDocs(collection(db, "staff"));
    console.log(`Encontrados ${querySnapshot.size} miembros de staff.`);

    for (const staffDoc of querySnapshot.docs) {
      const data = staffDoc.data();
      
      if (data.active === undefined) {
        await updateDoc(doc(db, "staff", staffDoc.id), { active: true });
        console.log(`Actualizado staff: ${data.name} ${data.surname} -> Estado: Activo`);
      } else {
        console.log(`Staff ya tiene estado: ${data.name} (${data.active})`);
      }
    }
    console.log("Actualización de staff completada.");
  } catch (error) {
    console.error("Error actualizando staff:", error);
  }
  process.exit(0);
}

updateStaffStatus();
