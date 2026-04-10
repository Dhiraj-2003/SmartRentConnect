-- Database Migration Script for Cloudinary File Storage
-- This script updates the database schema to support Cloudinary URLs instead of local file paths

-- 1. Update the users table to add profile_image column (if not exists)
ALTER TABLE users 
ADD COLUMN profile_image VARCHAR(500) NULL 
COMMENT 'Cloudinary URL for profile image';

-- 2. Update the owners table to modify existing columns for Cloudinary URLs
ALTER TABLE owners 
MODIFY COLUMN aadhar_card_image VARCHAR(500) NULL 
COMMENT 'Cloudinary URL to Aadhar card image';

ALTER TABLE owners 
MODIFY COLUMN pan_card_image VARCHAR(500) NULL 
COMMENT 'Cloudinary URL to PAN card image';

-- 3. Remove the old profile_image column from owners table (since it's now inherited from users)
-- First, copy any existing profile_image data to the users table
UPDATE owners o 
JOIN users u ON o.id = u.id 
SET u.profile_image = o.profile_image 
WHERE o.profile_image IS NOT NULL;

-- Then drop the column from owners table
ALTER TABLE owners 
DROP COLUMN profile_image;

-- 4. Update the tenants table to remove duplicate profile_image column
-- First, copy any existing profile_image data to the users table
UPDATE tenants t 
JOIN users u ON t.id = u.id 
SET u.profile_image = t.profile_image 
WHERE t.profile_image IS NOT NULL;

-- Then drop the column from tenants table
ALTER TABLE tenants 
DROP COLUMN profile_image;

-- 5. Update property_images table to ensure it can handle Cloudinary URLs
ALTER TABLE property_images 
MODIFY COLUMN imageUrl VARCHAR(500) NOT NULL 
COMMENT 'Cloudinary URL for property image';

-- 6. Update property_documents table to ensure it can handle Cloudinary URLs
ALTER TABLE property_documents 
MODIFY COLUMN documentUrl VARCHAR(500) NOT NULL 
COMMENT 'Cloudinary URL for property document';

-- 7. Add indexes for better performance on Cloudinary URL columns
CREATE INDEX idx_users_profile_image ON users(profile_image);
CREATE INDEX idx_owners_aadhar_card_image ON owners(aadhar_card_image);
CREATE INDEX idx_owners_pan_card_image ON owners(pan_card_image);
CREATE INDEX idx_property_images_imageUrl ON property_images(imageUrl);
CREATE INDEX idx_property_documents_documentUrl ON property_documents(documentUrl);

-- 8. Add a table to track file migration status (optional)
CREATE TABLE IF NOT EXISTS file_migration_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    record_id BIGINT NOT NULL,
    old_file_path VARCHAR(500),
    new_cloudinary_url VARCHAR(500),
    migration_status ENUM('PENDING', 'COMPLETED', 'FAILED') DEFAULT 'PENDING',
    migration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    error_message TEXT,
    INDEX idx_migration_status (migration_status),
    INDEX idx_table_record (table_name, record_id)
) COMMENT 'Track migration of files from local storage to Cloudinary';

-- 9. Create a view for easy monitoring of Cloudinary URLs
CREATE OR REPLACE VIEW cloudinary_file_urls AS
SELECT 
    'User Profile' as file_type,
    u.id as user_id,
    u.username,
    u.role,
    u.profile_image as cloudinary_url,
    CASE 
        WHEN u.profile_image IS NOT NULL AND u.profile_image LIKE 'https://res.cloudinary.com%' THEN 'Cloudinary'
        WHEN u.profile_image IS NOT NULL THEN 'Local'
        ELSE 'None'
    END as storage_type
FROM users u
WHERE u.profile_image IS NOT NULL

UNION ALL

SELECT 
    'Owner Aadhar' as file_type,
    o.id as user_id,
    u.username,
    u.role,
    o.aadhar_card_image as cloudinary_url,
    CASE 
        WHEN o.aadhar_card_image IS NOT NULL AND o.aadhar_card_image LIKE 'https://res.cloudinary.com%' THEN 'Cloudinary'
        WHEN o.aadhar_card_image IS NOT NULL THEN 'Local'
        ELSE 'None'
    END as storage_type
FROM owners o
JOIN users u ON o.id = u.id
WHERE o.aadhar_card_image IS NOT NULL

UNION ALL

SELECT 
    'Owner PAN' as file_type,
    o.id as user_id,
    u.username,
    u.role,
    o.pan_card_image as cloudinary_url,
    CASE 
        WHEN o.pan_card_image IS NOT NULL AND o.pan_card_image LIKE 'https://res.cloudinary.com%' THEN 'Cloudinary'
        WHEN o.pan_card_image IS NOT NULL THEN 'Local'
        ELSE 'None'
    END as storage_type
FROM owners o
JOIN users u ON o.id = u.id
WHERE o.pan_card_image IS NOT NULL

UNION ALL

SELECT 
    'Property Image' as file_type,
    p.owner_id as user_id,
    u.username,
    u.role,
    pi.imageUrl as cloudinary_url,
    CASE 
        WHEN pi.imageUrl IS NOT NULL AND pi.imageUrl LIKE 'https://res.cloudinary.com%' THEN 'Cloudinary'
        WHEN pi.imageUrl IS NOT NULL THEN 'Local'
        ELSE 'None'
    END as storage_type
FROM property_images pi
JOIN property p ON pi.property_id = p.id
JOIN users u ON p.owner_id = u.id

UNION ALL

SELECT 
    'Property Document' as file_type,
    p.owner_id as user_id,
    u.username,
    u.role,
    pd.documentUrl as cloudinary_url,
    CASE 
        WHEN pd.documentUrl IS NOT NULL AND pd.documentUrl LIKE 'https://res.cloudinary.com%' THEN 'Cloudinary'
        WHEN pd.documentUrl IS NOT NULL THEN 'Local'
        ELSE 'None'
    END as storage_type
FROM property_documents pd
JOIN property p ON pd.property_id = p.id
JOIN users u ON p.owner_id = u.id;

-- 10. Add constraints to ensure Cloudinary URLs are valid (optional)
-- ALTER TABLE users ADD CONSTRAINT chk_users_profile_image_url 
-- CHECK (profile_image IS NULL OR profile_image LIKE 'https://res.cloudinary.com/%');

-- ALTER TABLE owners ADD CONSTRAINT chk_owners_aadhar_url 
-- CHECK (aadhar_card_image IS NULL OR aadhar_card_image LIKE 'https://res.cloudinary.com/%');

-- ALTER TABLE owners ADD CONSTRAINT chk_owners_pan_url 
-- CHECK (pan_card_image IS NULL OR pan_card_image LIKE 'https://res.cloudinary.com/%');

-- Migration complete! 
-- All file storage fields are now optimized for Cloudinary URLs
-- Run the following query to verify the migration:
-- SELECT * FROM cloudinary_file_urls ORDER BY storage_type, file_type;
