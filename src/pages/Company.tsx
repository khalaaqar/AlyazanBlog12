import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FounderCard from "@/components/FounderCard";
import { useCompany } from "@/hooks/useCompanies";
import { useFounders } from "@/hooks/useFounders";
import { Skeleton } from "@/components/ui/skeleton";

const Company = () => {
  const { id } = useParams();
  const { data: company, isLoading, error } = useCompany(id || '');
  const { data: founders, isLoading: foundersLoading } = useFounders(id || '');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <Skeleton className="w-32 h-32 mx-auto mb-6" />
            <Skeleton className="h-12 w-64 mx-auto mb-4" />
            <Skeleton className="h-8 w-48 mx-auto" />
          </div>
          <div className="space-y-8">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-primary mb-4">
            الشركة غير موجودة
          </h1>
          <p className="text-muted-foreground">
            عذراً، لم نتمكن من العثور على هذه الشركة.
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Company Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-32 h-32 bg-gray-50 rounded-lg flex items-center justify-center">
              <img
                src={company.logo_url || "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=200&h=200&fit=crop"}
                alt={`${company.name} logo`}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-primary mb-4">
            {company.name}
          </h1>
          <span className="bg-accent text-accent-foreground px-4 py-2 rounded-full text-lg font-medium">
            {company.sector}
          </span>
        </div>

        {/* Company Description */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-card-foreground mb-4">
            نبذة عن الشركة
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            {company.description}
          </p>
        </div>

        {/* Company Content */}
        {company.content && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-card-foreground mb-4">
              رحلة الشركة
            </h2>
            <div className="content-display prose prose-lg max-w-none">
              <div dangerouslySetInnerHTML={{ __html: company.content }} />
            </div>
          </div>
        )}

        {/* Founders - Compact Layout */}
        {founders && founders.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-card-foreground mb-8">
              المؤسسون
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {founders.map((founder, index) => (
                <FounderCard key={founder.id} founder={founder} index={index} />
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Company;