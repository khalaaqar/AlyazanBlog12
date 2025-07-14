import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  name: string;
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email }: WelcomeEmailRequest = await req.json();

    console.log('📧 Sending welcome email to:', { name, email });

    const emailResponse = await resend.emails.send({
      from: "نشرة يزن صالح <onboarding@resend.dev>",
      to: [email],
      subject: "مرحباً بك في نشرة يزن صالح! 🎉",
      html: `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>مرحباً بك في نشرة يزن صالح</title>
          <style>
            body {
              font-family: 'Arial', 'Helvetica', sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f8fafc;
              color: #334155;
              direction: rtl;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #3b82f6, #1e40af);
              color: white;
              padding: 40px 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: bold;
            }
            .header p {
              margin: 10px 0 0 0;
              font-size: 16px;
              opacity: 0.9;
            }
            .content {
              padding: 40px 30px;
            }
            .welcome-message {
              background-color: #f1f5f9;
              border-right: 4px solid #3b82f6;
              padding: 20px;
              margin: 20px 0;
              border-radius: 8px;
            }
            .features {
              margin: 30px 0;
            }
            .feature-item {
              display: flex;
              align-items: start;
              margin: 15px 0;
              padding: 15px;
              background-color: #f8fafc;
              border-radius: 8px;
            }
            .feature-icon {
              width: 24px;
              height: 24px;
              background-color: #3b82f6;
              border-radius: 50%;
              margin-left: 15px;
              flex-shrink: 0;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .footer {
              background-color: #1e293b;
              color: white;
              padding: 30px;
              text-align: center;
            }
            .footer-links {
              margin: 20px 0;
            }
            .footer-links a {
              color: #94a3b8;
              text-decoration: none;
              margin: 0 10px;
            }
            .footer-links a:hover {
              color: white;
            }
            .unsubscribe {
              font-size: 12px;
              color: #64748b;
              margin-top: 20px;
            }
            .button {
              display: inline-block;
              background-color: #3b82f6;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Header -->
            <div class="header">
              <h1>مرحباً بك في نشرة يزن صالح! 🎉</h1>
              <p>نشرة متخصصة في إدارة المنتجات والنمو</p>
            </div>

            <!-- Content -->
            <div class="content">
              <h2>أهلاً وسهلاً ${name}!</h2>
              
              <div class="welcome-message">
                <p><strong>شكراً لك على الانضمام إلى مجتمعنا!</strong></p>
                <p>نحن متحمسون لمشاركة أحدث الرؤى والخبرات معك في عالم إدارة المنتجات الرقمية وريادة الأعمال.</p>
              </div>

              <h3>ماذا تتوقع من نشرتنا:</h3>
              
              <div class="features">
                <div class="feature-item">
                  <div class="feature-icon">📝</div>
                  <div>
                    <strong>مقالات متخصصة</strong><br>
                    محتوى عملي حول إدارة المنتجات والاستراتيجيات الرقمية
                  </div>
                </div>
                
                <div class="feature-item">
                  <div class="feature-icon">🚀</div>
                  <div>
                    <strong>رحلات الشركات</strong><br>
                    قصص نجاح ملهمة من الشركات الناشئة والمشاريع الريادية
                  </div>
                </div>
                
                <div class="feature-item">
                  <div class="feature-icon">💡</div>
                  <div>
                    <strong>رؤى وتحليلات</strong><br>
                    خبرات عملية من واقع العمل في مجال التكنولوجيا
                  </div>
                </div>
              </div>

              <p>سنرسل لك محتوى جديد كلما أضفنا مقالاً جديداً أو قصة شركة ملهمة. نعدك بأن المحتوى سيكون مفيداً وعملياً!</p>
            </div>

            <!-- Footer -->
            <div class="footer">
              <p><strong>يزن صالح</strong></p>
              <p>خبير إدارة المنتجات والنمو الرقمي</p>
              
              <div class="footer-links">
                <a href="#">LinkedIn</a>
                <a href="#">Twitter</a>
                <a href="#">الموقع الإلكتروني</a>
              </div>
              
              <div class="unsubscribe">
                <p>© 2025 يزن صالح. جميع الحقوق محفوظة.</p>
                <p>هل وصلك هذا الإيميل بالخطأ؟ <a href="#" style="color: #94a3b8;">إلغاء الاشتراك</a></p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("✅ Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("❌ Error in send-welcome-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);