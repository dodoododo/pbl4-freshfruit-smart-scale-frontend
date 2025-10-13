import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  LineChart, Line, PieChart, Pie, Tooltip, Legend, CartesianGrid, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, Cell
} from "recharts";

interface Bill {
  id: string;
  employee: string;
  total: number;
  time: string;
  items: { fruit: string; quantity: number; price: number }[];
}

const dummyBills: Bill[] = [
  {
    id: "BILL001",
    employee: "Alice",
    total: 45.5,
    time: "2025-10-12T10:30:00",
    items: [
      { fruit: "Apple", quantity: 3, price: 10 },
      { fruit: "Mango", quantity: 2, price: 12.5 },
    ],
  },
  {
    id: "BILL002",
    employee: "Bob",
    total: 80,
    time: "2025-10-12T12:10:00",
    items: [
      { fruit: "Banana", quantity: 10, price: 5 },
      { fruit: "Apple", quantity: 5, price: 8 },
    ],
  },
];


const generateColors = (count: number): string[] => {
  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    const hue = Math.floor((360 / count) * i);
    colors.push(`hsl(${hue}, 70%, 55%)`);
  }
  return colors;
};

const BillsDashboard: React.FC = () => {
  const [bills, setBills] = useState(dummyBills);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewBill, setViewBill] = useState<Bill | null>(null);

  const filteredBills = bills.filter((bill) => {
    return (
      (!selectedEmployee || bill.employee === selectedEmployee) &&
      (!selectedDate || bill.time.startsWith(selectedDate))
    );
  });

  const revenueData = [
    { date: "2025-10-10", revenue: 200, orders: 12 },
    { date: "2025-10-11", revenue: 350, orders: 18 },
    { date: "2025-10-12", revenue: 400, orders: 22 },
  ];

  const employeeData = [
    { name: "Alice", sales: 120 },
    { name: "Bob", sales: 180 },
    { name: "Eve", sales: 100 },
  ];

  const fruitData = [
    { name: "Apple", sold: 50 },
    { name: "Banana", sold: 70 },
    { name: "Mango", sold: 30 },
    { name: "Orange", sold: 20 },
  ];

  const employeeColors = generateColors(employeeData.length);
  const fruitColors = generateColors(fruitData.length);
  return (
    <div className="p-6 space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="flex flex-wrap gap-4 items-center justify-between">
          <Input
            type="date"
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-48"
          />
          <Select onValueChange={(val) => setSelectedEmployee(val)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by employee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Alice">Alice</SelectItem>
              <SelectItem value="Bob">Bob</SelectItem>
              <SelectItem value="Eve">Eve</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => { setSelectedEmployee(null); setSelectedDate(null); }}>
            Reset Filters
          </Button>
        </CardContent>
      </Card>

      {/* Bill List */}
      <Card>
        <CardContent>
          <h2 className="text-lg font-semibold mb-3">Bills</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Bill ID</th>
                <th>Employee</th>
                <th>Total ($)</th>
                <th>Time</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredBills.map((bill) => (
                <tr key={bill.id} className="border-b hover:bg-gray-50">
                  <td className="py-2">{bill.id}</td>
                  <td>{bill.employee}</td>
                  <td>{bill.total}</td>
                  <td>{new Date(bill.time).toLocaleString()}</td>
                  <td>
                    <Button size="sm" onClick={() => setViewBill(bill)}>
                      View Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Graphs Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Revenue / Orders Line Graph */}
        <Card>
          <CardContent>
            <h3 className="text-md font-semibold mb-2">Revenue & Orders</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#22c55e" name="Revenue ($)" />
                <Line type="monotone" dataKey="orders" stroke="#f97316" name="Orders" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Employee Sales Pie Chart */}
        <Card>
          <CardContent>
            <h3 className="text-md font-semibold mb-2">Employee Sales Share</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  dataKey="sales"
                  data={employeeData}
                  outerRadius={80}
                  label={({ name }) => name}
                >
                  {/* Assign different colors to each slice */}
                  {employeeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={employeeColors[index]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Fruit Sales Bar Chart */}
        <Card className="md:col-span-2">
          <CardContent>
            <h3 className="text-md font-semibold mb-2">Top Selling Fruits</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={fruitData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sold">
                  {fruitData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={fruitColors[index]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bill Detail Modal */}
      {viewBill && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
          onClick={() => setViewBill(null)}
        >
          <motion.div
            className="bg-white rounded-xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-2">
              Bill #{viewBill.id} — {viewBill.employee}
            </h2>
            <p className="text-sm text-gray-500 mb-3">
              {new Date(viewBill.time).toLocaleString()}
            </p>
            <table className="w-full text-sm mb-3">
              <thead>
                <tr className="text-left border-b">
                  <th>Fruit</th>
                  <th>Qty</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {viewBill.items.map((item, i) => (
                  <tr key={i} className="border-b">
                    <td>{item.fruit}</td>
                    <td>{item.quantity}</td>
                    <td>${item.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-right font-semibold">
              Total: ${viewBill.total.toFixed(2)}
            </div>
            <Button className="mt-3 w-full" onClick={() => setViewBill(null)}>
              Close
            </Button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default BillsDashboard;
