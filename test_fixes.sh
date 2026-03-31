#!/bin/bash

# Quick Test Script for Cloudinary Migration Fixes
echo "🧪 Testing Cloudinary Migration Fixes..."
echo "======================================"

BASE_URL="http://localhost:8080"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "\n${YELLOW}1. Testing Cloudinary Controller${NC}"
curl -s "$BASE_URL/api/files/test" | head -c 100
echo ""

echo -e "\n${YELLOW}2. Testing File Controller (Local Files)${NC}"
curl -s "$BASE_URL/uploads/test" | head -c 100
echo ""

echo -e "\n${YELLOW}3. Testing Upload Validation${NC}"
curl -s "$BASE_URL/api/upload/validation-info" | head -c 200
echo ""

echo -e "\n${YELLOW}4. Testing Cloudinary Config${NC}"
curl -s "$BASE_URL/api/files/cloudinary-config" | head -c 200
echo ""

echo -e "\n${YELLOW}5. Testing Security Config${NC}"
echo "Checking if /api/upload endpoints are accessible..."
response=$(curl -s -w "%{http_code}" -o /tmp/test.json "$BASE_URL/api/upload/validation-info")
if [ "$response" = "401" ]; then
    echo -e "${GREEN}✅ Upload endpoints require authentication (expected)${NC}"
else
    echo -e "${RED}❌ Upload endpoints should require authentication${NC}"
fi

echo -e "\n${YELLOW}6. Testing Local File Serving${NC}"
echo "Checking if local file serving works..."
response=$(curl -s -w "%{http_code}" -o /tmp/test.json "$BASE_URL/uploads/test")
if [ "$response" = "200" ]; then
    echo -e "${GREEN}✅ Local file serving works${NC}"
else
    echo -e "${RED}❌ Local file serving failed${NC}"
fi

echo -e "\n${YELLOW}7. Database Check${NC}"
echo "Checking if database migration was applied..."
mysql -u root -pvishnu@1234 -D smartrentconnect_db -e "
    SELECT COUNT(*) as count FROM users WHERE profile_image IS NOT NULL;
    SELECT COUNT(*) as count FROM owners WHERE aadhar_card_image IS NOT NULL;
" 2>/dev/null

echo -e "\n${GREEN}=== Test Complete ===${NC}"
echo "If all tests pass, the migration fixes are working!"
echo "Next: Test the actual frontend upload functionality."
