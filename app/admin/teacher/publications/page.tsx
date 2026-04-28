"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc,
  serverTimestamp,
  deleteDoc,
  doc,
  Timestamp
} from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";

interface Publication {
  id: string;
  title: string;
  content: string;
  message: string;
  degree: string;
  semester: string;
  authorName: string;
  createdAt: Timestamp;
}

const DEGREES = [
  "ASISTENCIA ADMINISTRATIVA",
  "DISEÑO Y PROGRAMACIÓN WEB",
  "ELECTRICIDAD INDUSTRIAL",
  "ELECTRÓNICA INDUSTRIAL",
  "MANTENIMIENTO DE MAQUINARIA PESADA",
  "MECATRÓNICA AUTOMOTRIZ",
  "MECÁNICA DE PRODUCCIÓN INDUSTRIAL",
  "METALURGIA",
  "TECNOLOGÍA DE ANÁLISIS QUÍMICO"
];

const SEMESTERS = ["I", "II", "III", "IV", "V", "VI"];

export default function PublicationsPage() {
  const { userData, loading: authLoading } = useAuth();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    degree: "ASISTENCIA ADMINISTRATIVA",
    semester: "I",
  });

  useEffect(() => {
    if (authLoading || !userData) return;

    // Solo vemos las publicaciones creadas por este profesor
    const q = query(
      collection(db, "post"),
      where("createdBy", "==", `/staff/${userData.id || userData.dni}`)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Publication[];

      // Ordenar en el cliente para evitar requerir un índice compuesto en Firestore
      list.sort((a, b) => {
        const dateA = a.createdAt?.toDate().getTime() ?? 0;
        const dateB = b.createdAt?.toDate().getTime() ?? 0;
        return dateB - dateA;
      });

      setPublications(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userData, authLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        title: formData.title,
        message: formData.content,
        degree: formData.degree,
        semester: formData.semester,
        updatedAt: serverTimestamp(),
      };

      if (editId) {
        await updateDoc(doc(db, "post", editId), payload);
      } else {
        await addDoc(collection(db, "post"), {
          ...payload,
          createdBy: `/staff/${userData?.id || userData?.dni}`,
          authorName: `${userData?.name} ${userData?.surname}`,
          createdAt: serverTimestamp(),
        });
      }
      
      closeModal();
    } catch (error) {
      console.error("Error saving publication:", error);
      alert("Error al guardar el mensaje.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (pub: Publication) => {
    setFormData({
      title: pub.title,
      content: pub.message,
      degree: pub.degree,
      semester: pub.semester,
    });
    setEditId(pub.id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditId(null);
    setFormData({
      title: "",
      content: "",
      degree: "ASISTENCIA ADMINISTRATIVA",
      semester: "I",
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta publicación?")) return;
    try {
      await deleteDoc(doc(db, "post", id));
    } catch (error) {
      console.error("Error deleting publication:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[#1B2B6B] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0D1A3E]">Publicaciones y Mensajes</h1>
          <p className="text-sm text-[#4A5680] mt-1">
            Envía avisos o materiales a estudiantes de carreras y semestres específicos.
          </p>
        </div>
        <button
          onClick={() => {
            closeModal();
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1B2B6B] hover:bg-[#14205A] text-white rounded-xl font-semibold transition shadow-lg shadow-blue-900/10"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01" />
          </svg>
          Nueva Publicación
        </button>
      </div>

      <div className="space-y-4">
        {publications.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
            <p className="text-gray-400 font-medium">No has realizado publicaciones aún.</p>
          </div>
        ) : (
          publications.map((pub) => (
            <div key={pub.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:border-blue-100 transition-colors group">
              <div className="flex justify-between items-start mb-3">
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-blue-50 text-blue-700 uppercase">
                    {pub.degree}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-purple-50 text-purple-700 uppercase">
                    Semestre {pub.semester}
                  </span>
                </div>
                 <div className="flex gap-1 sm:gap-2">
                  <button 
                    onClick={() => openEditModal(pub)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => handleDelete(pub.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{pub.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap mb-4">
                {pub.message}
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-gray-50 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                <span>Por: {pub.authorName}</span>
                <span>{pub.createdAt?.toDate().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Publication Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-xl w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#0D1A3E]">
                {editId ? "Editar Publicación" : "Nueva Publicación"}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Dirigido a Carrera</label>
                  <select
                    value={formData.degree}
                    onChange={(e) => setFormData({...formData, degree: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none transition text-sm"
                  >
                    {DEGREES.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Semestre</label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({...formData, semester: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none transition text-sm"
                  >
                    {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Título del mensaje</label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Ej: Cambio de aula para mañana"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none transition text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Contenido</label>
                <textarea
                  required
                  rows={5}
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder="Escribe el mensaje detallado aquí..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none transition text-sm resize-none"
                ></textarea>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-[#1B2B6B] text-white rounded-2xl font-bold hover:bg-[#14205A] transition shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? "Guardando..." : (editId ? "Actualizar Publicación" : "Publicar Mensaje")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
