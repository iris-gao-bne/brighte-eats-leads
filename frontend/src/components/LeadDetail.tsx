import { useQuery } from "@apollo/client/react";
import { LEAD_QUERY } from "../graphql/queries";

interface Props {
  leadId: number;
  onClose: () => void;
}

export default function LeadDetail({ leadId, onClose }: Props) {
  const { data, loading } = useQuery(LEAD_QUERY, {
    variables: { id: leadId },
  });

  const lead = data?.lead;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-50 w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-5">
          <div className="flex items-start justify-between">
            <div>
              {loading ? (
                <div className="h-6 w-32 bg-white/20 rounded animate-pulse" />
              ) : (
                <h3 className="text-lg font-semibold text-white">
                  {lead?.name}
                </h3>
              )}
              <p className="text-blue-100 text-sm mt-0.5">{lead?.email}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors text-2xl leading-none ml-4"
            >
              ×
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {loading && (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-4 bg-gray-100 rounded animate-pulse"
                />
              ))}
            </div>
          )}

          {lead && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Mobile" value={lead.mobile} />
                <Field label="Postcode" value={lead.postcode} />
              </div>

              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                  Interested in
                </p>
                <div className="flex flex-wrap gap-2">
                  {lead.services.map((s) => (
                    <span
                      key={s}
                      className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full border border-blue-100"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  Registered {new Date(lead.createdAt).toLocaleString()}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-sm font-medium text-gray-800">{value}</p>
    </div>
  );
}
