import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './use-auth';
import { toast } from 'sonner';

interface AlertSubscription {
  id: string;
  station_id: string;
  station_name: string;
  aqi_threshold: number;
  is_active: boolean;
  notify_email: boolean;
}

export function useAlertSubscriptions() {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<AlertSubscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubscriptions = useCallback(async () => {
    if (!user) {
      setSubscriptions([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('alert_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast.error('Failed to load alert subscriptions');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const addSubscription = useCallback(async (
    stationId: string,
    stationName: string,
    threshold: number = 150
  ) => {
    if (!user) {
      toast.error('Please sign in to subscribe to alerts');
      return { error: new Error('Not authenticated') };
    }

    try {
      const { data, error } = await supabase
        .from('alert_subscriptions')
        .insert({
          user_id: user.id,
          station_id: stationId,
          station_name: stationName,
          aqi_threshold: threshold,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          toast.error('You are already subscribed to alerts for this station');
        } else {
          throw error;
        }
        return { error };
      }

      setSubscriptions(prev => [data, ...prev]);
      toast.success(`Alert subscription added for ${stationName}`);
      return { data };
    } catch (error) {
      console.error('Error adding subscription:', error);
      toast.error('Failed to add subscription');
      return { error };
    }
  }, [user]);

  const updateSubscription = useCallback(async (
    id: string,
    updates: Partial<Omit<AlertSubscription, 'id' | 'station_id' | 'station_name'>>
  ) => {
    try {
      const { error } = await supabase
        .from('alert_subscriptions')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setSubscriptions(prev =>
        prev.map(sub => sub.id === id ? { ...sub, ...updates } : sub)
      );
      toast.success('Subscription updated');
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast.error('Failed to update subscription');
    }
  }, []);

  const deleteSubscription = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('alert_subscriptions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSubscriptions(prev => prev.filter(sub => sub.id !== id));
      toast.success('Subscription removed');
    } catch (error) {
      console.error('Error deleting subscription:', error);
      toast.error('Failed to remove subscription');
    }
  }, []);

  return {
    subscriptions,
    isLoading,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    refresh: fetchSubscriptions,
  };
}
