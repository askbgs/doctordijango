"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/providers/auth-provider";
import api from "@/lib/api";

export default function ProfilePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name);
      setLastName(user.last_name);
      setPhone(user.phone || "");
    }
  }, [user]);

  const updateProfile = useMutation({
    mutationFn: async () => {
      await api.patch("/auth/profile/", { first_name: firstName, last_name: lastName, phone });
    },
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.first_name = firstName;
        parsed.last_name = lastName;
        parsed.phone = phone;
        parsed.full_name = `${firstName} ${lastName}`;
        localStorage.setItem("user", JSON.stringify(parsed));
      }
    },
  });

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Profile</h1>
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          {saved && (
            <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">Profile updated successfully.</div>
          )}
          <Input id="email" label="Email" value={user?.email || ""} disabled />
          <div className="grid grid-cols-2 gap-4">
            <Input id="first_name" label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            <Input id="last_name" label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
          <Input id="phone" label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Button onClick={() => updateProfile.mutate()} disabled={updateProfile.isPending}>
            {updateProfile.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
