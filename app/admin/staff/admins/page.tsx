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
  deleteDoc,
  doc,
  serverTimestamp 
} from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { showSuccess, showError, showConfirm } from "@/lib/swal";

interface Staff {
  id: string;
  name: string;
  surname: string;
  dni: string;
  email: string;
  phone: string;
  address: string;
  role: string;
}

export default function AdminsPage() {
  const { loading: authLoading } = useAuth();
  const [admins, setAdmins] = useState<Staff[]>([]);
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
    role: "administrador",
  });

  useEffect(() => {
    if (authLoading) return;

    // Filtramos por ambos roles administrativos
    const q = query(
      collection(db, "staff"),
      where("role", "in", ["administrador", "superadministrador"])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const adminList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Staff[];
      setAdmins(adminList);
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
      
      showSuccess(editId ? "Actualizado" : "Registrado", editId ? "Los datos han sido actualizados." : "El administrativo ha sido registrado correctamente.");
      closeModal();
    } catch (error) {
      console.error("Error saving admin:", error);
      showError("Error al guardar", "Hubo un problema al intentar guardar los datos.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (admin: Staff) => {
    setFormData({
      name: admin.name,
      surname: admin.surname,
      dni: admin.dni,
      email: admin.email,
      phone: admin.phone,
      address: admin.address,
      role: admin.role,
    });
    setEditId(admin.id);
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
      role: "administrador",
    });
  };

  const handleDelete = async (id: string) => {
    const result = await showConfirm("¿Eliminar administrativo?", "Esta acción quitará los permisos de acceso.");
    if (!result.isConfirmed) return;

    try {
      await deleteDoc(doc(db, "staff", id));
      showSuccess("Eliminado", "El registro ha sido eliminado.");
    } catch (error) {
      console.error("Error deleting admin:", error);
      showError("Error", "No se pudo eliminar el registro.");
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
          <h1 className="text-2xl font-bold text-[#0D1A3E]">Staff Administrativo</h1>
          <p className="text-sm text-[#4A5680] mt-1">
            Gestiona los accesos administrativos y jerarquías del sistema.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#CC1116] hover:bg-[#A50E12] text-white rounded-xl font-semibold transition shadow-lg shadow-red-900/10 active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Nuevo Administrativo
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-[#4A5680] uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-4 text-xs font-bold text-[#4A5680] uppercase tracking-wider hidden sm:table-cell">DNI</th>
                <th className="px-6 py-4 text-xs font-bold text-[#4A5680] uppercase tracking-wider">Rol</th>
                <th className="px-6 py-4 text-xs font-bold text-[#4A5680] uppercase tracking-wider hidden md:table-cell">Contacto</th>
                <th className="px-6 py-4 text-xs font-bold text-[#4A5680] uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {admins.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No hay personal administrativo registrado.
                  </td>
                </tr>
              ) : (
                admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#FFF0F0] text-[#CC1116] flex items-center justify-center font-bold text-xs shrink-0">
                          {admin.name[0]}{admin.surname[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 leading-tight">{admin.name} {admin.surname}</p>
                          <p className="text-xs text-gray-400 sm:hidden">{admin.dni}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono hidden sm:table-cell">
                      {admin.dni}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                        admin.role === 'administrador' 
                          ? 'text-[#1B2B6B] bg-[#F0F2F8]' 
                          : 'text-amber-700 bg-amber-50'
                      }`}>
                        {admin.role === 'administrador' ? 'Administrador' : 'Super Admin'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 hidden md:table-cell">
                      {admin.phone}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEditModal(admin)} className="p-2 text-gray-400 hover:text-[#1B2B6B] transition">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button onClick={() => handleDelete(admin.id)} className="p-2 text-gray-400 hover:text-[#CC1116] transition">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#0D1A3E]">
                {editId ? "Editar Administrativo" : "Nuevo Administrativo"}
              </h3>
              <button onClick={closeModal} className="p-2 rounded-full hover:bg-gray-100 transition text-gray-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nombre</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Apellidos</label>
                  <input
                    required
                    type="text"
                    value={formData.surname}
                    onChange={(e) => setFormData({...formData, surname: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">DNI</label>
                  <input
                    required
                    type="text"
                    maxLength={8}
                    value={formData.dni}
                    onChange={(e) => setFormData({...formData, dni: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Rol</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none transition"
                  >
                    <option value="administrador">Administrador</option>
                    <option value="superadministrador">Super Administrador</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Email Institucional</label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Teléfono</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Dirección</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none transition"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-[#CC1116] text-white rounded-2xl font-bold hover:bg-[#A50E12] transition disabled:opacity-50"
                >
                  {isSubmitting ? "Guardando..." : (editId ? "Actualizar Datos" : "Registrar Administrativo")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
