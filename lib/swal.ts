import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export const showSuccess = (title: string, text?: string) => {
  return MySwal.fire({
    title,
    text,
    icon: 'success',
    confirmButtonColor: '#1B2B6B',
    confirmButtonText: 'Aceptar',
    customClass: {
      popup: 'rounded-3xl',
      confirmButton: 'rounded-xl px-8 py-3 font-bold',
    },
  });
};

export const showError = (title: string, text?: string) => {
  return MySwal.fire({
    title,
    text,
    icon: 'error',
    confirmButtonColor: '#CC1116',
    confirmButtonText: 'Cerrar',
    customClass: {
      popup: 'rounded-3xl',
      confirmButton: 'rounded-xl px-8 py-3 font-bold',
    },
  });
};

export const showLoading = (title: string = 'Procesando...') => {
  return MySwal.fire({
    title,
    allowOutsideClick: false,
    didOpen: () => {
      MySwal.showLoading();
    },
    customClass: {
      popup: 'rounded-3xl',
    },
  });
};

export const showConfirm = (title: string, text: string, confirmText: string = 'Sí, eliminar') => {
  return MySwal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#CC1116',
    cancelButtonColor: '#6B7280',
    confirmButtonText: confirmText,
    cancelButtonText: 'Cancelar',
    customClass: {
      popup: 'rounded-3xl',
      confirmButton: 'rounded-xl px-6 py-3 font-bold',
      cancelButton: 'rounded-xl px-6 py-3 font-bold',
    },
  });
};

export default MySwal;
