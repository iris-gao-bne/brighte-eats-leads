import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client/react";
import { LEADS_QUERY, SERVICES_QUERY } from "../graphql/queries";
import type { Lead, Service } from "../graphql/queries";
import LeadDetail from "../components/LeadDetail";

const PAGE_SIZE = 10;

export default function DashboardPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);

  const offset = (page - 1) * PAGE_SIZE;

  const { data, loading, error } = useQuery(LEADS_QUERY, {
    variables: {
      limit: PAGE_SIZE,
      offset,
      services: activeFilters.length > 0 ? activeFilters : undefined,
    },
  });

  const { data: servicesData } = useQuery(SERVICES_QUERY);

  function toggleFilter(slug: string) {
    setPage(1);
    setActiveFilters((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  }

  const total = data?.leads.total ?? 0;
  const items = data?.leads.items ?? [];
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const from = total === 0 ? 0 : offset + 1;
  const to = Math.min(offset + PAGE_SIZE, total);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Leads</h2>
        <button
          onClick={() => navigate("/register")}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Register Interest
        </button>
      </div>

      {/* Service filter */}
      {servicesData && servicesData.services.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {servicesData.services.map((s: Service) => {
            const active = activeFilters.includes(s.slug);
            return (
              <button
                key={s.slug}
                onClick={() => toggleFilter(s.slug)}
                className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                  active
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-white border-gray-300 text-gray-600 hover:border-blue-400"
                }`}
              >
                {s.label}
              </button>
            );
          })}
          {activeFilters.length > 0 && (
            <button
              onClick={() => { setActiveFilters([]); setPage(1); }}
              className="px-3 py-1 text-sm text-gray-400 hover:text-gray-600"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-400">Loading…</div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-500">
            Failed to load leads.
          </div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">
            No leads found.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Name", "Email", "Postcode", "Services", "Registered"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((lead: Lead) => (
                <tr
                  key={lead.id}
                  onClick={() => setSelectedLeadId(lead.id)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-gray-800">{lead.name}</td>
                  <td className="px-4 py-3 text-gray-600">{lead.email}</td>
                  <td className="px-4 py-3 text-gray-600">{lead.postcode}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {lead.services.map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-100"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {total > 0 && (
        <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
          <span>Showing {from}–{to} of {total}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
              className="px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {selectedLeadId !== null && (
        <LeadDetail
          leadId={selectedLeadId}
          onClose={() => setSelectedLeadId(null)}
        />
      )}
    </div>
  );
}
