import Swal from 'sweetalert2';

const getThemeColors = () => {
  const isLight = document.body.classList.contains('light');
  return {
    background: isLight ? '#ffffff' : '#0f172a',
    color: isLight ? '#0f172a' : '#f8fafc',
    confirmButtonColor: '#6366f1',
    cancelButtonColor: '#ef4444'
  };
};

export const showAlert = (
  title: string,
  text: string,
  icon: 'success' | 'error' | 'warning' | 'info' | 'question' = 'info'
) => {
  const colors = getThemeColors();
  return Swal.fire({
    title,
    text,
    icon,
    background: colors.background,
    color: colors.color,
    confirmButtonColor: colors.confirmButtonColor,
    confirmButtonText: 'Aceptar',
    customClass: {
      popup: 'rounded-2xl border border-slate-800 shadow-2xl animate-fade-in'
    }
  });
};

export const showSuccess = (title: string, text: string) => {
  return showAlert(title, text, 'success');
};

export const showError = (title: string, text: string) => {
  return showAlert(title, text, 'error');
};

export const showInfo = (title: string, text: string) => {
  return showAlert(title, text, 'info');
};

export const showWarning = (title: string, text: string) => {
  return showAlert(title, text, 'warning');
};

export const showConfirm = async (title: string, text: string, confirmText = 'Aceptar'): Promise<boolean> => {
  const colors = getThemeColors();
  const result = await Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    background: colors.background,
    color: colors.color,
    confirmButtonColor: colors.confirmButtonColor,
    cancelButtonColor: colors.cancelButtonColor,
    confirmButtonText: confirmText,
    cancelButtonText: 'Cancelar',
    customClass: {
      popup: 'rounded-2xl border border-slate-800 shadow-2xl animate-fade-in'
    }
  });
  return result.isConfirmed;
};
