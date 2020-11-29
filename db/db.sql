CREATE TABLE Client(
  client_id char(64) PRIMARY KEY
);

CREATE TABLE Auth(
  code char(64) PRIMARY KEY,
  client_id char(64),
  redirect_uri char(128),
  expires BIGINT
);

CREATE TABLE Access(
  token char(64) PRIMARY KEY,
  refresh char(64),
  expires BIGINT
);
