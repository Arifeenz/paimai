import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AdminFormProps {
  type: string;
  item?: any;
  destinations?: any[];
  onSave: (data: any) => Promise<void>;
  onClose: () => void;
}

const AdminForm = ({ type, item, destinations = [], onSave, onClose }: AdminFormProps) => {
  const [formData, setFormData] = useState(() => {
    if (item) return { ...item };
    
    const defaults: Record<string, any> = {
      destinations: { name: '', description: '', country: '', image_url: '', featured: false },
      activities: { name: '', description: '', category: '', destination_id: '', price: '', duration_hours: '', image_url: '', rating: 0, google_maps_url: '' },
      hotels: { name: '', description: '', address: '', destination_id: '', price_per_night: '', amenities: [], image_url: '', rating: 0, google_maps_url: '' },
      places: { name: '', description: '', category: '', address: '', destination_id: '', image_url: '', rating: 0, google_maps_url: '' },
      restaurants: { name: '', description: '', category: '', address: '', destination_id: '', price_range: '', opening_hours: '', image_url: '', rating: 0, halal: false, google_maps_url: '' }
    };
    
    return defaults[type] || {};
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      toast({
        title: "บันทึกสำเร็จ",
        description: "ข้อมูลถูกบันทึกเรียบร้อยแล้ว",
      });
      onClose();
    } catch (error: any) {
      console.error('Error saving:', error);
      toast({
        title: "ไม่สามารถบันทึกข้อมูลได้",
        description: error.message || "กรุณาตรวจสอบข้อมูลและลองใหม่อีกครั้ง",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderFields = () => {
    switch (type) {
      case 'destinations':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">ชื่อ</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="country">ประเทศ</Label>
                <Input
                  id="country"
                  value={formData.country || ''}
                  onChange={(e) => handleChange('country', e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">คำอธิบาย</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="image_url">URL รูปภาพ</Label>
              <Input
                id="image_url"
                value={formData.image_url || ''}
                onChange={(e) => handleChange('image_url', e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={formData.featured || false}
                onCheckedChange={(checked) => handleChange('featured', checked)}
              />
              <Label htmlFor="featured">แนะนำ</Label>
            </div>
          </>
        );

      case 'activities':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">ชื่อ</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">หมวดหมู่</Label>
                <Select value={formData.category || ''} onValueChange={(value) => handleChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกหมวดหมู่" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="adventure">ผจญภัย</SelectItem>
                    <SelectItem value="cultural">วัฒนธรรม</SelectItem>
                    <SelectItem value="nature">ธรรมชาติ</SelectItem>
                    <SelectItem value="relaxation">พักผ่อน</SelectItem>
                    <SelectItem value="food">อาหาร</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="description">คำอธิบาย</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="destination_id">จุดหมายปลายทาง</Label>
                <Select value={formData.destination_id || ''} onValueChange={(value) => handleChange('destination_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกจุดหมาย" />
                  </SelectTrigger>
                  <SelectContent>
                    {destinations.map((dest) => (
                      <SelectItem key={dest.id} value={dest.id}>{dest.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="price">ราคา (฿)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price || ''}
                  onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="duration_hours">ระยะเวลา (ชั่วโมง)</Label>
                <Input
                  id="duration_hours"
                  type="number"
                  value={formData.duration_hours || ''}
                  onChange={(e) => handleChange('duration_hours', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="image_url">URL รูปภาพ</Label>
                <Input
                  id="image_url"
                  value={formData.image_url || ''}
                  onChange={(e) => handleChange('image_url', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="rating">Rating (0-5 ดาว)</Label>
                <Input
                  id="rating"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.rating || 0}
                  onChange={(e) => handleChange('rating', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="google_maps_url">ลิงค์ Google Maps</Label>
              <Input
                id="google_maps_url"
                type="url"
                placeholder="https://maps.google.com/..."
                value={formData.google_maps_url || ''}
                onChange={(e) => handleChange('google_maps_url', e.target.value)}
              />
            </div>
          </>
        );

      case 'hotels':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">ชื่อ</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="destination_id">จุดหมายปลายทาง</Label>
                <Select value={formData.destination_id || ''} onValueChange={(value) => handleChange('destination_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกจุดหมาย" />
                  </SelectTrigger>
                  <SelectContent>
                    {destinations.map((dest) => (
                      <SelectItem key={dest.id} value={dest.id}>{dest.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="description">คำอธิบาย</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="address">ที่อยู่</Label>
                <Input
                  id="address"
                  value={formData.address || ''}
                  onChange={(e) => handleChange('address', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="price_per_night">ราคาต่อคืน (฿)</Label>
                <Input
                  id="price_per_night"
                  type="number"
                  value={formData.price_per_night || ''}
                  onChange={(e) => handleChange('price_per_night', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="image_url">URL รูปภาพ</Label>
                <Input
                  id="image_url"
                  value={formData.image_url || ''}
                  onChange={(e) => handleChange('image_url', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="rating">Rating (0-5 ดาว)</Label>
                <Input
                  id="rating"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.rating || 0}
                  onChange={(e) => handleChange('rating', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="google_maps_url">ลิงค์ Google Maps</Label>
              <Input
                id="google_maps_url"
                type="url"
                placeholder="https://maps.google.com/..."
                value={formData.google_maps_url || ''}
                onChange={(e) => handleChange('google_maps_url', e.target.value)}
              />
            </div>
          </>
        );

      case 'places':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">ชื่อ</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">หมวดหมู่</Label>
                <Select value={formData.category || ''} onValueChange={(value) => handleChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกหมวดหมู่" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="landmark">สถานที่สำคัญ</SelectItem>
                    <SelectItem value="museum">พิพิธภัณฑ์</SelectItem>
                    <SelectItem value="park">สวนสาธารณะ</SelectItem>
                    <SelectItem value="beach">ชายหาด</SelectItem>
                    <SelectItem value="temple">วัด</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="description">คำอธิบาย</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="destination_id">จุดหมายปลายทาง</Label>
                <Select value={formData.destination_id || ''} onValueChange={(value) => handleChange('destination_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกจุดหมาย" />
                  </SelectTrigger>
                  <SelectContent>
                    {destinations.map((dest) => (
                      <SelectItem key={dest.id} value={dest.id}>{dest.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="address">ที่อยู่</Label>
                <Input
                  id="address"
                  value={formData.address || ''}
                  onChange={(e) => handleChange('address', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="image_url">URL รูปภาพ</Label>
                <Input
                  id="image_url"
                  value={formData.image_url || ''}
                  onChange={(e) => handleChange('image_url', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="rating">Rating (0-5 ดาว)</Label>
                <Input
                  id="rating"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.rating || 0}
                  onChange={(e) => handleChange('rating', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="google_maps_url">ลิงค์ Google Maps</Label>
              <Input
                id="google_maps_url"
                type="url"
                placeholder="https://maps.google.com/..."
                value={formData.google_maps_url || ''}
                onChange={(e) => handleChange('google_maps_url', e.target.value)}
              />
            </div>
          </>
        );

      case 'restaurants':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">ชื่อ</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">หมวดหมู่</Label>
                <Select value={formData.category || ''} onValueChange={(value) => handleChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกหมวดหมู่" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="thai">อาหารไทย</SelectItem>
                    <SelectItem value="international">อาหารนานาชาติ</SelectItem>
                    <SelectItem value="seafood">อาหารทะเล</SelectItem>
                    <SelectItem value="street-food">อาหารข้างทาง</SelectItem>
                    <SelectItem value="fine-dining">ร้านอาหารหรู</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="description">คำอธิบาย</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="destination_id">จุดหมายปลายทาง</Label>
                <Select value={formData.destination_id || ''} onValueChange={(value) => handleChange('destination_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกจุดหมาย" />
                  </SelectTrigger>
                  <SelectContent>
                    {destinations.map((dest) => (
                      <SelectItem key={dest.id} value={dest.id}>{dest.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="price_range">ช่วงราคา</Label>
                <Select value={formData.price_range || ''} onValueChange={(value) => handleChange('price_range', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกช่วงราคา" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="฿">฿ (ประหยัด)</SelectItem>
                    <SelectItem value="฿฿">฿฿ (ปานกลาง)</SelectItem>
                    <SelectItem value="฿฿฿">฿฿฿ (แพง)</SelectItem>
                    <SelectItem value="฿฿฿฿">฿฿฿฿ (แพงมาก)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="address">ที่อยู่</Label>
                <Input
                  id="address"
                  value={formData.address || ''}
                  onChange={(e) => handleChange('address', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="opening_hours">เวลาเปิด-ปิด</Label>
                <Input
                  id="opening_hours"
                  value={formData.opening_hours || ''}
                  onChange={(e) => handleChange('opening_hours', e.target.value)}
                  placeholder="เช่น 9:00 - 22:00"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="image_url">URL รูปภาพ</Label>
                <Input
                  id="image_url"
                  value={formData.image_url || ''}
                  onChange={(e) => handleChange('image_url', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="rating">Rating (0-5 ดาว)</Label>
                <Input
                  id="rating"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.rating || 0}
                  onChange={(e) => handleChange('rating', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="halal"
                checked={formData.halal || false}
                onCheckedChange={(checked) => handleChange('halal', checked)}
              />
              <Label htmlFor="halal">อาหารฮาลาล (Halal Food)</Label>
            </div>
            <div>
              <Label htmlFor="google_maps_url">ลิงค์ Google Maps</Label>
              <Input
                id="google_maps_url"
                type="url"
                placeholder="https://maps.google.com/..."
                value={formData.google_maps_url || ''}
                onChange={(e) => handleChange('google_maps_url', e.target.value)}
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {item ? 'แก้ไข' : 'เพิ่ม'} {type === 'destinations' ? 'จุดหมายปลายทาง' : 
             type === 'activities' ? 'กิจกรรม' : 
             type === 'hotels' ? 'โรงแรม' : 
             type === 'places' ? 'สถานที่' : 'ร้านอาหาร'}
          </h2>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {renderFields()}
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              ยกเลิก
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'กำลังบันทึก...' : 'บันทึก'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminForm;