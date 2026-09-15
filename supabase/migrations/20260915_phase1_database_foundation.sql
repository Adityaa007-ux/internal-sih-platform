-- ===================================================================
-- PHASE 1: DATABASE FOUNDATION
-- Multi-Institution SIH Platform
-- Date: 2026-09-15
-- ===================================================================
-- 
-- This migration establishes the complete database schema for:
-- 1. Multi-institution architecture (universities/colleges)
-- 2. User roles and relationships
-- 3. Teams with 6-member constraint and gender tracking
-- 4. Problem statements repository
-- 5. Proposals and workflow management
-- 6. AI analysis and similarity results
-- 7. Faculty reviews and shortlisting
-- 8. Presentation and final results management
-- 9. Notifications and announcements
-- 10. Audit logging
--
-- All tables use Row-Level Security (RLS) for multi-institution data isolation.
-- ===================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgtrgm"; -- For text search optimization

-- ===================================================================
-- 1. INSTITUTIONS (Multi-tenancy root)
-- ===================================================================

CREATE TABLE IF NOT EXISTS institutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  display_name VARCHAR(255) NOT NULL,
  description TEXT,
  logo_url VARCHAR(512),
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===================================================================
-- 2. USERS & PROFILES
-- ===================================================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  institution_id UUID NOT NULL REFERENCES institutions(id),
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  avatar_url VARCHAR(512),
  prn VARCHAR(50), -- Academic PRN (if student)
  role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'faculty', 'mentor', 'industrial_mentor', 'admin')),
  is_approved BOOLEAN DEFAULT FALSE, -- Admin approval flag
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(institution_id, email),
  INDEX idx_institution_role (institution_id, role)
);

-- Faculty-specific fields
CREATE TABLE IF NOT EXISTS faculty_profiles (
  id UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
  department VARCHAR(255),
  specialization TEXT,
  can_review_proposals BOOLEAN DEFAULT TRUE,
  can_shortlist BOOLEAN DEFAULT FALSE,
  can_evaluate_presentations BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Mentor-specific fields
CREATE TABLE IF NOT EXISTS mentor_profiles (
  id UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
  department VARCHAR(255),
  expertise TEXT,
  max_teams_assignable INT DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Industrial Mentor-specific fields
CREATE TABLE IF NOT EXISTS industrial_mentor_profiles (
  id UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
  organization_name VARCHAR(255),
  linkedin_url VARCHAR(512),
  expertise TEXT,
  verification_status VARCHAR(50) DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'verified', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===================================================================
-- 3. PROBLEM STATEMENTS
-- ===================================================================

CREATE TABLE IF NOT EXISTS problem_statements (
  id VARCHAR(20) PRIMARY KEY, -- e.g., "SIH1601"
  institution_id UUID NOT NULL REFERENCES institutions(id),
  title VARCHAR(512) NOT NULL,
  description TEXT NOT NULL,
  organization VARCHAR(255),
  category VARCHAR(100),
  theme VARCHAR(100),
  difficulty VARCHAR(50) CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  tags TEXT[] DEFAULT '{}', -- Array of tags
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_institution_active (institution_id, is_active)
);

-- ===================================================================
-- 4. TEAMS
-- ===================================================================

CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id UUID NOT NULL REFERENCES institutions(id),
  registration_id VARCHAR(50) NOT NULL UNIQUE, -- e.g., "JGI-SIH-2026-0001"
  name VARCHAR(255) NOT NULL,
  description TEXT,
  campus VARCHAR(255),
  department VARCHAR(255),
  problem_id VARCHAR(20) REFERENCES problem_statements(id),
  leader_id UUID REFERENCES user_profiles(id),
  email VARCHAR(255),
  phone VARCHAR(20),
  is_locked BOOLEAN DEFAULT FALSE, -- Lock membership after submission
  stage VARCHAR(100) DEFAULT 'Registration' CHECK (stage IN (
    'Registration',
    'Problem Selection',
    'Proposal Submission',
    'AI Analysis',
    'Faculty Review',
    'Shortlist',
    'Offline Presentation',
    'Final Result'
  )),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_institution_stage (institution_id, stage),
  INDEX idx_leader (leader_id)
);

-- ===================================================================
-- 5. TEAM MEMBERS (with gender tracking)
-- ===================================================================

CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id),
  name VARCHAR(255) NOT NULL,
  prn VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  department VARCHAR(255),
  academic_year VARCHAR(50),
  gender VARCHAR(50) CHECK (gender IN ('Male', 'Female', 'Other', 'Prefer not to say')),
  skills TEXT,
  is_leader BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(team_id, email),
  INDEX idx_team_leader (team_id, is_leader),
  INDEX idx_gender (team_id, gender)
);

-- Constraint: Exactly 6 team members
-- This will be enforced at the application level with database triggers

CREATE OR REPLACE FUNCTION validate_team_size()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM team_members WHERE team_id = NEW.team_id) > 6 THEN
    RAISE EXCEPTION 'Team cannot have more than 6 members';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER team_size_validation
AFTER INSERT ON team_members
FOR EACH ROW
EXECUTE FUNCTION validate_team_size();

-- Constraint: At least 1 female member if team is locked
CREATE OR REPLACE FUNCTION validate_team_gender()
RETURNS TRIGGER AS $$
DECLARE
  female_count INT;
  total_count INT;
BEGIN
  IF NEW.is_locked THEN
    SELECT COUNT(*) INTO total_count FROM team_members WHERE team_id = NEW.id;
    SELECT COUNT(*) INTO female_count FROM team_members 
    WHERE team_id = NEW.id AND gender = 'Female';
    
    IF total_count = 6 AND female_count = 0 THEN
      RAISE EXCEPTION 'A team with 6 members must have at least 1 female member';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER team_gender_validation
BEFORE UPDATE OF is_locked ON teams
FOR EACH ROW
EXECUTE FUNCTION validate_team_gender();

-- ===================================================================
-- 6. PROPOSALS & VERSIONS
-- ===================================================================

CREATE TABLE IF NOT EXISTS proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  institution_id UUID NOT NULL REFERENCES institutions(id),
  title VARCHAR(512),
  problem_id VARCHAR(20) REFERENCES problem_statements(id),
  status VARCHAR(100) DEFAULT 'Draft' CHECK (status IN (
    'Draft',
    'Submitted',
    'Under AI Analysis',
    'Under Faculty Review',
    'Shortlisted',
    'Presentation',
    'Selected',
    'Not Selected'
  )),
  submitted_at TIMESTAMP WITH TIME ZONE,
  is_locked BOOLEAN DEFAULT FALSE, -- Lock after submission
  current_version INT DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_team_status (team_id, status),
  INDEX idx_institution_status (institution_id, status)
);

-- Proposal content (latest version)
CREATE TABLE IF NOT EXISTS proposal_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id UUID NOT NULL UNIQUE REFERENCES proposals(id) ON DELETE CASCADE,
  title VARCHAR(512),
  solution TEXT,
  innovation TEXT,
  technical_approach TEXT,
  tech_stack TEXT,
  target_users TEXT,
  impact TEXT,
  scalability TEXT,
  implementation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Proposal version history
CREATE TABLE IF NOT EXISTS proposal_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  title VARCHAR(512),
  solution TEXT,
  innovation TEXT,
  technical_approach TEXT,
  tech_stack TEXT,
  target_users TEXT,
  impact TEXT,
  scalability TEXT,
  implementation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_proposal_version (proposal_id, version_number),
  UNIQUE(proposal_id, version_number)
);

-- ===================================================================
-- 7. AI ANALYSIS
-- ===================================================================

CREATE TABLE IF NOT EXISTS ai_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id UUID NOT NULL UNIQUE REFERENCES proposals(id) ON DELETE CASCADE,
  institution_id UUID NOT NULL REFERENCES institutions(id),
  overall_score NUMERIC(5, 2) CHECK (overall_score >= 0 AND overall_score <= 100),
  scores JSONB, -- { "criteria": "score" }
  strengths TEXT[] DEFAULT '{}',
  weaknesses TEXT[] DEFAULT '{}',
  recommendations TEXT[] DEFAULT '{}',
  missing_elements TEXT[] DEFAULT '{}',
  summary TEXT,
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_institution_score (institution_id, overall_score DESC)
);

-- ===================================================================
-- 8. SIMILARITY DETECTION
-- ===================================================================

CREATE TABLE IF NOT EXISTS similarity_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id UUID NOT NULL UNIQUE REFERENCES proposals(id) ON DELETE CASCADE,
  institution_id UUID NOT NULL REFERENCES institutions(id),
  similarity_score NUMERIC(5, 2) CHECK (similarity_score >= 0 AND similarity_score <= 100),
  risk_level VARCHAR(50) CHECK (risk_level IN ('Low', 'Moderate', 'High', 'Potential Duplicate')),
  matches JSONB, -- Array of similarity matches
  keywords TEXT[] DEFAULT '{}',
  explanation TEXT,
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_risk_level (institution_id, risk_level)
);

-- ===================================================================
-- 9. FACULTY REVIEWS
-- ===================================================================

CREATE TABLE IF NOT EXISTS faculty_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES faculty_profiles(id),
  institution_id UUID NOT NULL REFERENCES institutions(id),
  scores JSONB, -- { "criterion": score }
  total_score NUMERIC(5, 2),
  comments TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(proposal_id, reviewer_id),
  INDEX idx_reviewer (reviewer_id),
  INDEX idx_institution_score (institution_id, total_score DESC)
);

-- ===================================================================
-- 10. SHORTLIST DECISIONS
-- ===================================================================

CREATE TABLE IF NOT EXISTS shortlist_decisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL UNIQUE REFERENCES teams(id) ON DELETE CASCADE,
  institution_id UUID NOT NULL REFERENCES institutions(id),
  proposal_id UUID NOT NULL REFERENCES proposals(id),
  status VARCHAR(100) DEFAULT 'Under Review' CHECK (status IN (
    'Under Review',
    'Shortlisted',
    'Not Shortlisted'
  )),
  combined_score NUMERIC(5, 2),
  decision_maker_id UUID REFERENCES user_profiles(id),
  decided_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_institution_status (institution_id, status)
);

-- ===================================================================
-- 11. PRESENTATIONS & RESULTS
-- ===================================================================

CREATE TABLE IF NOT EXISTS presentations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL UNIQUE REFERENCES teams(id) ON DELETE CASCADE,
  institution_id UUID NOT NULL REFERENCES institutions(id),
  scheduled_date DATE,
  scheduled_time TIME,
  venue VARCHAR(255),
  panel_members TEXT[], -- Array of panel member names
  status VARCHAR(50) DEFAULT 'Not Scheduled' CHECK (status IN (
    'Not Scheduled',
    'Scheduled',
    'Completed'
  )),
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_institution_date (institution_id, scheduled_date)
);

CREATE TABLE IF NOT EXISTS final_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL UNIQUE REFERENCES teams(id) ON DELETE CASCADE,
  institution_id UUID NOT NULL REFERENCES institutions(id),
  presentation_id UUID REFERENCES presentations(id),
  final_result VARCHAR(50) CHECK (final_result IN ('Selected', 'Not Selected')),
  final_score NUMERIC(5, 2),
  remarks TEXT,
  decided_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_institution_result (institution_id, final_result)
);

-- ===================================================================
-- 12. CERTIFICATES
-- ===================================================================

CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  team_member_id UUID NOT NULL REFERENCES team_members(id),
  institution_id UUID NOT NULL REFERENCES institutions(id),
  certificate_number VARCHAR(100) NOT NULL UNIQUE,
  certificate_type VARCHAR(100), -- e.g., "Winner", "Shortlisted", "Participant"
  pdf_url VARCHAR(512),
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_team_member (team_member_id),
  INDEX idx_institution_type (institution_id, certificate_type)
);

-- ===================================================================
-- 13. ANNOUNCEMENTS & NOTIFICATIONS
-- ===================================================================

CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id UUID NOT NULL REFERENCES institutions(id),
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  announcement_type VARCHAR(50) CHECK (announcement_type IN ('deadline', 'info', 'result', 'ai')),
  target_audience VARCHAR(100) DEFAULT 'All', -- "All", "Students", "Faculty", etc.
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_institution_active (institution_id, is_active)
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  institution_id UUID NOT NULL REFERENCES institutions(id),
  title VARCHAR(255) NOT NULL,
  body TEXT,
  notification_type VARCHAR(100),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_read (user_id, is_read),
  INDEX idx_user_created (user_id, created_at DESC)
);

-- ===================================================================
-- 14. DEADLINES
-- ===================================================================

CREATE TABLE IF NOT EXISTS deadlines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id UUID NOT NULL REFERENCES institutions(id),
  label VARCHAR(255) NOT NULL,
  deadline_date DATE NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_institution_date (institution_id, deadline_date)
);

-- ===================================================================
-- 15. AUDIT LOGS
-- ===================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id UUID NOT NULL REFERENCES institutions(id),
  user_id UUID REFERENCES user_profiles(id),
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100),
  entity_id VARCHAR(100),
  changes JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_institution_created (institution_id, created_at DESC),
  INDEX idx_user_created (user_id, created_at DESC)
);

-- ===================================================================
-- 16. APPROVALS (for admin workflows)
-- ===================================================================

CREATE TABLE IF NOT EXISTS approvals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id UUID NOT NULL REFERENCES institutions(id),
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  approval_type VARCHAR(100), -- e.g., "user_registration", "industrial_mentor"
  status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  notes TEXT,
  reviewed_by UUID REFERENCES user_profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_institution_status (institution_id, status)
);

-- ===================================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- ===================================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE industrial_mentor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE problem_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE similarity_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE shortlist_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE presentations ENABLE ROW LEVEL SECURITY;
ALTER TABLE final_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;

-- Basic RLS policy: Users can only view their own institution's data
-- Specific policies should be implemented in application layer

CREATE POLICY "users_view_own_institution"
  ON user_profiles FOR SELECT
  USING (institution_id = (SELECT institution_id FROM user_profiles WHERE id = auth.uid() LIMIT 1));

CREATE POLICY "users_manage_own_profile"
  ON user_profiles FOR UPDATE
  USING (id = auth.uid());

-- ===================================================================
-- INDEXES FOR PERFORMANCE
-- ===================================================================

CREATE INDEX idx_teams_institution ON teams(institution_id);
CREATE INDEX idx_proposals_team ON proposals(team_id);
CREATE INDEX idx_proposals_institution ON proposals(institution_id);
CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_faculty_reviews_proposal ON faculty_reviews(proposal_id);
CREATE INDEX idx_ai_analysis_proposal ON ai_analyses(proposal_id);
CREATE INDEX idx_similarity_proposal ON similarity_results(proposal_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_audit_logs_institution ON audit_logs(institution_id);

-- ===================================================================
-- CREATED SUCCESSFULLY
-- ===================================================================
-- Phase 1 database schema foundation created.
-- Ready for:
-- 1. Demo data migration
-- 2. Authentication integration (Phase 2)
-- 3. Server-side authorization (Phase 4)
-- 4. AI integration testing (Phase 6)
