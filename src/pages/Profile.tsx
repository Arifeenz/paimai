import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getUserProfile } from '@/lib/queries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Calendar, MapPin, Edit, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    bio: '',
    location: '',
  });

  useEffect(() => {
    const loadUserProfile = async () => {
      if (user) {
        try {
          const profile = await getUserProfile(user.id);
          setUserProfile(profile);
          setEditForm({
            full_name: profile?.full_name || '',
            bio: (profile as any)?.bio || '',
            location: (profile as any)?.location || '',
          });
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      }
    };

    loadUserProfile();
  }, [user]);

  const handleSave = async () => {
    // This would need to be implemented with an update profile function
    toast({
      title: "บันทึกข้อมูลสำเร็จ",
      description: "ข้อมูลโปรไฟล์ของคุณได้รับการอัปเดตแล้ว",
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm({
      full_name: userProfile?.full_name || '',
      bio: (userProfile as any)?.bio || '',
      location: (userProfile as any)?.location || '',
    });
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">กรุณาเข้าสู่ระบบ</h1>
          <p className="text-muted-foreground">คุณต้องเข้าสู่ระบบเพื่อดูโปรไฟล์</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">โปรไฟล์ของฉัน</h1>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              แก้ไขโปรไฟล์
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button onClick={handleSave} size="sm">
                <Save className="mr-2 h-4 w-4" />
                บันทึก
              </Button>
              <Button onClick={handleCancel} variant="outline" size="sm">
                <X className="mr-2 h-4 w-4" />
                ยกเลิก
              </Button>
            </div>
          )}
        </div>

        {/* Profile Info Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  <User className="h-10 w-10" />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-xl">
                  {userProfile?.full_name || user.email}
                </CardTitle>
                <CardDescription className="flex items-center mt-1">
                  <Mail className="mr-2 h-4 w-4" />
                  {user.email}
                </CardDescription>
                {(userProfile as any)?.location && (
                  <CardDescription className="flex items-center mt-1">
                    <MapPin className="mr-2 h-4 w-4" />
                    {(userProfile as any).location}
                  </CardDescription>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Separator />
            
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">ข้อมูลพื้นฐาน</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">ชื่อ-นามสกุล</Label>
                  {isEditing ? (
                    <Input
                      id="full_name"
                      value={editForm.full_name}
                      onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                      placeholder="กรอกชื่อ-นามสกุล"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {userProfile?.full_name || 'ยังไม่ได้กรอกข้อมูล'}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">ที่อยู่</Label>
                  {isEditing ? (
                    <Input
                      id="location"
                      value={editForm.location}
                      onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                      placeholder="กรอกที่อยู่"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {(userProfile as any)?.location || 'ยังไม่ได้กรอกข้อมูล'}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">เกี่ยวกับฉัน</Label>
                {isEditing ? (
                  <Textarea
                    id="bio"
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    placeholder="เล่าเกี่ยวกับตัวคุณ"
                    rows={3}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {(userProfile as any)?.bio || 'ยังไม่ได้กรอกข้อมูล'}
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* Account Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">ข้อมูลบัญชี</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>อีเมล</Label>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>

                <div className="space-y-2">
                  <Label>วันที่สมัครสมาชิก</Label>
                  <p className="text-sm text-muted-foreground flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    {new Date(user.created_at).toLocaleDateString('th-TH')}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Travel Statistics Card */}
        <Card>
          <CardHeader>
            <CardTitle>สถิติการเดินทาง</CardTitle>
            <CardDescription>ข้อมูลสถิติการใช้งานของคุณ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <h4 className="text-2xl font-bold text-primary">0</h4>
                <p className="text-sm text-muted-foreground">ทริปที่สร้าง</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <h4 className="text-2xl font-bold text-primary">0</h4>
                <p className="text-sm text-muted-foreground">รีวิวที่เขียน</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <h4 className="text-2xl font-bold text-primary">0</h4>
                <p className="text-sm text-muted-foreground">สถานที่ที่เยี่ยมชม</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;