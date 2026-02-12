-- Drop foreign key constraints that reference the old 'properties' table
ALTER TABLE flat_details DROP FOREIGN KEY FKg7g7o45p49kybv1j5noey9lvh;
ALTER TABLE pg_details DROP FOREIGN KEY FKrplhk05671125qrs8y1y8v3up;
ALTER TABLE property_documents DROP FOREIGN KEY FKatbp44aelvfwyk1av8clhl16f;
ALTER TABLE property_images DROP FOREIGN KEY FKemw5i1cysiorfaxfba7tgtpiu;
ALTER TABLE tenant_property_history DROP FOREIGN KEY FKsbde81yfj8g57keuidg46o6h6;

-- Now drop the old 'properties' table
DROP TABLE properties;
