
import { useSendNewsletter } from './useNewsletter';
import { useToast } from './use-toast';

interface AutoNewsletterData {
  title: string;
  content: string;
  type: 'article' | 'company';
}

export const useAutoNewsletter = () => {
  const sendNewsletter = useSendNewsletter();
  const { toast } = useToast();

  const sendAutoNewsletter = async ({ title, content, type }: AutoNewsletterData) => {
    try {
      console.log('🚀 Starting auto newsletter send for:', { title, type });
      
      // تحقق من وجود المحتوى المطلوب
      if (!title?.trim()) {
        console.error('❌ Missing title for newsletter');
        toast({
          title: "خطأ في البيانات",
          description: "العنوان مطلوب لإرسال النشرة البريدية",
          variant: "destructive"
        });
        return;
      }

      if (!content?.trim()) {
        console.error('❌ Missing content for newsletter');
        toast({
          title: "خطأ في البيانات", 
          description: "المحتوى مطلوب لإرسال النشرة البريدية",
          variant: "destructive"
        });
        return;
      }
      
      console.log('📤 Calling newsletter mutation...');
      const result = await sendNewsletter.mutateAsync({
        title: title.trim(),
        content: content.trim(),
        type
      });

      console.log('✅ Newsletter sent successfully:', result);

      toast({
        title: "تم إرسال النشرة البريدية! 🎉",
        description: `تم إرسال النشرة البريدية للمشتركين بنجاح للـ${type === 'article' ? 'مقال' : 'رحلة الشركة'} الجديد`,
      });

    } catch (error: any) {
      console.error('❌ Error sending auto newsletter:', error);
      
      const errorMessage = error?.message || 'حدث خطأ غير متوقع';
      
      toast({
        title: "خطأ في إرسال النشرة البريدية",
        description: `حدث خطأ أثناء إرسال النشرة البريدية: ${errorMessage}`,
        variant: "destructive"
      });
    }
  };

  return {
    sendAutoNewsletter,
    isLoading: sendNewsletter.isPending
  };
};
