-- Add separate address fields to properties table
ALTER TABLE properties 
ADD COLUMN city VARCHAR(100),
ADD COLUMN state VARCHAR(100), 
ADD COLUMN pincode VARCHAR(10);

-- Add indexes for better performance
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_state ON properties(state);
CREATE INDEX idx_properties_pincode ON properties(pincode);
