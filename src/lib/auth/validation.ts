export function validateEmail(email: string): string | null {
  if (!email.trim()) return "Email harus diisi";
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email.trim())) return "Format email tidak valid";
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return "Password harus diisi";
  if (password.length < 6) return "Password minimal 6 karakter";
  return null;
}

export function validateName(name: string): string | null {
  if (!name.trim()) return "Nama harus diisi";
  if (name.trim().length < 2) return "Nama minimal 2 karakter";
  return null;
}

export function validateConfirmPassword(password: string, confirm: string): string | null {
  if (!confirm) return "Konfirmasi password harus diisi";
  if (password !== confirm) return "Password tidak cocok";
  return null;
}
