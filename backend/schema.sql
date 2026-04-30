create table if not exists users (
  id bigserial primary key,
  name varchar(120) not null,
  email varchar(180) not null unique,
  password_hash text not null,
  role varchar(20) not null,
  avatar text,
  school varchar(180),
  class_name varchar(80),
  teaching_grade varchar(80),
  rank varchar(80),
  teacher_status varchar(20),
  login_days integer not null default 0,
  posts_count integer not null default 0,
  status varchar(20) not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists chat_sessions (
  id bigserial primary key,
  user_id bigint references users(id) on delete cascade,
  title varchar(180) not null default 'New study session',
  created_at timestamptz not null default now()
);

create table if not exists messages (
  id bigserial primary key,
  session_id bigint references chat_sessions(id) on delete cascade,
  role varchar(20) not null,
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists quiz_questions (
  id bigserial primary key,
  subject varchar(120) not null,
  grade varchar(40) not null,
  topic varchar(180) not null,
  difficulty varchar(40) not null,
  question text not null,
  options jsonb not null,
  answer text not null,
  explanation text,
  author varchar(180) not null,
  created_by bigint references users(id) on delete set null,
  created_at timestamptz not null default now()
);
