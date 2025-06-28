-- Script pour initialiser les catégories par défaut
-- À exécuter après la création du schéma Prisma

-- Fonction pour créer les catégories par défaut pour un utilisateur
CREATE OR REPLACE FUNCTION create_default_categories(user_id TEXT)
RETURNS VOID AS $$
BEGIN
  -- Catégories de dépenses par défaut
  INSERT INTO categories (id, name, type, "userId") VALUES
    (gen_random_uuid(), 'Alimentation', 'EXPENSE', user_id),
    (gen_random_uuid(), 'Transport', 'EXPENSE', user_id),
    (gen_random_uuid(), 'Loisirs', 'EXPENSE', user_id),
    (gen_random_uuid(), 'Shopping', 'EXPENSE', user_id),
    (gen_random_uuid(), 'Logement', 'EXPENSE', user_id),
    (gen_random_uuid(), 'Éducation', 'EXPENSE', user_id),
    (gen_random_uuid(), 'Santé', 'EXPENSE', user_id),
    (gen_random_uuid(), 'Cadeaux', 'EXPENSE', user_id)
  ON CONFLICT (name, type, "userId") DO NOTHING;

  -- Catégories de revenus par défaut
  INSERT INTO categories (id, name, type, "userId") VALUES
    (gen_random_uuid(), 'Salaire', 'INCOME', user_id),
    (gen_random_uuid(), 'Bourse', 'INCOME', user_id),
    (gen_random_uuid(), 'Freelance', 'INCOME', user_id),
    (gen_random_uuid(), 'Famille', 'INCOME', user_id),
    (gen_random_uuid(), 'Autre', 'INCOME', user_id)
  ON CONFLICT (name, type, "userId") DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour créer automatiquement les catégories par défaut lors de l'inscription
CREATE OR REPLACE FUNCTION create_user_defaults()
RETURNS TRIGGER AS $$
BEGIN
  -- Créer les catégories par défaut
  PERFORM create_default_categories(NEW.id);
  
  -- Créer les paramètres par défaut
  INSERT INTO user_settings (id, "userId", theme, notifications, "autoSave")
  VALUES (gen_random_uuid(), NEW.id, 'system', true, true)
  ON CONFLICT ("userId") DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger
DROP TRIGGER IF EXISTS create_user_defaults_trigger ON users;
CREATE TRIGGER create_user_defaults_trigger
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_defaults();
