import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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
    console.log("🎉 === Welcome Email Function Started ===");
    console.log("🕐 Timestamp:", new Date().toISOString());

    const { name, email }: WelcomeEmailRequest = await req.json();

    console.log('📧 Sending welcome email to:', { name, email });

    // Validate input
    if (!name || !email) {
      console.error("❌ Missing required fields:", { name: !!name, email: !!email });
      return new Response(
        JSON.stringify({ 
          error: 'الاسم والبريد الإلكتروني مطلوبان',
          success: false
        }),
        {
          status: 400,
          headers: { 
            "Content-Type": "application/json", 
            ...corsHeaders 
          },
        }
      );
    }

    if (!email.includes('@')) {
      console.error("❌ Invalid email format:", email);
      return new Response(
        JSON.stringify({ 
          error: 'صيغة البريد الإلكتروني غير صحيحة',
          success: false
        }),
        {
          status: 400,
          headers: { 
            "Content-Type": "application/json", 
            ...corsHeaders 
          },
        }
      );
    }

    // Get SendGrid API key
    const sendGridApiKey = Deno.env.get("SENDGRID_API_KEY");
    if (!sendGridApiKey) {
      console.error("❌ SENDGRID_API_KEY environment variable not found");
      return new Response(
        JSON.stringify({ 
          error: "SENDGRID_API_KEY is not configured",
          success: false
        }),
        {
          status: 500,
          headers: { 
            "Content-Type": "application/json", 
            ...corsHeaders 
          },
        }
      );
    }

    console.log("🔑 SendGrid API Key found, proceeding with email send...");

    const siteUrl = Deno.env.get("SITE_URL") || "https://evggmwlsmriivvrjfuvz.supabase.co";

    const emailContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>مرحباً بك في نشرة يزن صالح</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f8fafc;
            color: #334155;
            direction: rtl;
            line-height: 1.6;
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
            margin-bottom: 10px;
          }
          .header p {
            margin: 0;
            font-size: 16px;
            opacity: 0.9;
          }
          .content {
            padding: 40px 30px;
          }
          .welcome-message {
            background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
            border-right: 4px solid #3b82f6;
            padding: 25px;
            margin: 25px 0;
            border-radius: 8px;
          }
          .welcome-message h3 {
            color: #1e293b;
            margin: 0 0 15px 0;
            font-size: 20px;
            font-weight: 600;
          }
          .welcome-message p {
            color: #475569;
            margin: 10px 0;
            font-size: 16px;
            line-height: 1.7;
          }
          .features {
            margin: 30px 0;
          }
          .features h3 {
            color: #1e293b;
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 20px;
          }
          .feature-item {
            display: flex;
            align-items: flex-start;
            margin: 20px 0;
            padding: 20px;
            background-color: #f8fafc;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
          }
          .feature-icon {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #3b82f6, #1e40af);
            border-radius: 50%;
            margin-left: 15px;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
          }
          .feature-content h4 {
            color: #1e293b;
            margin: 0 0 8px 0;
            font-size: 16px;
            font-weight: 600;
          }
          .feature-content p {
            color: #64748b;
            margin: 0;
            font-size: 14px;
            line-height: 1.6;
          }
          .cta-section {
            text-align: center;
            margin: 40px 0;
            padding: 30px;
            background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
            border-radius: 12px;
          }
          .cta-text {
            color: #475569;
            font-size: 16px;
            margin-bottom: 25px;
            font-weight: 500;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
            color: white;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
          }
          .cta-button:hover {
            background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
          }
          .footer {
            background-color: #1e293b;
            color: white;
            padding: 30px;
            text-align: center;
          }
          .footer h3 {
            color: #f1f5f9;
            margin: 0 0 10px 0;
            font-size: 20px;
            font-weight: 600;
          }
          .footer p {
            margin: 5px 0;
            font-size: 14px;
            color: #94a3b8;
          }
          .footer-description {
            margin: 15px 0;
            font-size: 16px;
            color: #cbd5e1;
          }
          .footer-links {
            margin: 20px 0;
          }
          .footer-links a {
            color: #3b82f6;
            text-decoration: none;
            margin: 0 10px;
            font-weight: 500;
          }
          .footer-links a:hover {
            color: #60a5fa;
          }
          .unsubscribe {
            font-size: 12px;
            color: #64748b;
            margin-top: 20px;
            border-top: 1px solid #334155;
            padding-top: 15px;
          }
          .unsubscribe a {
            color: #3b82f6;
            text-decoration: none;
          }
          @media (max-width: 600px) {
            .container {
              border-radius: 0;
              margin: 0;
            }
            .header, .content, .footer {
              padding: 25px 20px;
            }
            .feature-item {
              flex-direction: column;
              text-align: center;
            }
            .feature-icon {
              margin: 0 auto 15px auto;
            }
            .cta-button {
              padding: 14px 28px;
              font-size: 15px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <h1>مرحباً بك في نشرة يزن صالح! 🎉</h1>
            <p>نشرة متخصصة في إدارة المنتجات والنمو الرقمي</p>
          </div>

          <!-- Content -->
          <div class="content">
            <div class="welcome-message">
              <h3>أهلاً وسهلاً ${name}!</h3>
              <p><strong>شكراً لك على الانضمام إلى مجتمعنا!</strong></p>
              <p>نحن متحمسون لمشاركة أحدث الرؤى والخبرات معك في عالم إدارة المنتجات الرقمية وريادة الأعمال.</p>
            </div>

            <div class="features">
              <h3>ماذا تتوقع من نشرتنا:</h3>
              
              <div class="feature-item">
                <div class="feature-icon">📝</div>
                <div class="feature-content">
                  <h4>مقالات متخصصة</h4>
                  <p>محتوى عملي حول إدارة المنتجات والاستراتيجيات الرقمية من واقع الخبرة العملية</p>
                </div>
              </div>
              
              <div class="feature-item">
                <div class="feature-icon">🚀</div>
                <div class="feature-content">
                  <h4>رحلات الشركات</h4>
                  <p>قصص نجاح ملهمة من الشركات الناشئة والمشاريع الريادية مع تحليل عملي للدروس المستفادة</p>
                </div>
              </div>
              
              <div class="feature-item">
                <div class="feature-icon">💡</div>
                <div class="feature-content">
                  <h4>رؤى وتحليلات</h4>
                  <p>خبرات عملية من واقع العمل في مجال التكنولوجيا وإدارة المنتجات الرقمية</p>
                </div>
              </div>
            </div>

            <div class="cta-section">
              <p class="cta-text">
                ابدأ رحلتك معنا واستكشف أحدث المحتوى المتاح على الموقع
              </p>
              <a href="${siteUrl}" class="cta-button">
                زيارة الموقع الإلكتروني
              </a>
            </div>

            <p style="color: #64748b; font-size: 16px; text-align: center; margin-top: 30px;">
              سنرسل لك محتوى جديد كلما أضفنا مقالاً جديداً أو قصة شركة ملهمة. نعدك بأن المحتوى سيكون مفيداً وعملياً!
            </p>
          </div>

          <!-- Footer -->
          <div class="footer">
            <h3>يزن صالح</h3>
            <p class="footer-description">خبير إدارة المنتجات والنمو الرقمي</p>
            
            <div class="footer-links">
              <a href="#">LinkedIn</a>
              <a href="#">Twitter</a>
              <a href="${siteUrl}">الموقع الإلكتروني</a>
            </div>
            
            <div class="unsubscribe">
              <p>© 2025 يزن صالح. جميع الحقوق محفوظة.</p>
              <p>هل وصلك هذا الإيميل بالخطأ؟ <a href="#">إلغاء الاشتراك</a></p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailData = {
      personalizations: [
        {
          to: [{ 
            email: email, 
            name: name 
          }],
          subject: "مرحباً بك في نشرة يزن صالح! 🎉",
        },
      ],
      from: {
        email: "newsletter@yazansaleh.com",
        name: "يزن صالح"
      },
      content: [
        {
          type: "text/html",
          value: emailContent,
        },
      ],
      mail_settings: {
        sandbox_mode: {
          enable: false
        }
      },
      tracking_settings: {
        click_tracking: {
          enable: true
        },
        open_tracking: {
          enable: true
        }
      }
    };

    console.log("📤 Sending welcome email via SendGrid API...");

    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${sendGridApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
    });

    const responseText = await response.text();
    const responseHeaders = Object.fromEntries(response.headers.entries());
    
    console.log("📊 SendGrid API Response:");
    console.log("  - Status:", response.status);
    console.log("  - Status Text:", response.statusText);
    console.log("  - Headers:", responseHeaders);
    console.log("  - Body:", responseText || '(empty)');
    console.log("  - Message ID:", responseHeaders['x-message-id'] || 'Not provided');

    if (!response.ok) {
      console.error("❌ SendGrid API returned error status:", response.status);
      let errorDetails = responseText;
      
      try {
        const errorJson = JSON.parse(responseText);
        console.error("🔍 Detailed error analysis:", errorJson);
        errorDetails = JSON.stringify(errorJson, null, 2);
      } catch {
        console.error("📝 Raw error text:", responseText);
      }
      
      return new Response(
        JSON.stringify({ 
          error: `Failed to send welcome email: HTTP ${response.status}`,
          details: errorDetails,
          success: false
        }),
        {
          status: 500,
          headers: { 
            "Content-Type": "application/json", 
            ...corsHeaders 
          },
        }
      );
    }

    console.log("✅ Welcome email sent successfully!");
    console.log("🆔 Message ID:", responseHeaders['x-message-id'] || 'Unknown');

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "تم إرسال الإيميل الترحيبي بنجاح",
        messageId: responseHeaders['x-message-id'] || 'Unknown'
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error("💥 === Critical Error in Welcome Email Function ===");
    console.error("Error name:", error?.name || 'Unknown');
    console.error("Error message:", error?.message || 'Unknown error');
    console.error("Error stack:", error?.stack || 'No stack trace');
    
    return new Response(
      JSON.stringify({ 
        error: error?.message || 'حدث خطأ غير متوقع في الخادم',
        details: error?.stack || "No stack trace available",
        success: false,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);