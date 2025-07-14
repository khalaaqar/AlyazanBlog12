
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SendNewsletterData {
  title: string;
  content: string;
  type: 'article' | 'company';
}

export const useSendNewsletter = () => {
  return useMutation({
    mutationFn: async ({ title, content, type }: SendNewsletterData) => {
      console.log('📧 Starting newsletter send process...');
      console.log('Data:', { title, content: content?.substring(0, 100) + '...', type });
      
      // الحصول على قائمة المشتركين النشطين
      console.log('📋 Fetching active subscribers...');
      const { data: subscribers, error: subscribersError } = await supabase
        .from('newsletter_subscribers')
        .select('email, name')
        .eq('status', 'active');

      if (subscribersError) {
        console.error('❌ Error fetching subscribers:', subscribersError);
        throw new Error(`خطأ في جلب قائمة المشتركين: ${subscribersError.message}`);
      }

      if (!subscribers || subscribers.length === 0) {
        console.error('❌ No subscribers found');
        throw new Error('لا يوجد مشتركون نشطون في النشرة البريدية');
      }

      console.log(`✅ Found ${subscribers.length} active subscribers`);
      subscribers.forEach((sub, index) => {
        console.log(`   ${index + 1}. ${sub.name} (${sub.email})`);
      });

      // إرسال البيانات إلى Edge Function
      console.log('🚀 Invoking send-newsletter edge function...');
      const functionPayload = {
        title,
        content,
        type,
        subscribers,
        siteUrl: window.location.origin,
        id
      };
      
      console.log('Function payload:', JSON.stringify(functionPayload, null, 2));
      
      const { data, error } = await supabase.functions.invoke('send-newsletter', {
        body: functionPayload
      });

      if (error) {
        console.error('❌ Error invoking send-newsletter function:', error);
        throw new Error(`خطأ في استدعاء دالة إرسال النشرة البريدية: ${error.message}`);
      }

      console.log('✅ Send-newsletter function response:', data);
      
      if (!data?.success) {
        console.error('❌ Newsletter function returned error:', data);
        throw new Error(data?.error || 'فشل في إرسال النشرة البريدية');
      }

      return data;
    },
  });
};
