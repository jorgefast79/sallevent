# usa la imagen oficial de MySQL
FROM mysql:8.0

# copia un script de inicialización (opcional)
COPY db/init.sql /docker-entrypoint-initdb.d/init.sql

# Exponer puerto (Render gestionará internamente)
EXPOSE 3306

# El contenedor usa el entrypoint del image oficial (no hace falta CMD)
