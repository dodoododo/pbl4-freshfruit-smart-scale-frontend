import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

interface BillDetail {
  detail_id: number;
  fruit_id: number;
  fruit_name: string;
  weight: number;
  price: number;
}

export interface Bill {
  bill_id: number;
  user_id: number; // đúng API
  date: string;
  cus_id: number;
  total_cost: number;
  bill_details: BillDetail[];
}

interface RevenueDay {
  day: string;
  total_revenue: number;
}

interface RevenueMonth {
  year: number;
  month: number;
  total_revenue: number;
}

interface TopFruit {
  name: string;
  total_weight: number;
  revenue: number;
}

interface RevenueByFruit {
  name: string;
  total_revenue: number;
}

interface EmployeeRevenue {
  employee: string;
  total_sales: number;
}

interface UserProfile {
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
}

const API = "https://yoursubdomain.loca.lt";

const generateColors = (count: number): string[] => {
  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    const hue = Math.floor((360 / count) * i);
    colors.push(`hsl(${hue}, 70%, 55%)`);
  }
  return colors;
};

const BillDashboard: React.FC = () => {
  const [revenueDay, setRevenueDay] = useState<RevenueDay[]>([]);
  const [revenueMonth, setRevenueMonth] = useState<RevenueMonth[]>([]);
  const [topFruits, setTopFruits] = useState<TopFruit[]>([]);
  const [revenueByFruits, setRevenueByFruits] = useState<RevenueByFruit[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          dayRes,
          monthRes,
          topFruitsRes,
          revenueByFruitsRes,
          billsRes,
          profilesRes,
        ] = await Promise.all([
          fetch(`${API}/statistics/revenue/day`).then((r) => r.json()) as Promise<RevenueDay[]>,
          fetch(`${API}/statistics/revenue/month`).then((r) => r.json()) as Promise<RevenueMonth[]>,
          fetch(`${API}/statistics/top-fruits?limit=5`).then((r) => r.json()) as Promise<TopFruit[]>,
          fetch(`${API}/statistics/revenue/by-fruits`).then((r) => r.json()) as Promise<RevenueByFruit[]>,
          fetch(`${API}/ViewAllBill`).then((r) => r.json()) as Promise<Bill[]>,
          fetch(`${API}/user/`).then((r) => r.json()) as Promise<UserProfile[]>,
        ]);

        setRevenueDay(dayRes);
        setRevenueMonth(monthRes);
        setTopFruits(topFruitsRes);
        setRevenueByFruits(revenueByFruitsRes);
        setBills(billsRes);
        setProfiles(profilesRes);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Color palettes
  const topFruitColors = generateColors(topFruits.length);
  const revenueFruitColors = generateColors(revenueByFruits.length);

  // Mapping id -> name
  const profileMap: Record<number, string> = {};
  (Array.isArray(profiles) ? profiles : []).forEach((p) => {
    profileMap[p.id] = p.name;
  });


  // Doanh số nhân viên
  const employeeSalesMap: Record<string, number> = {};
  bills.forEach((bill) => {
    const employeeName = profileMap[bill.user_id] || `ID ${bill.user_id}`;
    if (!employeeSalesMap[employeeName]) employeeSalesMap[employeeName] = 0;
    employeeSalesMap[employeeName] += bill.total_cost;
  });

  const employeeSales: EmployeeRevenue[] = Object.entries(employeeSalesMap)
    .map(([employee, total_sales]) => ({ employee, total_sales }))
    .sort((a, b) => b.total_sales - a.total_sales);

  const employeeColors = generateColors(employeeSales.length);

  if (loading) {
    return <p className="text-center mt-10">Đang tải dữ liệu thống kê...</p>;
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Thống kê bán hàng</h1>

      {/* Doanh thu theo ngày */}
      <Card>
        <CardContent>
          <h2 className="font-semibold mb-2">Doanh thu theo ngày</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={revenueDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip formatter={(v: number) => `$${v.toFixed(2)}`} />
              <Legend />
              <Line type="monotone" dataKey="total_revenue" name="Doanh thu" stroke="#22c55e" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Doanh thu theo tháng */}
      <Card>
        <CardContent>
          <h2 className="font-semibold mb-2">Doanh thu theo tháng</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={revenueMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(v: number) => `$${v.toFixed(2)}`} />
              <Legend />
              <Line type="monotone" dataKey="total_revenue" name="Doanh thu" stroke="#f97316" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top 5 sản phẩm bán chạy */}
      <Card>
        <CardContent>
          <h2 className="font-semibold mb-2">Top 5 sản phẩm bán chạy</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={topFruits.map((f) => ({ name: f.name, value: f.revenue }))}
                dataKey="value"
                nameKey="name"
                outerRadius={80}
                label={(entry) => entry.name}
              >
                {topFruits.map((_, index) => (
                  <Cell key={index} fill={topFruitColors[index]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number, name: string) => [`$${value.toFixed(2)}`, name]} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Doanh thu theo sản phẩm */}
      <Card>
        <CardContent>
          <h2 className="font-semibold mb-2">Doanh thu theo sản phẩm</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueByFruits}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(v: number) => `$${v.toFixed(2)}`} />
              <Bar dataKey="total_revenue" name="Doanh thu">
                {revenueByFruits.map((_, index) => (
                  <Cell key={index} fill={revenueFruitColors[index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Nhân viên bán hàng tốt nhất */}
      <Card>
        <CardContent>
          <h2 className="font-semibold mb-2">Nhân viên bán hàng tốt nhất</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={employeeSales.map((e) => ({ name: e.employee, value: e.total_sales }))}
                dataKey="value"
                nameKey="name"
                outerRadius={80}
                label={(entry) => entry.name}
              >
                {employeeSales.map((_, index) => (
                  <Cell key={index} fill={employeeColors[index]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number, name: string) => [`$${value.toFixed(2)}`, name]} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillDashboard;
