import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface AccountPageProps {
  onBack: () => void;
}

const AccountPage: React.FC<AccountPageProps> = ({ onBack }) => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    birthday: user?.birthday || '',
    gender: user?.gender || '',
    address: user?.address || '',
    userId: user?.id || '',
  });

  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    console.log("Profile updated:", formData);
    alert("Profile updated successfully!");
  };

  const handlePasswordSubmit = () => {
    console.log("Password changed:", passwordData);
    alert("Password changed successfully!");
    setPasswordData({ currentPassword: '', newPassword: '' });
    setShowPasswordChange(false);
  };

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
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-medium">Full Name</label>
                  <Input name="name" value={formData.name} disabled />
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
                  <Input name="birthday" type="date" value={formData.birthday} onChange={handleChange} />
                </div>
                <div>
                    <label className="text-sm font-medium">Gender</label>
                    <Select
                        value={formData.gender}
                        onValueChange={(value) => setFormData({ ...formData, gender: value })}
                    >
                        <SelectTrigger className="w-full mt-1">
                            <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                            <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
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
