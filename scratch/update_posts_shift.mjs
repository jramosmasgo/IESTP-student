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

async function updatePostsShift() {
  console.log("Iniciando actualización de turnos en publicaciones (posts)...");
  try {
    const querySnapshot = await getDocs(collection(db, "post"));
    console.log(`Encontrados ${querySnapshot.size} posts.`);

    for (const postDoc of querySnapshot.docs) {
      const data = postDoc.data();
      
      if (!data.shift) {
        await updateDoc(doc(db, "post", postDoc.id), { shift: "diurno" });
        console.log(`Actualizado post: ${data.title} -> Turno: diurno`);
      } else {
        console.log(`Post ya tiene turno: ${data.title} (${data.shift})`);
      }
    }
    console.log("Actualización de posts completada.");
  } catch (error) {
    console.error("Error actualizando posts:", error);
  }
  process.exit(0);
}

updatePostsShift();
