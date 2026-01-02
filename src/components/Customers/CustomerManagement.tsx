import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { X, Plus } from "lucide-react";
import type { Customer } from "../../types";

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

export default function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [selectedCustomer, setSelectedCustomer] =
    useState<Customer | null>(null);

  const [editPayload, setEditPayload] = useState<Partial<Customer>>({});
  const [createPayload, setCreatePayload] = useState<
    Omit<Customer, "cus_id">
  >({
    name: "",
    phone: "",
    address: "",
    moneySpent: 0,
  });

  /* ================= FETCH LIST ================= */

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API}/customer`, {
          headers: { accept: "application/json" },
        });
        if (!res.ok) throw new Error("Fetch failed");
        const data: Customer[] = await res.json();
        setCustomers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  /* ================= FETCH DETAIL ================= */

  const fetchCustomerDetail = async (
    id: number
  ): Promise<Customer | null> => {
    try {
      const res = await fetch(`${API}/customer/${id}`, {
        headers: { accept: "application/json" },
      });
      if (!res.ok) throw new Error("Detail fetch failed");
      return await res.json();
    } catch (err) {
      console.error(err);
      alert("Không thể tải chi tiết khách hàng");
      return null;
    }
  };

  /* ================= DERIVED ================= */

  const filtered = useMemo(() => {
    if (!search.trim()) return customers;
    const q = search.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q)
    );
  }, [customers, search]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  /* ================= ACTIONS ================= */

  const openView = async (c: Customer) => {
    const detail = await fetchCustomerDetail(c.cus_id);
    if (!detail) return;
    setSelectedCustomer(detail);
    setViewModalOpen(true);
  };

  const openEdit = async (c: Customer) => {
    const detail = await fetchCustomerDetail(c.cus_id);
    if (!detail) return;

    setSelectedCustomer(detail);
    setEditPayload({
      name: detail.name,
      phone: detail.phone,
      address: detail.address,
    });
    setEditModalOpen(true);
  };

  const saveEdit = async () => {
    if (!selectedCustomer) return;

    const body = {
      ...selectedCustomer,
      ...editPayload,
    };

    try {
      const res = await fetch(
        `${API}/customer/${selectedCustomer.cus_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      if (!res.ok) throw new Error("Update failed");

      const updated: Customer = await res.json();
      setCustomers((prev) =>
        prev.map((c) =>
          c.cus_id === updated.cus_id ? updated : c
        )
      );
      setEditModalOpen(false);
      setSelectedCustomer(null);
    } catch (err) {
      console.error(err);
      alert("Cập nhật thất bại");
    }
  };

  const createCustomer = async () => {
    try {
      const res = await fetch(`${API}/customer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createPayload),
      });
      if (!res.ok) throw new Error("Create failed");

      const created: Customer = await res.json();
      setCustomers((prev) => [created, ...prev]);
      setCreateModalOpen(false);
      setCreatePayload({
        name: "",
        phone: "",
        address: "",
        moneySpent: 0,
      });
    } catch (err) {
      console.error(err);
      alert("Tạo khách hàng thất bại");
    }
  };

  /* ================= UI ================= */

  return (
    <motion.div
      className="p-6 space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Card>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Customer Management</h2>

            <div className="flex gap-3">
              <Input
                className="max-w-sm"
                placeholder="Search..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <Button
                className="bg-green-600"
                onClick={() => setCreateModalOpen(true)}
              >
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>
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
                    <th className="p-2 text-center">Phone</th>
                    <th className="p-2 text-center">Spent ($)</th>
                    <th className="p-2 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {paginated.map((c) => (
                    <tr key={c.cus_id} className="border-t">
                      <td className="p-2 text-center">{c.cus_id}</td>
                      <td className="p-2 text-center">{c.name}</td>
                      <td className="p-2 text-center">{c.phone}</td>
                      <td className="p-2 text-center">
                        {c.moneySpent.toFixed(2)}
                      </td>
                      <td className="p-2">
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="outline"
                            onClick={() => openView(c)}
                          >
                            View
                          </Button>
                          <Button
                            className="bg-green-600"
                            onClick={() => openEdit(c)}
                          >
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

      {/* ===== VIEW MODAL ===== */}
      {viewModalOpen && selectedCustomer && (
        <Modal onClose={() => setViewModalOpen(false)}>
          <h3 className="text-lg font-semibold mb-4">
            Customer Detail
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Info label="ID" value={selectedCustomer.cus_id} />
            <Info label="Name" value={selectedCustomer.name} />
            <Info label="Phone" value={selectedCustomer.phone} />
            <Info label="Address" value={selectedCustomer.address} />
            <Info
              label="Money Spent"
              value={`$${selectedCustomer.moneySpent.toFixed(2)}`}
              valueClass="text-green-600"
            />
          </div>
        </Modal>
      )}

      {/* ===== EDIT MODAL ===== */}
      {editModalOpen && (
        <Modal onClose={() => setEditModalOpen(false)}>
          <h3 className="text-lg font-semibold mb-4">
            Edit Customer
          </h3>
          <div className="space-y-3">
            <Input
              placeholder="Name"
              value={editPayload.name ?? ""}
              onChange={(e) =>
                setEditPayload((p) => ({
                  ...p,
                  name: e.target.value,
                }))
              }
            />
            <Input
              placeholder="Phone"
              value={editPayload.phone ?? ""}
              onChange={(e) =>
                setEditPayload((p) => ({
                  ...p,
                  phone: e.target.value,
                }))
              }
            />
            <Input
              placeholder="Address"
              value={editPayload.address ?? ""}
              onChange={(e) =>
                setEditPayload((p) => ({
                  ...p,
                  address: e.target.value,
                }))
              }
            />
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button className="bg-green-600" onClick={saveEdit}>
              Save
            </Button>
            <Button
              variant="outline"
              onClick={() => setEditModalOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </Modal>
      )}

      {/* ===== CREATE MODAL ===== */}
      {createModalOpen && (
        <Modal onClose={() => setCreateModalOpen(false)}>
          <h3 className="text-lg font-semibold mb-4">
            Create Customer
          </h3>
          <div className="space-y-3">
            <Input
              placeholder="Name"
              value={createPayload.name}
              onChange={(e) =>
                setCreatePayload((p) => ({
                  ...p,
                  name: e.target.value,
                }))
              }
            />
            <Input
              placeholder="Phone"
              value={createPayload.phone}
              onChange={(e) =>
                setCreatePayload((p) => ({
                  ...p,
                  phone: e.target.value,
                }))
              }
            />
            <Input
              placeholder="Address"
              value={createPayload.address}
              onChange={(e) =>
                setCreatePayload((p) => ({
                  ...p,
                  address: e.target.value,
                }))
              }
            />
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button
              className="bg-green-600"
              onClick={createCustomer}
            >
              Create
            </Button>
            <Button
              variant="outline"
              onClick={() => setCreateModalOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </Modal>
      )}
    </motion.div>
  );
}

/* ================= MODAL ================= */

function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose} // ✅ click overlay → đóng modal
    >
      <div
        className="bg-white w-full max-w-xl rounded-lg shadow-lg p-6 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} // ✅ click trong modal → không đóng
      >
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
          onClick={onClose}
        >
          <X />
        </button>
        {children}
      </div>
    </div>
  );
}
