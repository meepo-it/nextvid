-- Seed data for feature requests demo
-- Run: npx wrangler d1 execute mkfast-template --local --file=scripts/seed-feature-requests.sql

-- Create demo users if not exist
INSERT OR IGNORE INTO user (id, name, email, email_verified, created_at, updated_at)
VALUES
  ('seed-user-01', 'Alice Chen', 'alice@example.com', 1, 1711900800000, 1711900800000),
  ('seed-user-02', 'Bob Smith', 'bob@example.com', 1, 1711900800000, 1711900800000),
  ('seed-user-03', 'Carol Wang', 'carol@example.com', 1, 1711900800000, 1711900800000);

-- Insert feature requests
INSERT INTO feature_request (id, title, description, status, category, user_id, vote_count, created_at, updated_at)
VALUES
  ('fr-001', 'Dark mode improvements', 'Improve dark mode contrast and add more theme options for better readability in low-light environments.', 'in_progress', 'UI', 'seed-user-01', 42, 1711900800000, 1711900800000),
  ('fr-002', 'API rate limiting dashboard', 'Add a visual dashboard to monitor API usage and rate limit status in real-time.', 'planned', 'API', 'seed-user-02', 38, 1711814400000, 1711814400000),
  ('fr-003', 'Multi-language support for emails', 'Send transactional emails in the user''s preferred language based on their locale settings.', 'submitted', 'Email', 'seed-user-03', 35, 1711728000000, 1711728000000),
  ('fr-004', 'Webhook event logs', 'Add a page to view webhook delivery history, payloads, and retry status.', 'planned', 'API', 'seed-user-01', 31, 1711641600000, 1711641600000),
  ('fr-005', 'Two-factor authentication', 'Support TOTP-based 2FA for enhanced account security.', 'in_progress', 'Security', 'seed-user-02', 28, 1711555200000, 1711555200000),
  ('fr-006', 'Export data to CSV', 'Allow users to export their dashboard data and analytics to CSV files.', 'submitted', 'Dashboard', 'seed-user-03', 24, 1711468800000, 1711468800000),
  ('fr-007', 'Team collaboration features', 'Invite team members, assign roles, and share resources within an organization.', 'submitted', 'Collaboration', 'seed-user-01', 21, 1711382400000, 1711382400000),
  ('fr-008', 'Mobile responsive improvements', 'Optimize sidebar navigation and tables for mobile and tablet devices.', 'done', 'UI', 'seed-user-02', 19, 1711296000000, 1711296000000),
  ('fr-009', 'Custom domain support', 'Allow users to map their own domains to their public-facing pages.', 'planned', 'Infrastructure', 'seed-user-03', 17, 1711209600000, 1711209600000),
  ('fr-010', 'Stripe invoice PDF download', 'Provide downloadable PDF invoices directly from the billing settings page.', 'done', 'Billing', 'seed-user-01', 15, 1711123200000, 1711123200000),
  ('fr-011', 'Slack integration', 'Send notifications to Slack channels when key events happen like new signup, payment, etc.', 'submitted', 'Integration', 'seed-user-02', 13, 1711036800000, 1711036800000),
  ('fr-012', 'Bulk user management', 'Allow admins to select and perform actions on multiple users at once.', 'submitted', 'Admin', 'seed-user-03', 10, 1710950400000, 1710950400000);
