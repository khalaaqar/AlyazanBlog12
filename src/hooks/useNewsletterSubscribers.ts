
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface NewsletterSubscriber {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'unsubscribed';
  created_at: string;
  updated_at: string;
}

export const useNewsletterSubscribers = () => {
  return useQuery({
    queryKey: ['newsletter-subscribers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as NewsletterSubscriber[];
    },
  });
};

export const useSubscribeToNewsletter = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (subscriber: { name: string; email: string }) => {
      // أولاً إدراج المشترك
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .insert([{ ...subscriber, status: 'active' }])
        .select()
        .single();
      
      if (error) throw error;

      // ثم إرسال إيميل ترحيبي
      try {
        const { error: emailError } = await supabase.functions.invoke('send-welcome-email', {
          body: {
            name: subscriber.name,
            email: subscriber.email
          }
        });
        
        if (emailError) {
          console.error('خطأ في إرسال الإيميل الترحيبي:', emailError);
          // لا نريد أن نفشل العملية كاملة إذا فشل الإيميل الترحيبي
        }
      } catch (emailError) {
        console.error('خطأ في استدعاء دالة الإيميل الترحيبي:', emailError);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter-subscribers'] });
    },
  });
};

export const useDeleteSubscriber = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter-subscribers'] });
    },
  });
};
