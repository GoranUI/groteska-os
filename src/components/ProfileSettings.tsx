
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { User } from "lucide-react";

export const ProfileSettings = () => {
  const { user, profile, updateProfile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    await updateProfile({
      full_name: fullName,
      phone: phone,
    });
    
    setLoading(false);
  };

  return (
    <Card className="card-elevated bg-card/50 backdrop-blur-sm border-border/20">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary-light/5 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-xl">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-foreground">
                Profile Settings
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage your personal information and preferences
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium text-muted-foreground">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                className="h-10 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-muted-foreground">Email</Label>
              <Input
                id="email"
                value={user?.email || ''}
                disabled
                className="h-10 bg-muted/50 text-muted-foreground"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="phone" className="text-sm font-medium text-muted-foreground">Phone Number</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Your phone number"
                className="h-10 transition-colors"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={loading} className="btn-primary focus-ring">
              {loading ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
