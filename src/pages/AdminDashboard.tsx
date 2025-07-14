
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, FileText, Building, Briefcase, Settings, User, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import PersonalInfoTab from "@/components/admin/PersonalInfoTab";
import SiteSettingsTab from "@/components/admin/SiteSettingsTab";
import ArticlesTab from "@/components/admin/ArticlesTab";
import CompaniesTab from "@/components/admin/CompaniesTab";
import ExperiencesTab from "@/components/admin/ExperiencesTab";
import SubscribersTab from "@/components/admin/SubscribersTab";

const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const ADMIN_USERNAME = "yazan_saleh";
  const ADMIN_PASSWORD = "yazan1230";

  useEffect(() => {
    const savedAuth = localStorage.getItem("adminAuth");
    if (savedAuth === "authenticated") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem("adminAuth", "authenticated");
      setError("");
    } else {
      setError("اسم المستخدم أو كلمة المرور غير صحيحة");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("adminAuth");
    setUsername("");
    setPassword("");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8" dir="rtl">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-2xl">تسجيل الدخول للوحة التحكم</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">اسم المستخدم</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && (
                <p className="text-destructive text-sm text-center">{error}</p>
              )}
              <Button type="submit" className="w-full">
                تسجيل الدخول
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-center">لوحة التحكم</h1>
          <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            تسجيل الخروج
          </Button>
        </div>
        
        <Tabs defaultValue="personal" className="w-full" dir="rtl">
          <TabsList className="grid w-full grid-cols-6" dir="rtl">
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              المعلومات الشخصية
            </TabsTrigger>
            <TabsTrigger value="site" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              إعدادات الموقع
            </TabsTrigger>
            <TabsTrigger value="articles" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              المقالات
            </TabsTrigger>
            <TabsTrigger value="companies" className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              رحلات الشركات
            </TabsTrigger>
            <TabsTrigger value="experiences" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              الخبرات
            </TabsTrigger>
            <TabsTrigger value="subscribers" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              المشتركين
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-6">
            <PersonalInfoTab />
          </TabsContent>

          <TabsContent value="site" className="space-y-6">
            <SiteSettingsTab />
          </TabsContent>

          <TabsContent value="articles" className="space-y-6">
            <ArticlesTab />
          </TabsContent>

          <TabsContent value="companies" className="space-y-6">
            <CompaniesTab />
          </TabsContent>

          <TabsContent value="experiences" className="space-y-6">
            <ExperiencesTab />
          </TabsContent>

          <TabsContent value="subscribers" className="space-y-6">
            <SubscribersTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
