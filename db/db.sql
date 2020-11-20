CREATE TABLE Client(
  client_id char(64) PRIMARY KEY
);

CREATE TABLE Auth(
  code char(64) PRIMARY KEY,
  client_id char(64),
  expires BIGINT
);
