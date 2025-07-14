
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSiteSettings, useUpdateSiteSettings } from "@/hooks/useSiteSettings";
import { useToast } from "@/hooks/use-toast";

const SiteSettingsTab = () => {
  const { toast } = useToast();
  const { data: siteSettings, isLoading } = useSiteSettings();
  const updateSiteSettings = useUpdateSiteSettings();

  const [siteForm, setSiteForm] = useState({
    site_name: "",
    site_description: "",
    contact_email: "",
    linkedin_url: "",
    twitter_url: "",
    whatsapp_number: "",
    facebook_url: "",
    instagram_url: "",
  });

  useEffect(() => {
    if (siteSettings) {
      setSiteForm({
        site_name: siteSettings.site_name || "",
        site_description: siteSettings.site_description || "",
        contact_email: siteSettings.contact_email || "",
        linkedin_url: siteSettings.linkedin_url || "",
        twitter_url: siteSettings.twitter_url || "",
        whatsapp_number: siteSettings.whatsapp_number || "",
        facebook_url: siteSettings.facebook_url || "",
        instagram_url: siteSettings.instagram_url || "",
      });
    }
  }, [siteSettings]);

  const handleSiteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!siteForm.site_name.trim()) {
      toast({
        title: "خطأ في البيانات",
        description: "اسم الموقع مطلوب",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Submitting site settings:', siteForm);
      
      await updateSiteSettings.mutateAsync({
        site_name: siteForm.site_name.trim(),
        site_description: siteForm.site_description.trim() || null,
        contact_email: siteForm.contact_email.trim() || null,
        linkedin_url: siteForm.linkedin_url.trim() || null,
        twitter_url: siteForm.twitter_url.trim() || null,
        whatsapp_number: siteForm.whatsapp_number.trim() || null,
        facebook_url: siteForm.facebook_url.trim() || null,
        instagram_url: siteForm.instagram_url.trim() || null,
      });
      
      toast({
        title: "تم الحفظ بنجاح",
        description: "تم تحديث إعدادات الموقع بنجاح",
      });
    } catch (error: any) {
      console.error("خطأ في الحفظ:", error);
      toast({
        title: "حدث خطأ",
        description: error.message || "فشل في حفظ إعدادات الموقع",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>إعدادات الموقع</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <div className="text-muted-foreground">جاري التحميل...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>إعدادات الموقع</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSiteSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="site_name">اسم الموقع *</Label>
            <Input
              id="site_name"
              value={siteForm.site_name}
              onChange={(e) => setSiteForm(prev => ({ ...prev, site_name: e.target.value }))}
              placeholder="اسم موقعك"
              required
              dir="rtl"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="site_description">وصف الموقع</Label>
            <Textarea
              id="site_description"
              value={siteForm.site_description}
              onChange={(e) => setSiteForm(prev => ({ ...prev, site_description: e.target.value }))}
              placeholder="وصف مختصر لموقعك"
              rows={3}
              dir="rtl"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contact_email">البريد الإلكتروني للتواصل</Label>
            <Input
              id="contact_email"
              type="email"
              value={siteForm.contact_email}
              onChange={(e) => setSiteForm(prev => ({ ...prev, contact_email: e.target.value }))}
              placeholder="your@email.com"
              dir="ltr"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="linkedin_url">LinkedIn</Label>
              <Input
                id="linkedin_url"
                value={siteForm.linkedin_url}
                onChange={(e) => setSiteForm(prev => ({ ...prev, linkedin_url: e.target.value }))}
                placeholder="https://linkedin.com/in/yourprofile"
                dir="ltr"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="twitter_url">Twitter/X</Label>
              <Input
                id="twitter_url"
                value={siteForm.twitter_url}
                onChange={(e) => setSiteForm(prev => ({ ...prev, twitter_url: e.target.value }))}
                placeholder="https://twitter.com/yourhandle"
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="facebook_url">Facebook</Label>
              <Input
                id="facebook_url"
                value={siteForm.facebook_url}
                onChange={(e) => setSiteForm(prev => ({ ...prev, facebook_url: e.target.value }))}
                placeholder="https://facebook.com/yourpage"
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram_url">Instagram</Label>
              <Input
                id="instagram_url"
                value={siteForm.instagram_url}
                onChange={(e) => setSiteForm(prev => ({ ...prev, instagram_url: e.target.value }))}
                placeholder="https://instagram.com/youraccount"
                dir="ltr"
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="whatsapp_number">رقم الواتساب</Label>
              <Input
                id="whatsapp_number"
                value={siteForm.whatsapp_number}
                onChange={(e) => setSiteForm(prev => ({ 
                  ...prev, 
                  whatsapp_number: e.target.value.replace(/\D/g, '') 
                }))}
                placeholder="966501234567"
                dir="ltr"
                className="text-left"
              />
              <p className="text-sm text-muted-foreground">
                أدخل الرقم بصيغة دولية بدون + (مثال: 966501234567)
              </p>
            </div>
          </div>
          
          <Button 
            type="submit" 
            disabled={updateSiteSettings.isPending}
            className="w-full"
          >
            {updateSiteSettings.isPending ? "جاري الحفظ..." : "حفظ الإعدادات"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SiteSettingsTab;
