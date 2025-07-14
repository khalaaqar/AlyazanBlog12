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
  id?: string;
  siteUrl?: string;
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
    let requestBody: NewsletterData;
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
    
    const { title, content, type, subscribers, id, siteUrl } = requestBody;
    
    console.log(`📰 Processing newsletter: ${title || 'NO TITLE'}`);
    console.log(`🏷️ Type: ${type || 'NO TYPE'}`);
    console.log(`👥 Subscribers count: ${subscribers?.length || 0}`);
    console.log(`🆔 Content ID: ${id || 'NO ID'}`);

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

    console.log("🔑 API Key format check:");
    console.log("  - Starts with 'SG.':", sendGridApiKey.startsWith("SG."));
    console.log("  - Length:", sendGridApiKey.length);

    // Test SendGrid API connectivity
    console.log("🌐 === Testing SendGrid Connectivity ===");
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

    // Email sending process
    console.log("📧 === Starting Email Sending Process ===");
    const baseUrl = siteUrl || "https://evggmwlsmriivvrjfuvz.supabase.co";
    console.log("🌐 Base URL:", baseUrl);
    
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

        const emailSubject = `${type === 'article' ? '📚 مقال جديد' : '🚀 رحلة شركة جديدة'}: ${title}`;
        const readMoreUrl = id ? `${baseUrl}/${type === 'article' ? 'article' : 'company'}/${id}` : baseUrl;
        
        console.log(`📝 Email subject: ${emailSubject}`);
        console.log(`🔗 Read more URL: ${readMoreUrl}`);
        
        // Create clean content preview
        const cleanContent = content?.replace(/<[^>]*>/g, '').substring(0, 200) || '';
        
        const emailContent = `
          <!DOCTYPE html>
          <html dir="rtl" lang="ar">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>${title}</title>
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
                  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
                  color: white;
                  padding: 40px 30px;
                  text-align: center;
                }
                .header h1 {
                  margin: 0;
                  font-size: 28px;
                  font-weight: 700;
                  margin-bottom: 10px;
                }
                .header p {
                  margin: 0;
                  font-size: 16px;
                  opacity: 0.9;
                }
                .content {
                  padding: 40px 30px;
                  color: #334155;
                }
                .greeting {
                  font-size: 18px;
                  color: #64748b;
                  margin-bottom: 25px;
                }
                .content-type-badge {
                  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
                  color: white;
                  padding: 12px 20px;
                  border-radius: 25px;
                  display: inline-block;
                  font-weight: 600;
                  font-size: 14px;
                  margin-bottom: 25px;
                }
                .article-title {
                  color: #1e293b;
                  font-size: 24px;
                  font-weight: 700;
                  margin: 25px 0 20px 0;
                  line-height: 1.3;
                }
                .article-preview {
                  color: #475569;
                  font-size: 16px;
                  line-height: 1.7;
                  margin: 25px 0;
                  padding: 20px;
                  background-color: #f8fafc;
                  border-radius: 8px;
                  border-right: 4px solid #3b82f6;
                }
                .read-more-section {
                  text-align: center;
                  margin: 40px 0;
                  padding: 30px;
                  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
                  border-radius: 12px;
                }
                .read-more-text {
                  color: #475569;
                  font-size: 16px;
                  margin-bottom: 25px;
                  font-weight: 500;
                }
                .read-more-btn {
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
                .read-more-btn:hover {
                  background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
                  transform: translateY(-2px);
                  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
                }
                .footer {
                  background-color: #1e293b;
                  color: #94a3b8;
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
                  .article-title {
                    font-size: 20px;
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
                  <h1>${type === 'article' ? '📚 مقال جديد' : '🚀 رحلة شركة جديدة'}</h1>
                  <p>نشرة يزن صالح المتخصصة في إدارة المنتجات والنمو</p>
                </div>

                <!-- Content -->
                <div class="content">
                  <div class="greeting">
                    مرحباً ${subscriber.name || 'عزيزي المشترك'}،
                  </div>
                  
                  <div class="content-type-badge">
                    ${type === 'article' ? '🆕 مقال جديد متاح الآن' : '🆕 رحلة شركة جديدة متاحة الآن'}
                  </div>
                  
                  <h2 class="article-title">${title}</h2>
                  
                  <div class="article-preview">
                    ${cleanContent}${cleanContent.length >= 200 ? '...' : ''}
                  </div>
                  
                  <div class="read-more-section">
                    <p class="read-more-text">
                      ${type === 'article' ? 'اقرأ المقال كاملاً مع التنسيق والتفاصيل الإضافية على الموقع' : 'اعرف المزيد عن رحلة الشركة والتفاصيل الكاملة على الموقع'}
                    </p>
                    <a href="${readMoreUrl}" class="read-more-btn">
                      ${type === 'article' ? 'اقرأ المقال كاملاً' : 'اعرف المزيد عن الرحلة'}
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
                    <a href="${baseUrl}">الموقع الإلكتروني</a>
                  </div>
                  
                  <div class="unsubscribe">
                    <p>© 2025 يزن صالح. جميع الحقوق محفوظة.</p>
                    <p>تم إرسال هذا الإيميل لأنك مشترك في نشرة يزن صالح</p>
                    <p><a href="#">إلغاء الاشتراك</a> | <a href="${baseUrl}">زيارة الموقع</a></p>
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
            email: "alyazansal@gmail.com",
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

        // Rate limiting - wait between emails
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