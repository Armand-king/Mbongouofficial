-- Script pour configurer Row Level Security (RLS) dans Supabase
-- À exécuter dans l'éditeur SQL de Supabase

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Policies for users table
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id::uuid);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id::uuid);

-- Policies for categories table
CREATE POLICY "Users can view own categories" ON categories
  FOR SELECT USING (auth.uid() = "userId"::uuid);

CREATE POLICY "Users can insert own categories" ON categories
  FOR INSERT WITH CHECK (auth.uid() = "userId"::uuid);

CREATE POLICY "Users can update own categories" ON categories
  FOR UPDATE USING (auth.uid() = "userId"::uuid);

CREATE POLICY "Users can delete own categories" ON categories
  FOR DELETE USING (auth.uid() = "userId"::uuid);

-- Policies for transactions table
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = "userId"::uuid);

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = "userId"::uuid);

CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = "userId"::uuid);

CREATE POLICY "Users can delete own transactions" ON transactions
  FOR DELETE USING (auth.uid() = "userId"::uuid);

-- Policies for budgets table
CREATE POLICY "Users can view own budgets" ON budgets
  FOR SELECT USING (auth.uid() = "userId"::uuid);

CREATE POLICY "Users can insert own budgets" ON budgets
  FOR INSERT WITH CHECK (auth.uid() = "userId"::uuid);

CREATE POLICY "Users can update own budgets" ON budgets
  FOR UPDATE USING (auth.uid() = "userId"::uuid);

CREATE POLICY "Users can delete own budgets" ON budgets
  FOR DELETE USING (auth.uid() = "userId"::uuid);

-- Policies for user_settings table
CREATE POLICY "Users can view own settings" ON user_settings
  FOR SELECT USING (auth.uid() = "userId"::uuid);

CREATE POLICY "Users can insert own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = "userId"::uuid);

CREATE POLICY "Users can update own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = "userId"::uuid);

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE users;
ALTER PUBLICATION supabase_realtime ADD TABLE categories;
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE budgets;
ALTER PUBLICATION supabase_realtime ADD TABLE user_settings;
