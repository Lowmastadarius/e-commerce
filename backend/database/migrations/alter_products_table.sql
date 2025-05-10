-- Ajout de la colonne image
ALTER TABLE products
ADD COLUMN image VARCHAR(255) AFTER description;

-- Modification de la colonne price pour utiliser DECIMAL avec 2 décimales
ALTER TABLE products
MODIFY COLUMN price DECIMAL(10,2) NOT NULL;

-- Ajout de contraintes NOT NULL sur les champs essentiels
ALTER TABLE products
MODIFY COLUMN name VARCHAR(255) NOT NULL,
MODIFY COLUMN description TEXT NOT NULL;

-- Ajout d'un index sur le nom pour améliorer les performances de recherche
CREATE INDEX idx_products_name ON products(name);

-- Ajout d'un index sur la date de création pour le tri
CREATE INDEX idx_products_created_at ON products(created_at); 