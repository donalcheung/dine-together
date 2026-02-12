-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  dietary_restrictions TEXT,
  food_preferences TEXT,
  rating DECIMAL(3,2) DEFAULT 5.0,
  total_likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create dining_requests table
CREATE TABLE dining_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  restaurant_name TEXT NOT NULL,
  restaurant_address TEXT NOT NULL,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  dining_time TIMESTAMP WITH TIME ZONE NOT NULL,
  seats_available INTEGER NOT NULL CHECK (seats_available >= 0),
  total_seats INTEGER NOT NULL CHECK (total_seats > 0),
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'completed')),
  price_level TEXT,
  cuisine_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create dining_joins table
CREATE TABLE dining_joins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES dining_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(request_id, user_id)
);

-- Create ratings table
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  request_id UUID NOT NULL REFERENCES dining_requests(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(from_user_id, to_user_id, request_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_dining_requests_host_id ON dining_requests(host_id);
CREATE INDEX idx_dining_requests_status ON dining_requests(status);
CREATE INDEX idx_dining_requests_dining_time ON dining_requests(dining_time);
CREATE INDEX idx_dining_joins_request_id ON dining_joins(request_id);
CREATE INDEX idx_dining_joins_user_id ON dining_joins(user_id);
CREATE INDEX idx_ratings_to_user_id ON ratings(to_user_id);

-- Create profile_likes table (for liking user profiles)
CREATE TABLE profile_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(from_user_id, to_user_id)
);

CREATE INDEX idx_profile_likes_to_user_id ON profile_likes(to_user_id);
CREATE INDEX idx_profile_likes_from_user_id ON profile_likes(from_user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE dining_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE dining_joins ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_likes ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone" 
  ON profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Dining requests policies
CREATE POLICY "Dining requests are viewable by everyone" 
  ON dining_requests FOR SELECT 
  USING (true);

CREATE POLICY "Users can create dining requests" 
  ON dining_requests FOR INSERT 
  WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Users can update own dining requests" 
  ON dining_requests FOR UPDATE 
  USING (auth.uid() = host_id);

CREATE POLICY "Users can delete own dining requests" 
  ON dining_requests FOR DELETE 
  USING (auth.uid() = host_id);

-- Dining joins policies
CREATE POLICY "Dining joins are viewable by everyone" 
  ON dining_joins FOR SELECT 
  USING (true);

CREATE POLICY "Users can create dining joins" 
  ON dining_joins FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Hosts can update dining joins for their requests" 
  ON dining_joins FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM dining_requests 
      WHERE dining_requests.id = dining_joins.request_id 
      AND dining_requests.host_id = auth.uid()
    )
  );

-- Ratings policies
CREATE POLICY "Ratings are viewable by everyone" 
  ON ratings FOR SELECT 
  USING (true);

CREATE POLICY "Users can create ratings" 
  ON ratings FOR INSERT 
  WITH CHECK (auth.uid() = from_user_id);
Profile likes policies
CREATE POLICY "Profile likes are viewable by everyone" 
  ON profile_likes FOR SELECT 
  USING (true);

CREATE POLICY "Users can create profile likes" 
  ON profile_likes FOR INSERT 
  WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can delete own profile likes" 
  ON profile_likes FOR DELETE 
  USING (auth.uid() = from_user_id);

-- 
-- Function to update user rating after new rating is added
CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET 
    rating = (
      SELECT AVG(rating)::DECIMAL(3,2)
      FROM ratings
      WHERE to_user_id = NEW.to_user_id
    ),
    total_likes = (
      SELECT COUNT(*)
      FROM ratings
      WHERE to_update total_likes after profile like is added/removed
CREATE OR REPLACE FUNCTION update_profile_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE profiles
    SET total_likes = (
      SELECT COUNT(*)
      FROM profile_likes
      WHERE to_user_id = NEW.to_user_id
    )
    WHERE id = NEW.to_user_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE profiles
    SET total_likes = (
      SELECT COUNT(*)
      FROM profile_likes
      WHERE to_user_id = OLD.to_user_id
    )
    WHERE id = OLD.to_user_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update profile likes count
CREATE TRIGGER on_profile_like_changed
  AFTER INSERT OR DELETE ON profile_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_likes_count();

-- Function to user_id = NEW.to_user_id
    )
  WHERE id = NEW.to_user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update rating when new rating is added
CREATE TRIGGER on_rating_created
  AFTER INSERT ON ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_user_rating();

-- Function to automatically close dining requests after dining time has passed
CREATE OR REPLACE FUNCTION close_expired_requests()
RETURNS void AS $$
BEGIN
  UPDATE dining_requests
  SET status = 'closed'
  WHERE status = 'open'
  AND dining_time < NOW();
END;
$$ LANGUAGE plpgsql;

-- Chat tables
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('direct', 'group')),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  direct_pair_key TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_conversations_direct_pair_unique
  ON conversations(direct_pair_key)
  WHERE type = 'direct';

CREATE UNIQUE INDEX idx_conversations_group_unique
  ON conversations(group_id)
  WHERE type = 'group';

CREATE INDEX idx_conversations_last_message_at ON conversations(last_message_at);

CREATE TABLE conversation_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_read_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(conversation_id, user_id)
);

CREATE INDEX idx_conversation_participants_user_id ON conversation_participants(user_id);
CREATE INDEX idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Update conversation activity when a message is created
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_message_created
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Conversations policies
CREATE POLICY "Conversations are viewable by participants"
  ON conversations FOR SELECT
  USING (
    (type = 'direct' AND direct_pair_key LIKE '%' || auth.uid() || '%')
    OR
    (type = 'group' AND EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = conversations.group_id
      AND gm.user_id = auth.uid()
    ))
  );

CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Conversation participants policies
CREATE POLICY "Participants are viewable by members"
  ON conversation_participants FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_participants.conversation_id
      AND c.type = 'direct'
      AND c.direct_pair_key LIKE '%' || auth.uid() || '%'
    )
    OR EXISTS (
      SELECT 1 FROM conversations c
      JOIN group_members gm ON gm.group_id = c.group_id
      WHERE c.id = conversation_participants.conversation_id
      AND c.type = 'group'
      AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join conversations"
  ON conversation_participants FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_participants.conversation_id
      AND c.created_by = auth.uid()
    )
  );

-- Messages policies
CREATE POLICY "Messages are viewable by members"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = messages.conversation_id
      AND cp.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM conversations c
      JOIN group_members gm ON gm.group_id = c.group_id
      WHERE c.id = messages.conversation_id
      AND c.type = 'group'
      AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND (
      EXISTS (
        SELECT 1 FROM conversation_participants cp
        WHERE cp.conversation_id = messages.conversation_id
        AND cp.user_id = auth.uid()
      )
      OR EXISTS (
        SELECT 1 FROM conversations c
        JOIN group_members gm ON gm.group_id = c.group_id
        WHERE c.id = messages.conversation_id
        AND c.type = 'group'
        AND gm.user_id = auth.uid()
      )
    )
  );
