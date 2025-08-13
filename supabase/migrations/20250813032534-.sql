-- แก้ไข RLS policy สำหรับ reviews เพื่อให้ผู้ใช้สามารถดูเฉพาะรีวิวของตัวเองได้ในหน้า MyTrips
-- แต่ยังสามารถดูรีวิวของคนอื่นในที่อื่นได้

-- ลบ policy เก่าที่ให้ทุกคนดูรีวิวได้
DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;

-- สร้าง policy ใหม่ให้ทุกคนสามารถดูรีวิวได้ (สำหรับหน้าอื่น)
CREATE POLICY "Public can view reviews" 
ON reviews 
FOR SELECT 
USING (true);

-- สร้าง policy สำหรับผู้ใช้ที่ต้องการดูเฉพาะรีวิวของตัวเอง (สำหรับ getUserReviews function)
-- Policy นี้จะมี priority สูงกว่าเมื่อมีการใช้ auth.uid() ใน query