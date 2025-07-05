-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for subscription categories
CREATE TYPE subscription_category AS ENUM (
  'entertainment',
  'productivity',
  'news',
  'utility',
  'health',
  'finance',
  'education',
  'shopping',
  'other'
);

-- Create enum for billing frequency
CREATE TYPE billing_frequency AS ENUM (
  'monthly',
  'yearly',
  'quarterly',
  'weekly',
  'daily'
);

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  gmail_access_token TEXT,
  gmail_refresh_token TEXT,
  last_scan_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscription organizations table
CREATE TABLE public.subscription_organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category subscription_category DEFAULT 'other',
  logo_url TEXT,
  website_url TEXT,
  pricing_plans JSONB,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.subscription_organizations(id),
  name TEXT NOT NULL,
  cost DECIMAL(10,2),
  billing_frequency billing_frequency DEFAULT 'monthly',
  next_billing_date DATE,
  category subscription_category DEFAULT 'other',
  status TEXT DEFAULT 'active',
  email_source TEXT,
  is_manual BOOLEAN DEFAULT FALSE,
  is_pending_review BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email scan logs table
CREATE TABLE public.email_scan_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scan_type TEXT DEFAULT 'full',
  emails_processed INTEGER DEFAULT 0,
  subscriptions_found INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'running',
  error_message TEXT
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_scan_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for subscription organizations (public read, admin write)
CREATE POLICY "Anyone can view subscription organizations" ON public.subscription_organizations
  FOR SELECT TO PUBLIC USING (true);

-- RLS Policies for user subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON public.user_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON public.user_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own subscriptions" ON public.user_subscriptions
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for email scan logs
CREATE POLICY "Users can view own scan logs" ON public.email_scan_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scan logs" ON public.email_scan_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert some common subscription organizations
INSERT INTO public.subscription_organizations (name, category, website_url) VALUES
  ('Netflix', 'entertainment', 'https://netflix.com'),
  ('Spotify', 'entertainment', 'https://spotify.com'),
  ('Adobe Creative Cloud', 'productivity', 'https://adobe.com'),
  ('Microsoft 365', 'productivity', 'https://microsoft.com'),
  ('Google Workspace', 'productivity', 'https://workspace.google.com'),
  ('Dropbox', 'productivity', 'https://dropbox.com'),
  ('Amazon Prime', 'entertainment', 'https://amazon.com'),
  ('YouTube Premium', 'entertainment', 'https://youtube.com'),
  ('Disney+', 'entertainment', 'https://disneyplus.com'),
  ('Hulu', 'entertainment', 'https://hulu.com');
