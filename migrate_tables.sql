-- Check if old properties table has data
SELECT COUNT(*) as old_properties_count FROM properties;

-- Check if new property table has data
SELECT COUNT(*) as new_property_count FROM property;

-- If old table has data and new table is empty, migrate data
-- (Only run this if you need to migrate data)
-- INSERT INTO property (id, title, propertyType, description, ownerId, address, city, state, pincode, deposit, amenities, status, rejectionReason, createdAt, updatedAt)
-- SELECT id, title, propertyType, description, ownerId, address, city, state, pincode, deposit, amenities, status, rejectionReason, createdAt, updatedAt FROM properties;

-- Drop the old properties table (ONLY AFTER MIGRATION OR IF NO DATA NEEDED)
-- DROP TABLE properties;
