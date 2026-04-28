"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  where, 
  onSnapshot,
  Timestamp
} from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";

interface Post {
  id: string;
  title: string;
  message: string;
  authorName: string;
  degree: string;
  semester: string;
  createdAt: Timestamp;
}

export default function StudentPostsPage() {
  const { userData, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !userData) return;

    // Filtrar publicaciones por la carrera y semestre del estudiante
    const q = query(
      collection(db, "post"),
      where("degree", "==", userData.degree),
      where("semester", "==", userData.Semester || userData.semester || "V")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[];

      // Ordenar en el cliente para evitar la necesidad de un índice compuesto en Firestore
      list.sort((a, b) => {
        const dateA = a.createdAt?.toDate().getTime() ?? 0;
        const dateB = b.createdAt?.toDate().getTime() ?? 0;
        return dateB - dateA;
      });

      setPosts(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userData, authLoading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[#1B2B6B] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0D1A3E]">Muro de Avisos</h1>
        <p className="text-sm text-[#4A5680] mt-1">
          Mantente informado con las últimas noticias de tus docentes para {userData?.degree}.
        </p>
      </div>

      <div className="space-y-6">
        {posts.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-400">Sin avisos nuevos</h3>
            <p className="text-sm text-gray-400 mt-1">No hay publicaciones recientes para tu carrera y semestre.</p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6 md:p-8">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#1B2B6B] text-white flex items-center justify-center font-bold text-sm">
                    {post.authorName?.[0] || "D"}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#0D1A3E]">{post.authorName}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      {post.createdAt?.toDate().toLocaleDateString('es-ES', { day: '2-digit', month: 'long' })}
                    </p>
                  </div>
                  <div className="ml-auto flex gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#F0F2F8] text-[#1B2B6B] uppercase">
                      Semestre {post.semester}
                    </span>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-[#0D1A3E] mb-3">{post.title}</h2>
                <div className="text-sm text-[#4A5680] leading-relaxed whitespace-pre-wrap">
                  {post.message}
                </div>
              </div>
              <div className="bg-[#F8FAFC] px-8 py-3 border-t border-gray-50 flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                  Publicado para {post.degree}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
