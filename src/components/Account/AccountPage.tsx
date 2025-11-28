import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface AccountPageProps {
  onBack: () => void;
}

const API = "https://yoursubdomain.loca.lt";

const AccountPage: React.FC<AccountPageProps> = ({ onBack }) => {
  const token = localStorage.getItem("accessToken");

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    birthday: "",
    gender: true,
    address: "",
  });

  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
  });

  // =====================================================
  // 🔥 FETCH PROFILE /user/me
  // =====================================================
  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API}/user/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        console.error("Failed to fetch /user/me", await res.text());
        return;
      }

      const data = await res.json();
      setUser(data);

      setFormData({
        name: data.name,
        email: data.email,
        phone: data.phone || "",
        birthday: data.birth || "",
        gender: data.gender === true,
        address: data.address || "",
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // =====================================================
  // 🔥 HANDLE INPUT
  // =====================================================
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  // =====================================================
  // 🔥 SAVE PROFILE — PUT /user/profile/{id}
  // =====================================================
  const handleSubmit = async () => {
    if (!user?.id) return alert("User ID not found!");

    const body = {
      ...formData,
      birth: formData.birthday,
      gender: formData.gender,
    };

    try {
      const res = await fetch(`${API}/user/profile/${user.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        console.error("Update failed:", await res.text());
        return alert("Failed to update profile");
      }

      alert("Profile updated successfully!");
      fetchProfile(); // load lại dữ liệu
    } catch (e) {
      console.error(e);
    }
  };

  // =====================================================
  // 🔥 CHANGE PASSWORD — PUT /user/change-password/{id}
  // =====================================================
  const handlePasswordSubmit = async () => {
    if (!user?.id) return alert("User ID not found!");

    if (!passwordData.currentPassword || !passwordData.newPassword) {
      return alert("Please fill all password fields!");
    }

    const body = {
      old_password: passwordData.currentPassword,
      new_password: passwordData.newPassword,
    };

    try {
      const res = await fetch(`${API}/user/profile/${user.id}/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        console.error("Password change failed", await res.text());
        return alert("Failed to change password");
      }

      alert("Password changed successfully!");
      setPasswordData({ currentPassword: "", newPassword: "" });
      setShowPasswordChange(false);

    } catch (e) {
      console.error(e);
    }
  };

  // =====================================================
  // UI
  // =====================================================
  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <Button variant="ghost" onClick={onBack} className="flex items-center mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </Button>

      <Card>
        <CardContent className="space-y-4 mt-4">
          <h2 className="text-2xl font-semibold mb-4">Account Details</h2>

          {!showPasswordChange ? (
            <>
              {/* PROFILE FORM */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-medium">Full Name</label>
                  <Input name="name" value={formData.name} onChange={handleChange} />
                </div>

                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input name="email" value={formData.email} disabled />
                </div>

                <div>
                  <label className="text-sm font-medium">Phone Number</label>
                  <Input name="phone" value={formData.phone} onChange={handleChange} />
                </div>

                <div>
                  <label className="text-sm font-medium">Birthday</label>
                  <Input
                    name="birthday"
                    type="date"
                    value={formData.birthday}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Gender</label>
                  <Select
                    value={formData.gender ? "Male" : "Female"}
                    onValueChange={(value) =>
                      setFormData({ ...formData, gender: value === "Male" })
                    }
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Address</label>
                  <Input name="address" value={formData.address} onChange={handleChange} />
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <Button onClick={handleSubmit}>Save Changes</Button>
                <Button variant="outline" onClick={() => setShowPasswordChange(true)}>
                  Change Password
                </Button>
              </div>
            </>
          ) : (
            // PASSWORD CHANGE UI
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Change Password</h3>

              <div>
                <label className="text-sm font-medium">Current Password</label>
                <Input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                />
              </div>

              <div>
                <label className="text-sm font-medium">New Password</label>
                <Input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                />
              </div>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setShowPasswordChange(false)}>
                  Cancel
                </Button>
                <Button onClick={handlePasswordSubmit}>Update Password</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountPage;
