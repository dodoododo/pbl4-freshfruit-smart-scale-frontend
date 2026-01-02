import React from "react";
import { X } from "lucide-react";
import type { Bill } from "../../types";

interface BillDetailModalProps {
  bill: Bill | null;
  onClose: () => void;
}

const BillDetailModal: React.FC<BillDetailModalProps> = ({ bill, onClose }) => {
  if (!bill) return null;

  return (
    // 🔴 Overlay (click ngoài để đóng)
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      {/* 🔵 Modal container */}
      <div
        className="bg-white w-full max-w-2xl max-h-[90vh] rounded-lg shadow-lg flex flex-col relative"
        onClick={(e) => e.stopPropagation()} // ❌ chặn click trong modal
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ===== Header (fixed) ===== */}
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">
            Chi tiết hóa đơn #{bill.bill_id}
          </h2>

          <p className="text-sm text-gray-600">
            Ngày tạo:{" "}
            {new Date(
              new Date(bill.date).getTime() + 7 * 60 * 60 * 1000
            ).toLocaleString("vi-VN")}
          </p>

          <p className="text-gray-700 mt-2">
            <span className="font-medium">Mã khách hàng:</span> {bill.cus_id}
          </p>

          <p className="text-gray-700 mt-1">
            <span className="font-medium">Mã nhân viên:</span> {bill.user_id}
          </p>
        </div>

        {/* ===== Scrollable content ===== */}
        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="font-semibold text-gray-800 mb-3">
            Danh sách sản phẩm ({bill.bill_details.length})
          </h3>

          <div className="space-y-3">
            {bill.bill_details.map((detail) => (
              <div
                key={detail.detail_id}
                className="flex justify-between bg-gray-50 p-3 rounded-lg text-sm"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    {detail.fruit_name}
                  </p>
                  <p className="text-gray-500">
                    {detail.weight.toFixed(2)} kg × $
                    {detail.price.toFixed(2)}
                  </p>
                </div>

                <p className="font-semibold text-gray-700">
                  ${(detail.weight * detail.price).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ===== Footer (fixed) ===== */}
        <div className="border-t p-6 flex justify-between items-center bg-white">
          <span className="text-lg font-semibold text-gray-800">
            Tổng cộng
          </span>
          <span className="text-2xl font-bold text-green-600">
            ${bill.total_cost.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BillDetailModal;
