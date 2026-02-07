-- ============================================
-- SUPABASE SCHEMA - PadelHub Phase 2
-- ============================================

-- 2.2 TABLA: profiles
-- ============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'player' CHECK (role IN ('player', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentarios para documentación
COMMENT ON TABLE profiles IS 'Perfiles de usuario extendidos vinculados a auth.users';
COMMENT ON COLUMN profiles.role IS 'Rol del usuario: player (jugador) o admin (administrador)';


-- 2.3 TABLA: matches
-- ============================================
CREATE TABLE matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  match_date DATE NOT NULL,
  match_time TIME,
  location TEXT NOT NULL,
  max_players INTEGER DEFAULT 4 CHECK (max_players > 0 AND max_players <= 8),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'full', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_matches_date ON matches(match_date DESC);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_created_by ON matches(created_by);

-- Trigger para updated_at
CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentarios
COMMENT ON TABLE matches IS 'Partidas de pádel organizadas';
COMMENT ON COLUMN matches.status IS 'Estado: open (abierta), full (completa), completed (jugada), cancelled (cancelada)';
COMMENT ON COLUMN matches.max_players IS 'Número máximo de jugadores (típicamente 4)';


-- 2.4 TABLA: match_players
-- ============================================
CREATE TABLE match_players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
  player_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  team INTEGER CHECK (team IN (1, 2)),
  score INTEGER DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint: Un jugador no puede estar dos veces en la misma partida
  UNIQUE(match_id, player_id)
);

-- Índices
CREATE INDEX idx_match_players_match ON match_players(match_id);
CREATE INDEX idx_match_players_player ON match_players(player_id);

-- Comentarios
COMMENT ON TABLE match_players IS 'Relación entre partidas y jugadores participantes';
COMMENT ON COLUMN match_players.team IS 'Equipo del jugador: 1 o 2';


-- 2.5 ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_players ENABLE ROW LEVEL SECURITY;

-- ========== POLÍTICAS PARA profiles ==========

-- Todos pueden ver todos los perfiles (para mostrar jugadores)
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Los usuarios solo pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Los usuarios pueden insertar su propio perfil al registrarse
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ========== POLÍTICAS PARA matches ==========

-- Todos pueden ver partidas
CREATE POLICY "Matches are viewable by everyone"
  ON matches FOR SELECT
  USING (true);

-- Solo admins pueden crear partidas
CREATE POLICY "Only admins can create matches"
  ON matches FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Solo el creador o admins pueden actualizar partidas
CREATE POLICY "Creators and admins can update matches"
  ON matches FOR UPDATE
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Solo admins pueden eliminar partidas
CREATE POLICY "Only admins can delete matches"
  ON matches FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ========== POLÍTICAS PARA match_players ==========

-- Todos pueden ver inscripciones
CREATE POLICY "Match players are viewable by everyone"
  ON match_players FOR SELECT
  USING (true);

-- Los jugadores pueden inscribirse ellos mismos
CREATE POLICY "Players can join matches"
  ON match_players FOR INSERT
  WITH CHECK (auth.uid() = player_id);

-- Los jugadores pueden salirse de partidas
CREATE POLICY "Players can leave matches"
  ON match_players FOR DELETE
  USING (auth.uid() = player_id);

-- Admins pueden gestionar inscripciones
CREATE POLICY "Admins can manage match players"
  ON match_players FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 3.3 TRIGGER: Crear perfil automáticamente (PASO 3 PLAN)
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que se ejecuta después de insertar en auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
