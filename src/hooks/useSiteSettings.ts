
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SiteSettings {
  id: string;
  site_name: string;
  site_description?: string;
  contact_email?: string;
  linkedin_url?: string;
  twitter_url?: string;
  whatsapp_number?: string;
  facebook_url?: string;
  instagram_url?: string;
  created_at: string;
  updated_at: string;
}

export const useSiteSettings = () => {
  return useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching site settings:', error);
        throw error;
      }
      return data as SiteSettings | null;
    },
  });
};

export const useUpdateSiteSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updates: Partial<Omit<SiteSettings, 'id' | 'created_at' | 'updated_at'>>) => {
      try {
        console.log('Starting site settings update with data:', updates);
        
        // Get the first record to update
        const { data: existing, error: fetchError } = await supabase
          .from('site_settings')
          .select('id')
          .limit(1)
          .maybeSingle();

        if (fetchError) {
          console.error('Error fetching existing settings:', fetchError);
          throw fetchError;
        }

        // Clean the updates object - remove empty strings and convert to null
        const cleanedUpdates = Object.fromEntries(
          Object.entries(updates).map(([key, value]) => [
            key, 
            typeof value === 'string' && value.trim() === '' ? null : value
          ])
        );

        if (existing?.id) {
          console.log('Updating existing record with ID:', existing.id);
          // Update existing record
          const { data, error } = await supabase
            .from('site_settings')
            .update({ 
              ...cleanedUpdates, 
              updated_at: new Date().toISOString() 
            })
            .eq('id', existing.id)
            .select()
            .single();
          
          if (error) {
            console.error('Error updating site settings:', error);
            throw error;
          }
          
          console.log('Successfully updated site settings:', data);
          return data;
        } else {
          console.log('Creating new site settings record');
          // Insert new record if none exists
          const requiredFields = {
            site_name: cleanedUpdates.site_name || 'اسم الموقع'
          };
          
          const { data, error } = await supabase
            .from('site_settings')
            .insert({ 
              ...requiredFields, 
              ...cleanedUpdates,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();
          
          if (error) {
            console.error('Error inserting site settings:', error);
            throw error;
          }
          
          console.log('Successfully created site settings:', data);
          return data;
        }
      } catch (error) {
        console.error('Site settings mutation error:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Site settings mutation successful:', data);
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
    },
    onError: (error) => {
      console.error('Site settings update failed:', error);
    }
  });
};
