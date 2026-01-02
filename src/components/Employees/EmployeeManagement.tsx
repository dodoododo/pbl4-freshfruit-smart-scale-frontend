import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { X } from "lucide-react";

/* ================= TYPES ================= */

type ApiUser = {
  id: number;
  email: string;
  name: string;
  phone: string;
  address: string;
  birth: string;
  gender: boolean;
  username: string;
  role: boolean;
  valid: boolean;
};

const API = "https://wrap-jefferson-volumes-encounter.trycloudflare.com";

/* ================= SMALL UI ================= */

function Info({
  label,
  value,
  valueClass = "",
}: {
  label: string;
  value: React.ReactNode;
  valueClass?: string;
}) {
  return (
    <div className="bg-gray-50 rounded-md p-3">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`font-medium ${valueClass}`}>{value}</div>
    </div>
  );
}

/* ================= COMPONENT ================= */

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null);
  const [editPayload, setEditPayload] = useState<Partial<ApiUser> | null>(null);

  /* ================= FETCH LIST ================= */

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API}/user/`, {
          headers: { accept: "application/json" },
        });
        if (!res.ok) throw new Error("Fetch failed");
        const data: ApiUser[] = await res.json();
        setEmployees(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  /* ================= DERIVED ================= */

  const filtered = useMemo(() => {
    if (!search.trim()) return employees;
    const q = search.toLowerCase();
    return employees.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.toLowerCase().includes(q)
    );
  }, [employees, search]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  /* ================= ACTIONS ================= */

  const openView = (user: ApiUser) => {
    setSelectedUser(user);
    setViewModalOpen(true);
  };

  const openEdit = (user: ApiUser) => {
    setSelectedUser(user);
    setEditPayload({
      name: user.name,
      phone: user.phone,
      address: user.address,
      birth: user.birth,
      gender: user.gender,
    });
    setEditModalOpen(true);
  };

  const changeUserState = async (user: ApiUser, unlock: boolean) => {
    const url = unlock
      ? `${API}/user/${user.id}/active`
      : `${API}/user/${user.id}/ban`;

    try {
      const res = await fetch(url, {
        method: "PUT",
        headers: { accept: "application/json" },
      });

      if (!res.ok) throw new Error("Failed to change state");

      setEmployees((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, valid: unlock } : u
        )
      );
    } catch (err) {
      console.error(err);
      alert("Không thể cập nhật trạng thái người dùng");
    }
  };

  const saveEdits = async () => {
    if (!selectedUser || !editPayload) return;

    const body = {
      ...selectedUser,
      ...editPayload,
    };

    try {
      const res = await fetch(`${API}/user/profile/${selectedUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Save failed");

      const updated: ApiUser = await res.json();

      setEmployees((prev) =>
        prev.map((u) => (u.id === updated.id ? updated : u))
      );

      setEditModalOpen(false);
      setSelectedUser(null);
      setEditPayload(null);
    } catch (err) {
      console.error(err);
      alert("Save failed");
    }
  };

  /* ================= UI ================= */

  return (
    <motion.div className="p-6 space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card>
        <CardContent>
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-semibold">Employee List</h2>
            <Input
              className="max-w-sm"
              placeholder="Search..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {loading ? (
            <div className="text-center py-6">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 text-center">ID</th>
                    <th className="p-2 text-center">Name</th>
                    <th className="p-2 text-center">Gender</th>
                    <th className="p-2 text-center">Phone</th>
                    <th className="p-2 text-center">Email</th>
                    <th className="p-2 text-center">State</th>
                    <th className="p-2 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {paginated.map((u) => (
                    <tr key={u.id} className="border-t">
                      <td className="p-2 text-center">{u.id}</td>
                      <td className="p-2 text-center">{u.name}</td>
                      <td className="p-2 text-center">
                        {u.gender ? "Male" : "Female"}
                      </td>
                      <td className="p-2 text-center">{u.phone}</td>
                      <td className="p-2 text-center">{u.email}</td>

                      <td className="p-2 text-center">
                        <Select
                          value={u.valid ? "Unlocked" : "Locked"}
                          onValueChange={(v) =>
                            changeUserState(u, v === "Unlocked")
                          }
                        >
                          <SelectTrigger className="w-28 mx-auto">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Unlocked">Unlocked</SelectItem>
                            <SelectItem value="Locked">Locked</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>

                      <td className="p-2">
                        <div className="flex justify-center gap-2">
                          <Button variant="outline" onClick={() => openView(u)}>
                            View
                          </Button>
                          <Button className="bg-green-600" onClick={() => openEdit(u)}>
                            Edit
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* VIEW MODAL */}
      {viewModalOpen && selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setViewModalOpen(false)}
        >
          <div
            className="bg-white w-full max-w-2xl rounded-lg p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3"
              onClick={() => setViewModalOpen(false)}
            >
              <X />
            </button>

            <h3 className="text-lg font-semibold mb-4">User Detail</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <Info label="ID" value={selectedUser.id} />
              <Info label="Username" value={selectedUser.username} />
              <Info label="Name" value={selectedUser.name} />
              <Info label="Email" value={selectedUser.email} />
              <Info label="Phone" value={selectedUser.phone} />
              <Info label="Address" value={selectedUser.address} />
              <Info label="Birthday" value={selectedUser.birth} />
              <Info label="Gender" value={selectedUser.gender ? "Male" : "Female"} />
              <Info label="Role" value={selectedUser.role ? "Admin" : "User"} />
              <Info
                label="Status"
                value={selectedUser.valid ? "Unlocked" : "Locked"}
                valueClass={
                  selectedUser.valid ? "text-green-600" : "text-red-600"
                }
              />
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editModalOpen && selectedUser && editPayload && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setEditModalOpen(false)}
        >
          <div
            className="bg-white w-full max-w-xl rounded-lg p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3"
              onClick={() => setEditModalOpen(false)}
            >
              <X />
            </button>

            <h3 className="text-lg font-semibold mb-4">Edit User</h3>

            <div className="space-y-3">
              <Input
                placeholder="Name"
                value={editPayload.name ?? ""}
                onChange={(e) =>
                  setEditPayload((p) => ({ ...(p ?? {}), name: e.target.value }))
                }
              />

              <Input
                placeholder="Phone"
                value={editPayload.phone ?? ""}
                onChange={(e) =>
                  setEditPayload((p) => ({ ...(p ?? {}), phone: e.target.value }))
                }
              />

              <Input
                placeholder="Address"
                value={editPayload.address ?? ""}
                onChange={(e) =>
                  setEditPayload((p) => ({ ...(p ?? {}), address: e.target.value }))
                }
              />

              <Input
                type="date"
                value={(editPayload.birth ?? "").slice(0, 10)}
                onChange={(e) =>
                  setEditPayload((p) => ({ ...(p ?? {}), birth: e.target.value }))
                }
              />

              <Select
                value={
                  typeof editPayload.gender === "boolean"
                    ? editPayload.gender
                      ? "Male"
                      : "Female"
                    : selectedUser.gender
                    ? "Male"
                    : "Female"
                }
                onValueChange={(v) =>
                  setEditPayload((p) => ({ ...(p ?? {}), gender: v === "Male" }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button className="bg-green-600" onClick={saveEdits}>
                Save
              </Button>
              <Button variant="outline" onClick={() => setEditModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
