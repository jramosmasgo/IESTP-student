"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, updateDoc, doc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { showSuccess, showError } from "@/lib/swal";

interface Staff {
  id: string;
  name: string;
  surname: string;
  dni: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  active?: boolean;
}

export default function TeachersPage() {
  const { loading: authLoading } = useAuth();
  const [teachers, setTeachers] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    dni: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    if (authLoading) return;

    const q = query(
      collection(db, "staff"),
      where("role", "==", "profesor")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const teacherList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Staff[];
      setTeachers(teacherList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [authLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        role: "profesor",
        updatedAt: serverTimestamp(),
      };

      if (editId) {
        await updateDoc(doc(db, "staff", editId), payload);
      } else {
        await addDoc(collection(db, "staff"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }
      
      closeModal();
      showSuccess(editId ? "Actualizado" : "Registrado", editId ? "Datos actualizados correctamente." : "Profesor registrado exitosamente.");
    } catch (error) {
      console.error("Error saving teacher:", error);
      showError("Error al guardar", "No se pudo guardar la información.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (teacher: Staff) => {
    setFormData({
      name: teacher.name,
      surname: teacher.surname,
      dni: teacher.dni,
      email: teacher.email,
      phone: teacher.phone,
      address: teacher.address,
    });
    setEditId(teacher.id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditId(null);
    setFormData({
      name: "",
      surname: "",
      dni: "",
      email: "",
      phone: "",
      address: "",
    });
  };

  const toggleStatus = async (teacher: Staff) => {
    const newStatus = teacher.active === false;
    try {
      await updateDoc(doc(db, "staff", teacher.id), {
        active: newStatus
      });
      showSuccess(
        newStatus ? "Activado" : "Desactivado", 
        `El profesor ahora está ${newStatus ? "activo" : "inactivo"}.`
      );
    } catch (error) {
      console.error("Error toggling status:", error);
      showError("Error", "No se pudo cambiar el estado del profesor.");
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
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0D1A3E]">Personal Docente</h1>
          <p className="text-sm text-[#4A5680] mt-1">
            Gestiona el listado de profesores y registra nuevos integrantes.
          </p>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-[#4A5680] uppercase tracking-wider">Docente</th>
                <th className="px-6 py-4 text-xs font-bold text-[#4A5680] uppercase tracking-wider hidden sm:table-cell">DNI</th>
                <th className="px-6 py-4 text-xs font-bold text-[#4A5680] uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-xs font-bold text-[#4A5680] uppercase tracking-wider hidden md:table-cell">Contacto</th>
                <th className="px-6 py-4 text-xs font-bold text-[#4A5680] uppercase tracking-wider hidden lg:table-cell">Dirección</th>
                <th className="px-6 py-4 text-xs font-bold text-[#4A5680] uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {teachers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No hay profesores registrados.
                  </td>
                </tr>
              ) : (
                teachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#F0F2F8] text-[#1B2B6B] flex items-center justify-center font-bold text-xs shrink-0">
                          {teacher.name[0]}{teacher.surname[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 leading-tight">{teacher.name} {teacher.surname}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[120px] sm:max-w-none">{teacher.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono hidden sm:table-cell">
                      {teacher.dni}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        teacher.active !== false 
                          ? "bg-green-50 text-green-600 border border-green-100" 
                          : "bg-red-50 text-red-600 border border-red-100"
                      }`}>
                        {teacher.active !== false ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <p className="text-sm text-gray-700">{teacher.phone}</p>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <p className="text-sm text-gray-500 truncate max-w-[200px]">{teacher.address}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(teacher)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                          title="Editar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => toggleStatus(teacher)}
                          title={teacher.active !== false ? "Desactivar" : "Activar"}
                          className={`p-2 rounded-xl transition-all ${
                            teacher.active !== false 
                              ? "text-red-400 hover:text-red-600 hover:bg-red-50" 
                              : "text-green-400 hover:text-green-600 hover:bg-green-50"
                          }`}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {teacher.active !== false ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            )}
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#0D1A3E]">
                {editId ? "Editar Información del Docente" : "Registrar Docente"}
              </h3>
              <button 
                onClick={closeModal}
                className="p-2 rounded-full hover:bg-gray-100 transition text-gray-400"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nombre</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#1B2B6B] outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Apellidos</label>
                  <input
                    required
                    type="text"
                    value={formData.surname}
                    onChange={(e) => setFormData({...formData, surname: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#1B2B6B] outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">DNI</label>
                <input
                  required
                  type="text"
                  maxLength={8}
                  value={formData.dni}
                  onChange={(e) => setFormData({...formData, dni: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#1B2B6B] outline-none transition font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Correo Institucional</label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#1B2B6B] outline-none transition"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Teléfono</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#1B2B6B] outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Dirección</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#1B2B6B] outline-none transition"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-[#1B2B6B] text-white rounded-2xl font-bold hover:bg-[#14205A] transition disabled:opacity-50"
                >
                  {isSubmitting ? "Guardando..." : "Actualizar Información"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
