interface RegisterFormState {
  name: string;
  email: string;
  mobile: string;
  postcode: string;
  services: string[];
}

interface RegisterFormErrors {
  name?: string;
  email?: string;
  mobile?: string;
  postcode?: string;
  services?: string;
}

export function validateRegisterForm(
  form: RegisterFormState,
): RegisterFormErrors {
  const errors: RegisterFormErrors = {};
  if (!form.name.trim()) errors.name = "Name is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errors.email = "Invalid email address";
  if (!/^04\d{8}$/.test(form.mobile))
    errors.mobile = "Must be a valid Australian mobile (04XXXXXXXX)";
  if (!/^\d{4}$/.test(form.postcode))
    errors.postcode = "Must be a 4-digit postcode";
  if (form.services.length === 0)
    errors.services = "Select at least one service";
  return errors;
}
