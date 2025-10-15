import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import type { User } from "../../types/index.ts";

interface EmployeeWithState extends User {
  state: "Locked" | "Unlocked";
}

const EmployeeManagement: React.FC = () => {
  // Dummy data
  const [employees, setEmployees] = useState<EmployeeWithState[]>([
    {
      id: "1",
      name: "Alice Johnson",
      email: "alice@fruitmarket.com",
      password: "",
      isAdmin: false,
      gender: "Female",
      birthday: "1992-05-10",
      phone: "555-1234",
      address: "123 Green St, Freshville",
      state: "Unlocked",
    },
    {
      id: "2",
      name: "Bob Smith",
      email: "bob@fruitmarket.com",
      password: "",
      isAdmin: false,
      gender: "Male",
      birthday: "1988-09-22",
      phone: "555-5678",
      address: "45 Orchard Rd, Fruitville",
      state: "Locked",
    },
    {
      id: "3",
      name: "Clara Lopez",
      email: "clara@fruitmarket.com",
      password: "",
      isAdmin: false,
      gender: "Female",
      birthday: "1995-12-01",
      phone: "555-9876",
      address: "78 Berry Ln, Citrus City",
      state: "Unlocked",
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);

  const [newEmployee, setNewEmployee] = useState<EmployeeWithState>({
    id: "",
    name: "",
    email: "",
    password: "",
    isAdmin: false,
    gender: "",
    birthday: "",
    phone: "",
    address: "",
    state: "Unlocked",
  });

  // Handle input field changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewEmployee({ ...newEmployee, [name]: value });
  };

  // Handle select dropdown changes
  const handleSelectChange = (field: keyof EmployeeWithState, value: string) => {
    setNewEmployee({ ...newEmployee, [field]: value });
  };

  // Handle adding new employee
  const handleAddEmployee = () => {
    if (
      !newEmployee.name ||
      !newEmployee.gender ||
      !newEmployee.birthday ||
      !newEmployee.phone ||
      !newEmployee.email ||
      !newEmployee.address
    ) {
      alert("⚠️ Please fill in all fields before adding an employee.");
      return;
    }

    // Auto-generate ID
    const nextId = (employees.length + 1).toString();

    const employeeToAdd = {
      ...newEmployee,
      id: nextId,
    };

    setEmployees([...employees, employeeToAdd]);
    setNewEmployee({
      id: "",
      name: "",
      email: "",
      password: "",
      isAdmin: false,
      gender: "",
      birthday: "",
      phone: "",
      address: "",
      state: "Unlocked",
    });
    setShowAddForm(false);
  };

  // Handle lock/unlock
  const handleStateChange = (id: string, newState: "Locked" | "Unlocked") => {
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === id ? { ...emp, state: newState } : emp))
    );
  };

  return (
    <motion.div
      className="p-6 space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Employee List Section */}
      <Card>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Employee List</h2>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              {showAddForm ? "Cancel" : "+ Add Employee"}
            </Button>
          </div>

          {/* Add Employee Form (conditionally rendered) */}
          {showAddForm && (
            <div className="mb-6 border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h3 className="text-lg font-medium mb-2">New Employee Details</h3>
              <p className="text-sm text-orange-600 mb-4">
                ⚠️ Full name and email cannot be changed after creation.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Input
                  name="name"
                  placeholder="Full Name"
                  value={newEmployee.name}
                  onChange={handleInputChange}
                />
                <Select
                  value={newEmployee.gender}
                  onValueChange={(val) => handleSelectChange("gender", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  name="birthday"
                  type="date"
                  value={newEmployee.birthday}
                  onChange={handleInputChange}
                />
                <Input
                  name="phone"
                  placeholder="Phone Number"
                  value={newEmployee.phone}
                  onChange={handleInputChange}
                />
                <Input
                  name="email"
                  placeholder="Email"
                  value={newEmployee.email}
                  onChange={handleInputChange}
                />
                <Input
                  name="address"
                  placeholder="Address"
                  value={newEmployee.address}
                  onChange={handleInputChange}
                />
              </div>
              <Button
                onClick={handleAddEmployee}
                className="bg-green-600 hover:bg-green-700"
              >
                Add Employee
              </Button>
            </div>
          )}

          {/* Employee Table */}
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
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id} className="border-t border-gray-200">
                  <td className="p-2">{emp.id}</td>
                  <td className="p-2">{emp.name}</td>
                  <td className="p-2">{emp.gender}</td>
                  <td className="p-2">{emp.birthday}</td>
                  <td className="p-2">{emp.phone}</td>
                  <td className="p-2">{emp.email}</td>
                  <td className="p-2">{emp.address}</td>
                  <td className="p-2">
                    <Select
                      value={emp.state}
                      onValueChange={(val) =>
                        handleStateChange(emp.id, val as "Locked" | "Unlocked")
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
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EmployeeManagement;