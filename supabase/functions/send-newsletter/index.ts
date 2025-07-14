
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NewsletterData {
  title: string;
  content: string;
  type: 'article' | 'company';
  subscribers: Array<{ email: string; name: string }>;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🔥 === Newsletter Function Started ===");
    console.log("🕐 Timestamp:", new Date().toISOString());
    
    // Parse request body with error handling
    let requestBody: any;
    try {
      requestBody = await req.json();
      console.log("📨 Request body received:", JSON.stringify(requestBody, null, 2));
    } catch (parseError: any) {
      console.error("❌ Error parsing request body:", parseError.message);
      return new Response(
        JSON.stringify({ 
          error: 'خطأ في تحليل البيانات المرسلة',
          details: parseError.message,
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
    
    const { title, content, type, subscribers }: NewsletterData = requestBody;
    
    console.log(`📰 Processing newsletter: ${title || 'NO TITLE'}`);
    console.log(`🏷️ Type: ${type || 'NO TYPE'}`);
    console.log(`👥 Subscribers count: ${subscribers?.length || 0}`);

    // Validate required fields
    if (!title || !content || !type) {
      console.error("❌ Missing required fields:", { title: !!title, content: !!content, type: !!type });
      return new Response(
        JSON.stringify({ 
          error: 'البيانات المطلوبة ناقصة (العنوان، المحتوى، النوع)',
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

    if (!subscribers || subscribers.length === 0) {
      console.error("❌ No subscribers found");
      return new Response(
        JSON.stringify({ 
          error: 'لا يوجد مشتركون في النشرة البريدية',
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

    // Enhanced SendGrid API key validation
    console.log("🔍 === SendGrid API Key Validation ===");
    const sendGridApiKey = Deno.env.get("SENDGRID_API_KEY");
    console.log("🔑 API Key exists:", !!sendGridApiKey);
    
    if (!sendGridApiKey) {
      console.error("❌ SENDGRID_API_KEY environment variable not found");
      const availableEnvVars = Object.keys(Deno.env.toObject());
      console.log("🔧 Available env vars:", availableEnvVars);
      return new Response(
        JSON.stringify({ 
          error: "SENDGRID_API_KEY is not configured",
          availableEnvVars: availableEnvVars,
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

    console.log("🔑 API Key format check:");
    console.log("  - Starts with 'SG.':", sendGridApiKey.startsWith("SG."));
    console.log("  - Length:", sendGridApiKey.length);
    console.log("  - First 10 chars:", sendGridApiKey.substring(0, 10));

    // Test SendGrid API connectivity
    console.log("🌐 === Testing SendGrid Connectivity ===");
    let connectivityTestPassed = false;
    
    try {
      console.log("🔗 Making connectivity test to SendGrid...");
      const testResponse = await fetch("https://api.sendgrid.com/v3/user/profile", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${sendGridApiKey}`,
          "Content-Type": "application/json",
        },
      });
      
      console.log("📡 SendGrid connectivity test response:");
      console.log("  - Status:", testResponse.status);
      console.log("  - Status Text:", testResponse.statusText);
      
      if (!testResponse.ok) {
        const errorText = await testResponse.text();
        console.error("❌ SendGrid connectivity test failed:");
        console.error("  - Error body:", errorText);
        
        return new Response(
          JSON.stringify({ 
            error: `SendGrid API authentication failed: ${testResponse.status} - ${testResponse.statusText}`,
            details: errorText,
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
      
      const profileData = await testResponse.json();
      console.log("✅ SendGrid connectivity test successful!");
      console.log("👤 Profile username:", profileData?.username || 'Not available');
      connectivityTestPassed = true;
      
    } catch (connectivityError: any) {
      console.error("💥 SendGrid connectivity test threw exception:", {
        name: connectivityError.name,
        message: connectivityError.message,
        stack: connectivityError.stack
      });
      
      return new Response(
        JSON.stringify({ 
          error: "Failed to connect to SendGrid API",
          details: connectivityError.message,
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

    if (!connectivityTestPassed) {
      console.error("❌ Connectivity test did not pass - aborting");
      return new Response(
        JSON.stringify({ 
          error: "SendGrid connectivity test failed",
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

    // Email sending process
    console.log("📧 === Starting Email Sending Process ===");
    const siteUrl = Deno.env.get("SITE_URL") || "https://evggmwlsmriivvrjfuvz.supabase.co";
    console.log("🌐 Site URL:", siteUrl);
    
    const successfulSends: string[] = [];
    const failedSends: Array<{ email: string; error: string }> = [];

    // Process subscribers with enhanced error handling
    for (let i = 0; i < subscribers.length; i++) {
      const subscriber = subscribers[i];
      console.log(`\n🔄 === Processing subscriber ${i + 1}/${subscribers.length} ===`);
      console.log(`📧 Email: ${subscriber.email}`);
      console.log(`👤 Name: ${subscriber.name || 'N/A'}`);
      
      try {
        // Validate subscriber data
        if (!subscriber.email || !subscriber.email.includes('@')) {
          console.error(`❌ Invalid email for subscriber: ${subscriber.email}`);
          failedSends.push({
            email: subscriber.email || 'unknown',
            error: 'Invalid email address'
          });
          continue;
        }

        const cleanContent = content?.replace(/<[^>]*>/g, '').substring(0, 150) || '';
        const emailSubject = `${type === 'article' ? '📚 مقال جديد' : '🚀 رحلة شركة جديدة'}: ${title}`;
        
        console.log(`📝 Email subject: ${emailSubject}`);
        console.log(`📄 Content preview: ${cleanContent.substring(0, 50)}...`);
        
        const emailContent = `
          <!DOCTYPE html>
          <html dir="rtl" lang="ar">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>${title}</title>
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                  margin: 0;
                  padding: 0;
                  background-color: #0f172a;
                  color: #e2e8f0;
                  direction: rtl;
                  line-height: 1.7;
                }
                .container {
                  max-width: 800px;
                  margin: 0 auto;
                  background-color: #1e293b;
                  border-radius: 16px;
                  overflow: hidden;
                  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
                }
                .header {
                  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
                  color: white;
                  padding: 60px 40px;
                  text-align: center;
                }
                .header h1 {
                  margin: 0;
                  font-size: 32px;
                  font-weight: 700;
                  margin-bottom: 10px;
                }
                .header p {
                  margin: 0;
                  font-size: 18px;
                  opacity: 0.9;
                }
                .content {
                  padding: 50px 40px;
                  color: #e2e8f0;
                }
                .greeting {
                  font-size: 18px;
                  color: #94a3b8;
                  margin-bottom: 30px;
                }
                .article-meta {
                  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
                  padding: 20px;
                  border-radius: 12px;
                  margin: 30px 0;
                  text-align: center;
                  color: white;
                  font-weight: 600;
                  font-size: 16px;
                }
                .article-title {
                  color: #3b82f6;
                  font-size: 28px;
                  font-weight: 700;
                  margin: 30px 0 20px 0;
                  line-height: 1.3;
                }
                .article-content {
                  color: #e2e8f0;
                  font-size: 16px;
                  line-height: 1.8;
                  margin: 30px 0;
                }
                .article-content h1, .article-content h2, .article-content h3 {
                  color: #f1f5f9;
                  margin: 25px 0 15px 0;
                  font-weight: 600;
                }
                .article-content h1 { font-size: 24px; }
                .article-content h2 { font-size: 22px; }
                .article-content h3 { font-size: 20px; }
                .article-content p {
                  margin: 15px 0;
                }
                .article-content ul, .article-content ol {
                  margin: 15px 0;
                  padding-right: 20px;
                }
                .article-content li {
                  margin: 8px 0;
                }
                .article-content strong {
                  color: #f1f5f9;
                  font-weight: 600;
                }
                .read-more-container {
                  text-align: center;
                  margin: 40px 0;
                  padding: 30px;
                  background-color: #334155;
                  border-radius: 12px;
                }
                .read-more-btn {
                  display: inline-block;
                  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
                  color: white;
                  padding: 16px 32px;
                  text-decoration: none;
                  border-radius: 12px;
                  font-weight: 600;
                  font-size: 16px;
                  transition: all 0.3s ease;
                  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
                }
                .read-more-btn:hover {
                  background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
                  transform: translateY(-2px);
                  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
                }
                .footer {
                  background-color: #0f172a;
                  color: #94a3b8;
                  padding: 40px;
                  text-align: center;
                  border-top: 1px solid #334155;
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
                }
                .footer-description {
                  margin: 20px 0;
                  font-size: 16px;
                  color: #cbd5e1;
                }
                .footer-links {
                  margin: 30px 0;
                }
                .footer-links a {
                  color: #3b82f6;
                  text-decoration: none;
                  margin: 0 15px;
                  font-weight: 500;
                  transition: color 0.3s ease;
                }
                .footer-links a:hover {
                  color: #60a5fa;
                }
                .unsubscribe {
                  font-size: 12px;
                  color: #64748b;
                  margin-top: 30px;
                  border-top: 1px solid #334155;
                  padding-top: 20px;
                }
                .unsubscribe p {
                  margin: 5px 0;
                }
                .unsubscribe a {
                  color: #3b82f6;
                  text-decoration: none;
                }
                .unsubscribe a:hover {
                  text-decoration: underline;
                }
                @media (max-width: 600px) {
                  .container {
                    border-radius: 0;
                    margin: 0;
                  }
                  .header, .content, .footer {
                    padding: 30px 20px;
                  }
                  .article-title {
                    font-size: 24px;
                  }
                  .read-more-btn {
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
                  <h1>${type === 'article' ? '📚 مقال جديد في النشرة' : '🚀 رحلة شركة جديدة'}</h1>
                  <p>نشرة متخصصة في إدارة المنتجات والنمو</p>
                </div>

                <!-- Content -->
                <div class="content">
                  <div class="greeting">
                    أهلاً ${subscriber.name || 'عزيزي المشترك'}،
                  </div>
                  
                  <div class="article-meta">
                    ${type === 'article' ? '🆕 مقال جديد متاح الآن في نشرة يزن صالح' : '🆕 رحلة شركة جديدة متاحة الآن'}
                  </div>
                  
                  <h2 class="article-title">${title}</h2>
                  
                  <div class="article-content">
                    ${content}
                  </div>
                  
                  <div class="read-more-container">
                    <p style="margin-bottom: 20px; color: #cbd5e1; font-size: 16px;">
                      ${type === 'article' ? 'اقرأ المقال كاملاً مع التنسيق والتفاصيل الإضافية' : 'اعرف المزيد عن رحلة الشركة والتفاصيل الكاملة'}
                    </p>
                    <a href="${siteUrl}/${type === 'article' ? 'article' : 'company'}/${requestBody.id || ''}" class="read-more-btn">
                      اقرأ في الصفحة الرئيسية
                    </a>
                  </div>
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
                    <p>تم إرسال هذا الإيميل لأنك مشترك في نشرة يزن صالح</p>
                    <p><a href="#" style="color: #3b82f6;">إلغاء الاشتراك</a> | <a href="${siteUrl}" style="color: #3b82f6;">زيارة الموقع</a></p>
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
                email: subscriber.email, 
                name: subscriber.name || subscriber.email 
              }],
              subject: emailSubject,
            },
          ],
          from: {
            email: "نشرة يزن صالح <onboarding@resend.dev>",
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

        console.log("📤 Sending email via SendGrid API...");
        console.log("🔧 Email payload structure:", {
          to: emailData.personalizations[0].to,
          from: emailData.from,
          subject: emailData.personalizations[0].subject,
          contentType: emailData.content[0].type,
          sandboxMode: emailData.mail_settings?.sandbox_mode?.enable
        });

        const startTime = performance.now();
        const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${sendGridApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(emailData),
        });
        const endTime = performance.now();

        console.log(`⏱️ SendGrid API call took ${Math.round(endTime - startTime)}ms`);
        
        const responseText = await response.text();
        const responseHeaders = Object.fromEntries(response.headers.entries());
        
        console.log(`📊 SendGrid API Response for ${subscriber.email}:`);
        console.log("  - Status:", response.status);
        console.log("  - Status Text:", response.statusText);
        console.log("  - Headers:", responseHeaders);
        console.log("  - Body:", responseText || '(empty)');
        console.log("  - Message ID:", responseHeaders['x-message-id'] || 'Not provided');

        if (!response.ok) {
          console.error(`❌ SendGrid API returned error status ${response.status}`);
          let errorDetails = responseText;
          
          try {
            const errorJson = JSON.parse(responseText);
            console.error("🔍 Detailed error analysis:", errorJson);
            errorDetails = JSON.stringify(errorJson, null, 2);
          } catch {
            console.error("📝 Raw error text:", responseText);
          }
          
          failedSends.push({
            email: subscriber.email,
            error: `HTTP ${response.status}: ${errorDetails}`
          });
        } else {
          console.log(`✅ Email sent successfully to ${subscriber.email}`);
          console.log(`🆔 Message ID: ${responseHeaders['x-message-id'] || 'Unknown'}`);
          successfulSends.push(subscriber.email);
        }

        // Rate limiting
        if (i < subscribers.length - 1) {
          console.log(`⏳ Waiting 1 second before next email...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (emailError: any) {
        console.error(`💥 Exception while sending to ${subscriber.email}:`, {
          name: emailError.name,
          message: emailError.message,
          stack: emailError.stack
        });
        failedSends.push({
          email: subscriber.email,
          error: `Exception: ${emailError.message}`
        });
      }
    }

    console.log("\n📊 === Final Newsletter Sending Report ===");
    console.log(`✅ Successful emails: ${successfulSends.length}`);
    console.log(`❌ Failed emails: ${failedSends.length}`);
    console.log(`📈 Total processed: ${subscribers.length}`);
    console.log(`📊 Success rate: ${((successfulSends.length / subscribers.length) * 100).toFixed(1)}%`);
    
    if (successfulSends.length > 0) {
      console.log("✅ Successfully sent to:", successfulSends);
    }
    
    if (failedSends.length > 0) {
      console.log("❌ Failed to send to:", failedSends.map(f => `${f.email}: ${f.error}`));
    }

    const responseData = {
      success: successfulSends.length > 0,
      sent: successfulSends.length,
      failed: failedSends.length,
      total: subscribers.length,
      message: successfulSends.length > 0 
        ? `تم إرسال النشرة البريدية بنجاح إلى ${successfulSends.length} مشترك من أصل ${subscribers.length}`
        : `فشل في إرسال النشرة البريدية لجميع المشتركين`,
      details: {
        successful: successfulSends,
        failed: failedSends
      }
    };

    console.log("🎯 Final response:", JSON.stringify(responseData, null, 2));
    console.log("🏁 === Newsletter Function Completed Successfully ===");

    return new Response(
      JSON.stringify(responseData),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
    
  } catch (error: any) {
    console.error("💥 === Critical Error in Newsletter Function ===");
    console.error("Error name:", error?.name || 'Unknown');
    console.error("Error message:", error?.message || 'Unknown error');
    console.error("Error stack:", error?.stack || 'No stack trace');
    console.error("Error toString:", error?.toString() || 'Cannot convert to string');
    console.error("Full error object:", error);
    
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
