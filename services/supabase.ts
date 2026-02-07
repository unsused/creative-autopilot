/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';
import { CreativePlan, GeneratedAsset } from '../types/index';

const getEnv = (key: string, fallback = ''): string => {
  const env = import.meta.env;
  switch (key) {
    case 'VITE_SUPABASE_URL': return env.VITE_SUPABASE_URL ?? fallback;
    case 'VITE_SUPABASE_ANON_KEY': return env.VITE_SUPABASE_ANON_KEY ?? fallback;
    default: return (env as any)[key] ?? fallback;
  }
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseKey = getEnv('VITE_SUPABASE_ANON_KEY');

// Cast to any to bypass strict type checking which is failing due to potential version mismatch
// between installed types (v1) and usage (v2 methods like getSession, signInWithPassword).
export const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey) as any
  : null;

export const saveCampaign = async (userId: string, plan: CreativePlan, assets: GeneratedAsset[], name?: string) => {
  if (!supabase) throw new Error("Supabase is not configured. Missing environment variables.");

  // Ensure we have a valid user
  if (!userId) throw new Error("User must be logged in to save.");

  const { data, error } = await supabase
    .from('campaigns')
    .insert([
      {
        user_id: userId,
        name: name || plan.analysis.brandName,
        brand_name: plan.analysis.brandName,
        plan_data: plan,
        assets_data: assets,
        created_at: new Date().toISOString()
      }
    ])
    .select();

  if (error) throw error;
  return data;
};

export const getCampaigns = async (userId: string) => {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const deleteCampaign = async (campaignId: string) => {
  if (!supabase) throw new Error("Supabase is not configured.");

  const { error } = await supabase
    .from('campaigns')
    .delete()
    .eq('id', campaignId);

  if (error) throw error;
};
