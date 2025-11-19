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

type ApiUser = {
  id: number;
  email: string;
  name: string;
  phone: string;
  address: string;
  birth: string; // date string
  gender: boolean; // true = Male
  username: string;
  role: boolean;
  valid: boolean;
  // password may or may not be present in detailed endpoint
  password?: string;
};

const API = "https://yoursubdomain.loca.lt";

export default function EmployeeManagement() {
  // raw employees from API
  const [employees, setEmployees] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // local UI states
  const [search, setSearch] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10; // pagination A: fixed 10 per requirement

  // modal states
  const [viewModalOpen, setViewModalOpen] = useState<boolean>(false);
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null);
  const [editPayload, setEditPayload] = useState<Partial<ApiUser> | null>(null);

  // password map: store original password per user id (needed because backend requires password in PUT)
  // NOTE: API /user/profiles sample doesn't include password. We'll try to fetch `/user/profile/{id}` for each user to get password if backend supports.
  const [passwordMap, setPasswordMap] = useState<Record<number, string>>({});

  // fetch list
  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API}/user/profiles`, {
          headers: { accept: "application/json" },
        });
        if (!res.ok) throw new Error(`Failed to fetch profiles: ${res.status}`);
        const data: ApiUser[] = await res.json();
        setEmployees(data);

        // Try to fetch details per-user to obtain password (if backend provides it).
        // This is optional and will fail silently if endpoint not present or doesn't return password.
        // We still continue — in that case passwordMap entries will be "" and PUT will send "".
        try {
          const detailFetches = data.map(async (u) => {
            try {
              const r = await fetch(`${API}/user/profile/${u.id}`, {
                headers: { accept: "application/json" },
              });
              if (!r.ok) return { id: u.id, password: "" };
              const detail = await r.json();
              // If backend returns `password` in detail, store it; otherwise blank.
              return { id: u.id, password: detail.password ?? "" };
            } catch (err) {
              // ignore per-user error
              return { id: u.id, password: "" };
            }
          });
          const results = await Promise.all(detailFetches);
          const map: Record<number, string> = {};
          results.forEach((r) => (map[r.id] = r.password ?? ""));
          setPasswordMap(map);

          // If none of the passwords were provided, warn once in console
          const anyNonEmpty = results.some((r) => r.password && r.password.length > 0);
          if (!anyNonEmpty) {
            console.warn(
              "[EmployeeManagement] Backend did not return passwords from detail endpoint. " +
                "Per chosen policy (A), PUT will send password from passwordMap which is empty strings. " +
                "Please ensure backend allows this or provides a way to retrieve original password."
            );
          }
        } catch (err) {
          console.warn("Could not fetch per-user detail for passwords. Proceeding without them.", err);
        }
      } catch (err) {
        console.error("Error fetching employees:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  // Derived list after search
  const filtered = useMemo(() => {
    if (!search.trim()) return employees;
    const q = search.toLowerCase();
    return employees.filter(
      (u) =>
        (u.name ?? "").toLowerCase().includes(q) ||
        (u.email ?? "").toLowerCase().includes(q) ||
        (u.phone ?? "").toLowerCase().includes(q)
    );
  }, [employees, search]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  // Open view modal
  const openView = (user: ApiUser) => {
    setSelectedUser(user);
    setViewModalOpen(true);
  };

  // Open edit modal (pre-fill limited fields)
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

  // Update locked/unlocked via PUT
  const toggleValid = async (user: ApiUser, newValid: boolean) => {
    // Build body per backend format and policy A -> include password (from passwordMap)
    const body = {
      email: user.email,
      password: passwordMap[user.id] ?? "", // per choice A: send old password (may be empty if unknown)
      name: user.name,
      phone: user.phone,
      address: user.address,
      birth: user.birth,
      gender: user.gender,
      username: user.username,
      role: user.role,
      valid: newValid,
    };

    try {
      const res = await fetch(`${API}/user/profile/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", accept: "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const text = await res.text();
        console.error("Failed to update valid:", res.status, text);
        alert("Failed to update account state. Check console for details.");
        return;
      }
      const updated: ApiUser = await res.json();
      // Update local state
      setEmployees((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      // If response contains password, update passwordMap
      if (updated.password) {
        setPasswordMap((m) => ({ ...m, [updated.id]: updated.password! }));
      }
    } catch (err) {
      console.error("Error updating valid:", err);
      alert("Error updating account state. Check console for details.");
    }
  };

  // Save edits from editPayload -> PUT limited fields but include required fields (password included per A)
  const saveEdits = async () => {
    if (!selectedUser || !editPayload) return;

    // Build body: must include all fields as backend expects. For limited edit, we fill others from selectedUser.
    const body = {
      email: selectedUser.email,
      password: passwordMap[selectedUser.id] ?? "", // per A: send old password
      name: editPayload.name ?? selectedUser.name,
      phone: editPayload.phone ?? selectedUser.phone,
      address: editPayload.address ?? selectedUser.address,
      birth: editPayload.birth ?? selectedUser.birth,
      gender: typeof editPayload.gender === "boolean" ? editPayload.gender : selectedUser.gender,
      username: selectedUser.username,
      role: selectedUser.role,
      valid: selectedUser.valid,
    };

    try {
      const res = await fetch(`${API}/user/profile/${selectedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", accept: "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const txt = await res.text();
        console.error("Failed to save edits:", res.status, txt);
        alert("Failed to save changes. See console for details.");
        return;
      }
      const updated: ApiUser = await res.json();
      // Update employees list and passwordMap if returned
      setEmployees((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      if (updated.password) {
        setPasswordMap((m) => ({ ...m, [updated.id]: updated.password! }));
      }
      setEditModalOpen(false);
      setSelectedUser(null);
    } catch (err) {
      console.error("Error saving edits:", err);
      alert("Error saving. Check console.");
    }
  };

  // UI helpers for modal close (close on backdrop click)
  const closeViewModal = () => {
    setViewModalOpen(false);
    setSelectedUser(null);
  };
  const closeEditModal = () => {
    setEditModalOpen(false);
    setSelectedUser(null);
    setEditPayload(null);
  };

  return (
    <motion.div className="p-6 space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <h2 className="text-xl font-semibold">Employee List</h2>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <Input
                placeholder="Search name / email / phone..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="max-w-md"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-6 text-gray-500">Loading employees...</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 text-left">ID</th>
                      <th className="p-2 text-left">Name</th>
                      <th className="p-2 text-left">Gender</th>
                      <th className="p-2 text-left">Birthday</th>
                      <th className="p-2 text-left">Phone</th>
                      <th className="p-2 text-left">Email</th>
                      <th className="p-2 text-left">Address</th>
                      <th className="p-2 text-left">Account State</th>
                      <th className="p-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((emp) => (
                      <tr key={emp.id} className="border-t border-gray-200">
                        <td className="p-2 align-top">{emp.id}</td>
                        <td className="p-2 align-top">{emp.name}</td>
                        <td className="p-2 align-top">{emp.gender ? "Male" : "Female"}</td>
                        <td className="p-2 align-top">{emp.birth}</td>
                        <td className="p-2 align-top">{emp.phone}</td>
                        <td className="p-2 align-top">{emp.email}</td>
                        <td className="p-2 align-top">{emp.address}</td>
                        <td className="p-2 align-top">
                          <Select
                            value={emp.valid ? "Unlocked" : "Locked"}
                            onValueChange={(val) =>
                              toggleValid(emp, val === "Unlocked")
                            }
                          >
                            <SelectTrigger className="w-28">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Locked">Locked</SelectItem>
                              <SelectItem value="Unlocked">Unlocked</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>

                        <td className="p-2 align-top">
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => openView(emp)}
                              className="bg-slate-100 text-slate-700 hover:bg-slate-200"
                            >
                              View
                            </Button>

                            <Button
                              onClick={() => openEdit(emp)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Edit
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {paginated.length === 0 && (
                      <tr>
                        <td colSpan={9} className="p-6 text-center text-gray-500">
                          No users found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination controls (A: prev / numbered / next) */}
              <div className="flex items-center justify-between mt-4">
                <div>
                  <span className="text-sm text-gray-600">
                    Showing{" "}
                    {filtered.length === 0
                      ? 0
                      : (currentPage - 1) * itemsPerPage + 1}{" "}
                    -{" "}
                    {Math.min(currentPage * itemsPerPage, filtered.length)} of{" "}
                    {filtered.length}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Prev
                  </Button>

                  {/* Show page numbers: try to show up to 7 (current ±3) */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => {
                        if (totalPages <= 7) return true;
                        // show first, last, and current ±2
                        if (p === 1 || p === totalPages) return true;
                        if (Math.abs(p - currentPage) <= 2) return true;
                        if (p === 2 && currentPage <= 4) return true;
                        if (p === totalPages - 1 && currentPage >= totalPages - 3)
                          return true;
                        return false;
                      })
                      .map((p, idx, arr) => {
                        // render ellipsis if gap
                        const prev = arr[idx - 1];
                        const needEllipsis = prev && p - prev > 1 && p !== prev + 1;
                        return (
                          <React.Fragment key={p}>
                            {needEllipsis && <span className="px-2">...</span>}
                            <Button
                              onClick={() => setCurrentPage(p)}
                              className={p === currentPage ? "bg-slate-700 text-white" : ""}
                            >
                              {p}
                            </Button>
                          </React.Fragment>
                        );
                      })}
                  </div>

                  <Button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* VIEW MODAL (centered) */}
      {viewModalOpen && selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={closeViewModal}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.18 }}
            className="relative z-10 w-full max-w-2xl bg-white rounded-lg shadow-lg p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold">User Details</h3>
              <button onClick={closeViewModal} className="p-1 rounded hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-xs text-gray-500">Name</div>
                <div className="font-medium">{selectedUser.name}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Email</div>
                <div className="font-medium">{selectedUser.email}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Phone</div>
                <div className="font-medium">{selectedUser.phone}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Username</div>
                <div className="font-medium">{selectedUser.username}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Address</div>
                <div className="font-medium">{selectedUser.address}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Birthday</div>
                <div className="font-medium">{selectedUser.birth}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Gender</div>
                <div className="font-medium">{selectedUser.gender ? "Male" : "Female"}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Role</div>
                <div className="font-medium">{selectedUser.role ? "Admin" : "User"}</div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button onClick={() => { closeViewModal(); openEdit(selectedUser); }} className="bg-green-600 hover:bg-green-700">
                Edit
              </Button>
              <Button onClick={closeViewModal}>Close</Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* EDIT MODAL (centered) - limited fields */}
      {editModalOpen && selectedUser && editPayload && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={closeEditModal}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.18 }}
            className="relative z-10 w-full max-w-2xl bg-white rounded-lg shadow-lg p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold">Edit User (limited fields)</h3>
              <button onClick={closeEditModal} className="p-1 rounded hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500">Full Name</label>
                <Input
                  value={editPayload.name ?? ""}
                  onChange={(e) =>
                    setEditPayload((p) => ({ ...(p ?? {}), name: e.target.value }))
                  }
                />
              </div>

              <div>
                <label className="text-xs text-gray-500">Phone</label>
                <Input
                  value={editPayload.phone ?? ""}
                  onChange={(e) =>
                    setEditPayload((p) => ({ ...(p ?? {}), phone: e.target.value }))
                  }
                />
              </div>

              <div>
                <label className="text-xs text-gray-500">Address</label>
                <Input
                  value={editPayload.address ?? ""}
                  onChange={(e) =>
                    setEditPayload((p) => ({ ...(p ?? {}), address: e.target.value }))
                  }
                />
              </div>

              <div>
                <label className="text-xs text-gray-500">Birthday</label>
                <Input
                  type="date"
                  value={(editPayload.birth ?? "").slice(0, 10)}
                  onChange={(e) =>
                    setEditPayload((p) => ({ ...(p ?? {}), birth: e.target.value }))
                  }
                />
              </div>

              <div>
                <label className="text-xs text-gray-500">Gender</label>
                <Select
                  value={typeof editPayload.gender === "boolean" ? (editPayload.gender ? "Male" : "Female") : (selectedUser.gender ? "Male" : "Female")}
                  onValueChange={(val) =>
                    setEditPayload((p) => ({ ...(p ?? {}), gender: val === "Male" }))
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

              {/* NOTE: password not shown/edited for admin per rule */}
              <div className="col-span-1 md:col-span-2 text-sm text-gray-500 mt-1">
                <em>Note: Admins are not allowed to change password via this panel. Password will be sent unchanged to the server as required by backend policy A.</em>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button onClick={saveEdits} className="bg-green-600 hover:bg-green-700">Save</Button>
              <Button onClick={closeEditModal}>Cancel</Button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
