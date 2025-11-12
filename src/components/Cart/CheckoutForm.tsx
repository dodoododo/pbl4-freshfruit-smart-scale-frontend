import React, { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle, UserSearch, UserPlus } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import type { Customer } from "../../types";

interface CheckoutFormProps {
  onComplete: () => void;
  onBack: () => void;
}

const API_BASE = "https://yoursubdomain.loca.lt";

const currentUser = localStorage.getItem('currentUser');

const CheckoutForm: React.FC<CheckoutFormProps> = ({ onComplete, onBack }) => {
  const { items, getTotalPrice } = useCart();
  const { user } = useAuth();

  const total = getTotalPrice();
  const totalIsValid = !isNaN(total) && total > 0;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    zipCode: "",
  });
  const [customerPhone, setCustomerPhone] = useState("");
  const [foundCustomer, setFoundCustomer] = useState<Customer | null>(null);
  const [mode, setMode] = useState<"choose" | "find" | "create" | "found">("choose");
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [error, setError] = useState("");

  // ✅ Auto-fill user info if logged in
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🔍 FIND CUSTOMER
  const handleFindCustomer = async () => {
    if (!customerPhone) return setError("Vui lòng nhập số điện thoại.");
    try {
      setError("");
      const res = await fetch(`${API_BASE}/customer/search/${customerPhone}`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);

      const data: Customer[] = await res.json();
      if (data.length > 0) {
        const c = data[0];
        setFoundCustomer(c);
        setFormData({
          name: c.name,
          email: user?.email || "",
          address: c.address || "",
          city: "",
          zipCode: "",
        });
        setMode("found");
      } else {
        setError("Không tìm thấy khách hàng.");
        setFoundCustomer(null);
      }
    } catch {
      setError("Không thể kết nối đến máy chủ.");
    }
  };

  // ➕ CREATE CUSTOMER
  const handleCreateCustomer = async () => {
    if (!customerPhone || !formData.name || !formData.address)
      return setError("Vui lòng điền đầy đủ thông tin.");

    try {
      setError("");
      const res = await fetch(`${API_BASE}/customer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          phone: customerPhone,
          address: `${formData.address}, ${formData.city}, ${formData.zipCode}`,
          moneySpent: total,
        }),
      });

      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const newCustomer = await res.json();

      setFoundCustomer(newCustomer);
      setMode("found");
    } catch {
      setError("Không thể tạo khách hàng.");
    }
  };

  // 🧾 SUBMIT ORDER
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totalIsValid) return;

    setIsProcessing(true);
    try {
      // ✅ Update existing customer spending
      if (foundCustomer) {
        const updatedCustomer = {
          ...foundCustomer,
          moneySpent: (foundCustomer.moneySpent || 0) + total,
        };
        await fetch(`${API_BASE}/customer/${foundCustomer.cus_id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedCustomer),
        });
      }

      // ✅ Prepare bill
      const billData = {
        user_id: currentUser ? JSON.parse(currentUser).id : 1, // <---- ✅ mặc định user_id = 1
        cus_id: foundCustomer?.cus_id || 0,
        items: items.map((item) => ({
          fruit_id: item.fruit.id,
          weight: item.quantity,
          price: item.fruit.price,
        })),
      };

      // ✅ Send bill to API
      const billRes = await fetch(`${API_BASE}/bill`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify(billData),
      });

      if (!billRes.ok) throw new Error(`Bill creation failed: ${billRes.status}`);
      const bill = await billRes.json();

      setOrderId(bill.id);
      setOrderComplete(true);
    } catch {
      setError("Lỗi khi gửi đơn hàng hoặc tạo bill.");
    } finally {
      setIsProcessing(false);
    }
  };

  // ✅ ORDER COMPLETE
  if (orderComplete) {
    return (
      <div className="p-6 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Đặt hàng thành công!</h2>
        <p className="text-gray-600 mb-4">Mã đơn: #{orderId}</p>
        <button
          onClick={onComplete}
          className="w-full bg-gradient-to-r from-green-500 to-orange-500 text-white py-3 rounded-lg font-medium hover:from-green-600 hover:to-orange-600"
        >
          Tiếp tục mua hàng
        </button>
      </div>
    );
  }

  // 🧩 MAIN FORM
  return (
    <div className="flex flex-col h-screen overflow-y-auto">
      {/* Header */}
      <div className="flex items-center p-6 border-b">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full mr-3"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold text-gray-800">Checkout</h2>
      </div>

      {/* Form */}
      <div className="flex-col h-screen overflow-y-auto">
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="max-w-md mx-auto space-y-6">
            {/* --- CHOOSE MODE --- */}
            {mode === "choose" && (
              <div className="bg-white shadow rounded-xl p-6 flex flex-col space-y-4 text-center border">
                <h3 className="text-lg font-semibold text-gray-800">Chọn thao tác</h3>
                <button
                  type="button"
                  onClick={() => setMode("find")}
                  className="flex justify-center items-center bg-green-500 text-white py-2.5 rounded-lg hover:bg-green-600 transition"
                >
                  <UserSearch className="w-5 h-5 mr-2" /> Tìm khách hàng theo SĐT
                </button>
                <button
                  type="button"
                  onClick={() => setMode("create")}
                  className="flex justify-center items-center bg-blue-500 text-white py-2.5 rounded-lg hover:bg-blue-600 transition"
                >
                  <UserPlus className="w-5 h-5 mr-2" /> Tạo khách hàng mới
                </button>
              </div>
            )}

            {/* --- FIND MODE --- */}
            {mode === "find" && (
              <div className="bg-white p-6 rounded-xl shadow space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-700">Tìm khách hàng</h3>
                  {/* Nút quay lại */}
                  <button
                    type="button"
                    onClick={() => setMode("choose")}
                    className="text-sm text-gray-500 hover:text-gray-700 transition"
                  >
                    ← Quay lại
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Nhập số điện thoại..."
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                />
                <button
                  type="button"
                  onClick={handleFindCustomer}
                  className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
                >
                  Tìm khách hàng
                </button>
                {error && <p className="text-red-500 text-sm">{error}</p>}
              </div>
            )}

            {/* --- CREATE MODE --- */}
            {mode === "create" && (
              <div className="bg-white p-6 rounded-xl shadow space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-700">
                    Tạo khách hàng mới
                  </h3>
                  {/* Nút quay lại */}
                  <button
                    type="button"
                    onClick={() => setMode("choose")}
                    className="text-sm text-gray-500 hover:text-gray-700 transition"
                  >
                    ← Quay lại
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Số điện thoại"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full border rounded-lg p-2"
                />
                <input
                  name="name"
                  placeholder="Tên khách hàng"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2"
                />
                <input
                  name="address"
                  placeholder="Địa chỉ"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2"
                />
                <button
                  type="button"
                  onClick={handleCreateCustomer}
                  className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
                >
                  Tạo khách hàng
                </button>
                {error && <p className="text-red-500 text-sm">{error}</p>}
              </div>
            )}

            {/* --- FOUND MODE --- */}
            {mode === "found" && foundCustomer && (
              <div className="bg-white p-6 rounded-xl shadow text-left space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">Khách hàng:</h3>
                  <button
                    type="button"
                    onClick={() => setMode("choose")}
                    className="text-sm text-gray-500 hover:text-gray-700 transition"
                  >
                    ← Quay lại
                  </button>
                </div>
                <p>
                  <strong>Tên:</strong> {foundCustomer.name}
                </p>
                <p>
                  <strong>SĐT:</strong> {foundCustomer.phone}
                </p>
                <p>
                  <strong>Địa chỉ:</strong> {foundCustomer.address}
                </p>
                <p className="text-gray-600">
                  Đã chi tiêu: ${foundCustomer.moneySpent?.toFixed(2) || 0}
                </p>
              </div>
            )}
          </div>
        </form>


        {/* --- Order Summary --- */}
        <div className="flex justify-center">
          <div className="bg-gray-100 w-1/3 p-3 rounded-lg border-t mb-5">
            <h3 className="font-medium text-gray-800 mb-3">Order Summary</h3>
            {items.map((item) => (
              <div
                key={item.fruit.id}
                className="flex justify-between items-center mb-2"
              >
                <span className="text-sm text-gray-600">
                  {item.fruit.name} x {item.quantity.toFixed(3)} kg
                </span>
                <span className="text-sm font-medium">
                  ${(item.fruit.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-800">Total:</span>
                <span className="font-bold text-green-600 text-lg">
                  ${getTotalPrice().toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit button */}
        <div className="border-t p-6 flex justify-center">
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={!totalIsValid || isProcessing}
            className={`w-1/3 py-3 px-4 rounded-lg font-medium text-white transition-all ${
              totalIsValid
                ? "bg-gradient-to-r bg-green-500 hover:bg-green-800"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            {isProcessing ? "Đang xử lý..." : `Đặt hàng - $${total.toFixed(2)}`}
          </button>
        </div>

      </div>
    </div>
  );
};

export default CheckoutForm;