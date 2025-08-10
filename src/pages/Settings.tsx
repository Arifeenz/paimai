import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Settings2, Bell, Globe, Shield, Trash2, Key, Moon, Sun } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      marketing: false,
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
    },
    preferences: {
      language: 'th',
      theme: 'system',
      currency: 'THB',
    },
  });

  const handleNotificationChange = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value,
      },
    }));
    toast({
      title: "บันทึกการตั้งค่าสำเร็จ",
      description: "การตั้งค่าการแจ้งเตือนได้รับการอัปเดตแล้ว",
    });
  };

  const handlePrivacyChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value,
      },
    }));
    toast({
      title: "บันทึกการตั้งค่าสำเร็จ",
      description: "การตั้งค่าความเป็นส่วนตัวได้รับการอัปเดตแล้ว",
    });
  };

  const handlePreferenceChange = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value,
      },
    }));
    toast({
      title: "บันทึกการตั้งค่าสำเร็จ",
      description: "ตั้งค่าทั่วไปได้รับการอัปเดตแล้ว",
    });
  };

  const handleDeleteAccount = async () => {
    // This would need to be implemented with actual account deletion logic
    toast({
      title: "ไม่สามารถลบบัญชีได้",
      description: "ฟีเจอร์นี้ยังไม่พร้อมใช้งาน",
      variant: "destructive",
    });
  };

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">กรุณาเข้าสู่ระบบ</h1>
          <p className="text-muted-foreground">คุณต้องเข้าสู่ระบบเพื่อดูการตั้งค่า</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-2">
          <Settings2 className="h-8 w-8" />
          <h1 className="text-3xl font-bold">การตั้งค่า</h1>
        </div>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>ข้อมูลบัญชี</span>
            </CardTitle>
            <CardDescription>จัดการข้อมูลบัญชีและความปลอดภัย</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>อีเมล</Label>
                <div className="flex items-center space-x-2">
                  <Input value={user.email} disabled />
                  <Badge variant="secondary">ยืนยันแล้ว</Badge>
                </div>
              </div>
              <div className="space-y-2">
                <Label>รหัสผ่าน</Label>
                <Button variant="outline" className="w-full justify-start">
                  <Key className="mr-2 h-4 w-4" />
                  เปลี่ยนรหัสผ่าน
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>การแจ้งเตือน</span>
            </CardTitle>
            <CardDescription>จัดการการรับข้อมูลข่าวสารและการแจ้งเตือน</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>การแจ้งเตือนทางอีเมล</Label>
                <p className="text-sm text-muted-foreground">รับการแจ้งเตือนสำคัญทางอีเมล</p>
              </div>
              <Switch
                checked={settings.notifications.email}
                onCheckedChange={(checked) => handleNotificationChange('email', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>การแจ้งเตือนแบบพุช</Label>
                <p className="text-sm text-muted-foreground">รับการแจ้งเตือนผ่านเบราว์เซอร์</p>
              </div>
              <Switch
                checked={settings.notifications.push}
                onCheckedChange={(checked) => handleNotificationChange('push', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>ข้อมูลการตลาด</Label>
                <p className="text-sm text-muted-foreground">รับข้อมูลโปรโมชั่นและข่าวสาร</p>
              </div>
              <Switch
                checked={settings.notifications.marketing}
                onCheckedChange={(checked) => handleNotificationChange('marketing', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle>ความเป็นส่วนตัว</CardTitle>
            <CardDescription>ควบคุมใครสามารถเห็นข้อมูลของคุณได้</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>การมองเห็นโปรไฟล์</Label>
              <Select
                value={settings.privacy.profileVisibility}
                onValueChange={(value) => handlePrivacyChange('profileVisibility', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">สาธารณะ</SelectItem>
                  <SelectItem value="friends">เฉพาะเพื่อน</SelectItem>
                  <SelectItem value="private">ส่วนตัว</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>แสดงอีเมลในโปรไฟล์</Label>
                <p className="text-sm text-muted-foreground">ให้ผู้อื่นเห็นที่อยู่อีเมลของคุณ</p>
              </div>
              <Switch
                checked={settings.privacy.showEmail}
                onCheckedChange={(checked) => handlePrivacyChange('showEmail', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* General Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span>ตั้งค่าทั่วไป</span>
            </CardTitle>
            <CardDescription>ปรับแต่งประสบการณ์การใช้งาน</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ภาษา</Label>
                <Select
                  value={settings.preferences.language}
                  onValueChange={(value) => handlePreferenceChange('language', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="th">ไทย</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>สกุลเงิน</Label>
                <Select
                  value={settings.preferences.currency}
                  onValueChange={(value) => handlePreferenceChange('currency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="THB">บาท (THB)</SelectItem>
                    <SelectItem value="USD">ดอลลาร์ (USD)</SelectItem>
                    <SelectItem value="EUR">ยูโร (EUR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>ธีม</Label>
              <Select
                value={settings.preferences.theme}
                onValueChange={(value) => handlePreferenceChange('theme', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center">
                      <Sun className="mr-2 h-4 w-4" />
                      สว่าง
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center">
                      <Moon className="mr-2 h-4 w-4" />
                      มืด
                    </div>
                  </SelectItem>
                  <SelectItem value="system">ตามระบบ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">โซนอันตราย</CardTitle>
            <CardDescription>การดำเนินการเหล่านี้ไม่สามารถย้อนกลับได้</CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="mr-2 h-4 w-4" />
                  ลบบัญชี
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>คุณแน่ใจหรือไม่?</AlertDialogTitle>
                  <AlertDialogDescription>
                    การลบบัญชีจะไม่สามารถย้อนกลับได้ ข้อมูลทั้งหมดของคุณจะถูกลบอย่างถาวร 
                    รวมถึงแผนการเดินทาง รีวิว และข้อมูลส่วนตัวทั้งหมด
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    ลบบัญชี
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;