import React, { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle } from 'lucide-react';
import type { Bill } from "../../types/index.ts";

const BillHistory: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const res = await fetch('https://yoursubdomain.loca.lt/ViewAllBill', {
          method: 'GET',
          headers: { accept: 'application/json' },
        });
        const data: Bill[] = await res.json();
        // No filtering, show all bills
        setBills(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      } catch (error) {
        console.error('Failed to fetch bills:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, []);

  const getStatusIcon = (bill: Bill) => {
    if (bill.total_cost === 0) return <Clock className="w-5 h-5 text-yellow-500" />;
    if (bill.total_cost > 0 && bill.total_cost < 100) return <Package className="w-5 h-5 text-blue-500" />;
    return <CheckCircle className="w-5 h-5 text-green-500" />;
  };

  const getStatusLabel = (bill: Bill) => {
    if (bill.total_cost === 0) return 'Pending';
    if (bill.total_cost > 0 && bill.total_cost < 100) return 'Processing';
    return 'Completed';
  };

  const getStatusColor = (bill: Bill) => {
    const label = getStatusLabel(bill);
    switch (label) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Processing':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-600 animate-pulse">Đang tải danh sách hóa đơn...</p>
      </div>
    );
  }

  if (bills.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Chưa có hóa đơn nào</h2>
          <p className="text-gray-600">Khi bạn tạo hóa đơn, tất cả sẽ hiển thị ở đây.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Lịch sử hóa đơn</h1>
        <p className="text-gray-600">Xem tất cả hóa đơn đã tạo</p>
      </div>

      <div className="space-y-6">
        {bills.map(bill => (
          <div key={bill.bill_id} className="bg-white rounded-lg shadow-md p-6 transition hover:shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                {getStatusIcon(bill)}
                <div>
                  <h3 className="font-semibold text-gray-800">Hóa đơn #{bill.bill_id}</h3>
                  <p className="text-sm text-gray-600">{new Date(new Date(bill.date).getTime() + 6 * 60 * 60 * 1000).toLocaleString('vi-VN')}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(bill)}`}>
                  {getStatusLabel(bill)}
                </span>
                <p className="text-lg font-bold text-green-600 mt-1">${bill.total_cost.toFixed(2)}</p>
              </div>
            </div>

            {/* Bill details */}
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-800 mb-3">Chi tiết ({bill.bill_details.length})</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {bill.bill_details.map(detail => (
                  <div key={detail.detail_id} className="flex justify-between bg-gray-50 p-3 rounded-lg text-sm">
                    <span className="font-medium text-gray-800">{detail.fruit_name}</span>
                    <span className="text-gray-600">{detail.weight.toFixed(2)} kg × ${detail.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BillHistory;
