"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuth } from "@/providers/auth-provider";

export default function SettingsPage() {
  const { currentOrg, organizations, selectOrganization } = useAuth();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Settings</h1>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Organization</h2>
        </CardHeader>
        <CardContent>
          {organizations.length > 1 ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Active Organization</label>
              <select
                value={currentOrg?.organization_id || ""}
                onChange={(e) => selectOrganization(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {organizations.map((org) => (
                  <option key={org.organization_id} value={org.organization_id}>
                    {org.organization_name} ({org.role})
                  </option>
                ))}
              </select>
            </div>
          ) : currentOrg ? (
            <div>
              <p className="text-sm text-gray-600">
                <span className="font-medium">{currentOrg.organization_name}</span>
                {" "}({currentOrg.role.replace("_", " ")})
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No organization assigned.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
