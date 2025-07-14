
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useArticles } from "@/hooks/useArticles";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Calendar, ChevronLeft } from "lucide-react";

const Articles = () => {
  const { data: articles, isLoading } = useArticles('published');

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">
            المقالات
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            مجموعة من المقالات المتخصصة في إدارة المنتجات والنمو في الشركات الناشئة
          </p>
        </div>

        {/* Articles Grid - 2 columns with smaller, more compact cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoading ? (
            // Loading skeletons with smaller height
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-card rounded-lg overflow-hidden shadow-sm border h-36">
                <div className="p-4 h-full flex gap-3">
                  <Skeleton className="w-20 h-20 rounded flex-shrink-0" />
                  <div className="flex-1 flex flex-col">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-8 w-full flex-1 mb-2" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </div>
            ))
          ) : articles && articles.length > 0 ? (
            articles.map((article) => (
              <Link key={article.id} to={`/article/${article.id}`}>
                <div className="bg-card rounded-lg overflow-hidden shadow-sm border hover:shadow-lg transition-shadow cursor-pointer group relative h-36">
                  <div className="p-4 h-full">
                      <div className="flex gap-3 h-full" dir="rtl">
                        {/* الصورة على اليمين - حجم أكبر */}
                        <div className="w-32 h-28 flex-shrink-0 overflow-hidden rounded-md bg-gray-50">
                          <img
                            src={article.image_url || "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=300&h=200&fit=crop"}
                            alt={article.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      
                      {/* المحتوى على اليسار - More compact layout with metadata at bottom */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-card-foreground mb-2 leading-tight line-clamp-2">
                            {article.title}
                          </h3>
                          
                          <p className="text-muted-foreground text-xs line-clamp-2 leading-relaxed mb-2">
                            {article.excerpt}
                          </p>
                        </div>
                        
                        {/* Metadata moved to bottom */}
                        <div className="flex items-center gap-2 flex-wrap text-xs">
                          <Badge variant="secondary" className="bg-primary/10 text-primary font-medium text-xs px-2 py-0.5">
                            مقال
                          </Badge>
                          <Badge variant="outline" className="text-xs px-2 py-0.5">
                            {article.category}
                          </Badge>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(article.created_at).toLocaleDateString('en-GB')}</span>
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
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground text-lg">لا توجد مقالات متاحة حالياً.</p>
            </div>
          )}
        </div>

        {/* Load More Button - only show if there are more than 6 articles */}
        {articles && articles.length > 6 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              تحميل المزيد من المقالات
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Articles;
