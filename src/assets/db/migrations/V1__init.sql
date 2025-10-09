-- schema init
CREATE TABLE IF NOT EXISTS menus (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price REAL NOT NULL,
  tags TEXT,
  keywords TEXT
);


