-- التحقق من وجود RLS policies على جدول newsletter_subscribers
-- إذا لم تكن موجودة، فهذا يعني أن الجدول محمي ولا يمكن للمستخدمين العاديين الكتابة فيه

-- إنشاء policy للسماح للجميع بالإدراج في جدول newsletter_subscribers
CREATE POLICY "Anyone can subscribe to newsletter" 
ON newsletter_subscribers 
FOR INSERT 
WITH CHECK (true);

-- إنشاء policy للسماح للجميع بقراءة المشتركين (إذا كان مطلوباً لأغراض إدارية)
CREATE POLICY "Anyone can view newsletter subscribers" 
ON newsletter_subscribers 
FOR SELECT 
USING (true);