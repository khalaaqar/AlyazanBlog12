import { useState } from "react";
import { ChevronDown, ChevronUp, Linkedin, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FounderCardProps {
  founder: {
    id: string;
    name: string;
    title: string;
    image_url?: string;
    linkedin_url?: string;
    twitter_url?: string;
  };
  index: number;
}

const FounderCard = ({ founder, index }: FounderCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-card rounded-lg border shadow-sm hover:shadow-md transition-shadow">
      {/* Compact View */}
      <div className="p-4">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 mb-3 overflow-hidden rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            {founder.image_url ? (
              <img
                src={founder.image_url}
                alt={founder.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-bold text-lg text-primary">
                {founder.name.charAt(0)}
              </span>
            )}
          </div>
          
          <h3 className="font-bold text-sm text-card-foreground mb-1 line-clamp-1">
            {founder.name}
          </h3>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full mt-2 text-xs"
          >
            {isExpanded ? (
              <>
                إخفاء التفاصيل
                <ChevronUp className="w-3 h-3 mr-1" />
              </>
            ) : (
              <>
                عرض التفاصيل
                <ChevronDown className="w-3 h-3 mr-1" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Expanded View */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t bg-secondary/30">
          <div className="pt-4">
            <p className="text-muted-foreground text-sm mb-3 text-center">
              {founder.title}
            </p>
            
            {/* Social Links */}
            {(founder.linkedin_url || founder.twitter_url) && (
              <div className="flex justify-center gap-2">
                {founder.linkedin_url && (
                  <a 
                    href={founder.linkedin_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center justify-center w-8 h-8 bg-[#0077B5] text-white rounded-full hover:bg-[#005885] transition-colors"
                    title="LinkedIn"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
                {founder.twitter_url && (
                  <a 
                    href={founder.twitter_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center justify-center w-8 h-8 bg-[#1DA1F2] text-white rounded-full hover:bg-[#1a91da] transition-colors"
                    title="Twitter"
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FounderCard;