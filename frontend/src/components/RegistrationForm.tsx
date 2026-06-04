import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { REGISTER_MUTATION } from "../graphql/mutations";
import { SERVICES_QUERY } from "../graphql/queries";
import type { Service } from "../graphql/queries";
import { validateRegisterForm } from "../utils/validation";

interface FormState {
  name: string;
  email: string;
  mobile: string;
  postcode: string;
  services: string[];
}

interface FormErrors {
  name?: string;
  email?: string;
  mobile?: string;
  postcode?: string;
  services?: string;
  api?: string;
}

const emptyForm: FormState = {
  name: "",
  email: "",
  mobile: "",
  postcode: "",
  services: [],
};

function getApiError(error: unknown): string {
  if (CombinedGraphQLErrors.is(error)) {
    const first = error.errors[0];
    if (first?.extensions?.code === "BAD_USER_INPUT") return first.message;
  }
  return "Something went wrong. Please try again.";
}

export default function RegistrationForm() {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState(false);

  const { data: servicesData, loading: servicesLoading } =
    useQuery(SERVICES_QUERY);

  const [register, { loading }] = useMutation(REGISTER_MUTATION, {
    onCompleted: () => {
      setForm(emptyForm);
      setErrors({});
      setSuccess(true);
    },
    onError: (error) => {
      setErrors({ api: getApiError(error) });
    },
  });

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setSuccess(false);
    const validationErrors = validateRegisterForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    register({ variables: form });
  }

  function toggleService(slug: string) {
    setForm((prev) => ({
      ...prev,
      services: prev.services.includes(slug)
        ? prev.services.filter((s) => s !== slug)
        : [...prev.services, slug],
    }));
  }

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Express Interest
      </h2>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
          Thank you! Your interest has been registered.
        </div>
      )}

      {errors.api && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          {errors.api}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <Field label="Full name" error={errors.name}>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="Jane Smith"
            className={inputClass(!!errors.name)}
          />
        </Field>

        <Field label="Email" error={errors.email}>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            placeholder="jane@example.com"
            className={inputClass(!!errors.email)}
          />
        </Field>

        <Field label="Mobile" error={errors.mobile}>
          <input
            type="tel"
            value={form.mobile}
            onChange={(e) => setForm((p) => ({ ...p, mobile: e.target.value }))}
            placeholder="0412345678"
            className={inputClass(!!errors.mobile)}
          />
        </Field>

        <Field label="Postcode" error={errors.postcode}>
          <input
            type="text"
            value={form.postcode}
            onChange={(e) =>
              setForm((p) => ({ ...p, postcode: e.target.value }))
            }
            placeholder="2000"
            maxLength={4}
            className={inputClass(!!errors.postcode)}
          />
        </Field>

        <Field label="Services" error={errors.services}>
          {servicesLoading ? (
            <p className="text-sm text-gray-400">Loading services…</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {servicesData?.services.map((s: Service) => (
                <label
                  key={s.slug}
                  className="flex items-center gap-2 cursor-pointer text-sm text-gray-700"
                >
                  <input
                    type="checkbox"
                    checked={form.services.includes(s.slug)}
                    onChange={() => toggleService(s.slug)}
                    className="rounded border-gray-300 text-blue-600"
                  />
                  {s.label}
                </label>
              ))}
            </div>
          )}
        </Field>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {loading ? "Submitting…" : "Register Interest"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

function inputClass(hasError: boolean) {
  return [
    "w-full px-3 py-2 text-sm border rounded-lg outline-none transition-colors",
    hasError
      ? "border-red-400 focus:ring-2 focus:ring-red-200"
      : "border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100",
  ].join(" ");
}
