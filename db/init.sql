-- init.sql: se ejecuta a la primera creación de la DB
CREATE DATABASE IF NOT EXISTS sallevent CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- crea usuario (si quieres usar variables en runtime puedes quitar esto)
CREATE USER IF NOT EXISTS 'sallevent_user'@'%' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON sallevent.* TO 'sallevent_user'@'%';
FLUSH PRIVILEGES;
