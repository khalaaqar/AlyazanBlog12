
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { usePersonalInfo } from "@/hooks/usePersonalInfo";
import { useArticles } from "@/hooks/useArticles";
import { useCompanies } from "@/hooks/useCompanies";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronLeft } from "lucide-react";

const Index = () => {
  const { data: personalInfo, isLoading: personalInfoLoading } = usePersonalInfo();
  const { data: articles, isLoading: articlesLoading } = useArticles('published');
  const { data: companies, isLoading: companiesLoading } = useCompanies('published');

  // دمج المقالات والشركات وترتيبها حسب التاريخ
  const allContent = [
    ...(articles || []).map(article => ({
      ...article,
      type: 'article' as const,
      date: new Date(article.created_at)
    })),
    ...(companies || []).map(company => ({
      ...company,
      type: 'company' as const,
      date: new Date(company.created_at)
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 6);

  const isLoading = articlesLoading || companiesLoading;

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
      <Header />
      

      {/* Latest Content Section - بداية الصفحة */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              أحدث الإضافات
            </h1>
            <p className="text-muted-foreground text-xl">
              أحدث المقالات ورحلات الشركات الملهمة
            </p>
          </div>

          {/* Latest Content Grid - 2 columns with smaller, more compact cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="bg-card rounded-lg overflow-hidden shadow-sm border">
                  <div className="p-4 h-36 flex gap-3">
                    <Skeleton className="w-20 h-20 rounded flex-shrink-0" />
                    <div className="flex-1 flex flex-col">
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-8 w-full flex-1 mb-2" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                </div>
              ))
            ) : allContent.length > 0 ? (
              allContent.map((item) => (
                <Link key={`${item.type}-${item.id}`} to={item.type === 'article' ? `/article/${item.id}` : `/company/${item.id}`}>
                  <div className="bg-card rounded-lg overflow-hidden shadow-sm border hover:shadow-lg transition-shadow cursor-pointer group relative h-36">
                    <div className="p-4 h-full">
                      <div className="flex gap-3 h-full" dir="rtl">
                        {/* الصورة على اليمين - حجم أكبر */}
                        <div className="w-32 h-28 flex-shrink-0 overflow-hidden rounded-md bg-gray-50">
                          <img
                            src={item.type === 'article' ? 
                              (item.image_url || "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=300&h=200&fit=crop") :
                              (item.logo_url || "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=300&h=200&fit=crop")
                            }
                            alt={item.type === 'article' ? item.title : item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        {/* المحتوى على اليسار - More compact layout with metadata at bottom */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <h3 className="text-sm font-bold text-card-foreground mb-2 leading-tight line-clamp-2">
                              {item.type === 'article' ? item.title : item.name}
                            </h3>
                            
                            <p className="text-muted-foreground text-xs line-clamp-2 leading-relaxed mb-2">
                              {item.type === 'article' ? item.excerpt : item.description}
                            </p>
                          </div>
                          
                          {/* Metadata moved to bottom */}
                          <div className="flex items-center gap-2 flex-wrap text-xs">
                            <Badge variant={item.type === 'article' ? 'default' : 'secondary'} className="text-xs px-2 py-0.5">
                              {item.type === 'article' ? 'مقال' : 'رحلة شركة'}
                            </Badge>
                            {item.type === 'article' && (
                              <Badge variant="outline" className="text-xs px-2 py-0.5">
                                {item.category}
                              </Badge>
                            )}
                            {item.type === 'company' && (
                              <Badge variant="outline" className="text-xs px-2 py-0.5">
                                {item.sector}
                              </Badge>
                            )}
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              <span>{item.date.toLocaleDateString('en-GB')}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Arrow indicator */}
                        <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <ChevronLeft className="w-4 h-4 text-primary" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">لا يوجد محتوى متاح حالياً.</p>
              </div>
            )}
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-center gap-4 mt-12">
            <Link to="/articles">
              <Button variant="outline">عرض جميع المقالات</Button>
            </Link>
            <Link to="/company-journeys">
              <Button variant="outline">عرض جميع رحلات الشركات</Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
