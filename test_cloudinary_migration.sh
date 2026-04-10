#!/bin/bash

# Cloudinary Migration Test Script
# This script tests all file upload and access functionality after Cloudinary migration

echo "🚀 Starting Cloudinary Migration Tests..."
echo "========================================="

# Configuration
BASE_URL="http://localhost:8080"
API_BASE="$BASE_URL/api"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test results
PASSED=0
FAILED=0

# Function to print test result
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC}: $2"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}: $2"
        ((FAILED++))
    fi
}

# Function to test API endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local expected_status=$4
    local description=$5
    
    echo -e "\n${YELLOW}Testing:${NC} $description"
    echo "Request: $method $endpoint"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "%{http_code}" -o /tmp/test_response.json "$API_BASE$endpoint")
    elif [ "$method" = "POST" ]; then
        if [ -n "$data" ]; then
            response=$(curl -s -w "%{http_code}" -o /tmp/test_response.json -X POST -d "$data" "$API_BASE$endpoint")
        else
            response=$(curl -s -w "%{http_code}" -o /tmp/test_response.json -X POST "$API_BASE$endpoint")
        fi
    fi
    
    if [ "$response" = "$expected_status" ]; then
        print_result 0 "$description (HTTP $response)"
        echo "Response: $(cat /tmp/test_response.json | head -c 200)..."
    else
        print_result 1 "$description (Expected $expected_status, got $response)"
        echo "Response: $(cat /tmp/test_response.json)"
    fi
}

# Function to test file upload
test_file_upload() {
    local endpoint=$1
    local file_path=$2
    local form_data=$3
    local description=$4
    
    echo -e "\n${YELLOW}Testing:${NC} $description"
    echo "Uploading file: $file_path"
    echo "Endpoint: $endpoint"
    
    # Create a test file if it doesn't exist
    if [ ! -f "$file_path" ]; then
        echo "Creating test file: $file_path"
        echo "This is a test image file for Cloudinary upload testing." > "$file_path"
    fi
    
    if [ -n "$form_data" ]; then
        response=$(curl -s -w "%{http_code}" -o /tmp/test_response.json \
            -X POST \
            -F "file=@$file_path" \
            $form_data \
            "$API_BASE$endpoint")
    else
        response=$(curl -s -w "%{http_code}" -o /tmp/test_response.json \
            -X POST \
            -F "file=@$file_path" \
            "$API_BASE$endpoint")
    fi
    
    if [ "$response" = "200" ] || [ "$response" = "201" ]; then
        print_result 0 "$description (HTTP $response)"
        echo "Response: $(cat /tmp/test_response.json)"
        
        # Check if response contains Cloudinary URL
        if grep -q "cloudinary.com" /tmp/test_response.json; then
            echo -e "${GREEN}✅ Cloudinary URL detected in response${NC}"
        else
            echo -e "${YELLOW}⚠️ No Cloudinary URL found in response${NC}"
        fi
    else
        print_result 1 "$description (Expected 200/201, got $response)"
        echo "Response: $(cat /tmp/test_response.json)"
    fi
}

# 1. Test Cloudinary File Controller
echo -e "\n${YELLOW}=== Testing Cloudinary File Controller ===${NC}"

test_endpoint "GET" "/files/test" "" "200" "Cloudinary file controller test"
test_endpoint "GET" "/files/validation-info" "" "200" "File validation info"
test_endpoint "GET" "/files/cloudinary-config" "" "200" "Cloudinary configuration"

# 2. Test File Upload Validation
echo -e "\n${YELLOW}=== Testing File Upload Validation ===${NC}"

test_endpoint "GET" "/upload/validation-info" "" "200" "Upload validation info"

# 3. Test Profile Image Upload (without auth - should fail)
echo -e "\n${YELLOW}=== Testing Profile Image Upload ===${NC}"

# Create test image file
test_image="/tmp/test_profile.jpg"
echo "Test image content" > "$test_image"

test_file_upload "/upload/profile-image" "$test_image" "" "Profile image upload (no auth expected to fail)"

# 4. Test Owner Document Upload (without auth - should fail)
echo -e "\n${YELLOW}=== Testing Owner Document Upload ===${NC}"

test_file_upload "/upload/owner/document" "$test_image" "-F documentType=aadhar" "Owner document upload (no auth expected to fail)"

# 5. Test Property Upload (without auth - should fail)
echo -e "\n${YELLOW}=== Testing Property Upload ===${NC}"

test_file_upload "/upload/property/images" "$test_image" "-F propertyId=1" "Property images upload (no auth expected to fail)"

# 6. Test Database Schema
echo -e "\n${YELLOW}=== Testing Database Schema ===${NC}"

echo "Checking database tables and columns..."

# Check if users table has profile_image column
echo "Checking users table profile_image column..."
mysql -u root -pvishnu@1234 -D smartrentconnect_db -e "
    SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'smartrentconnect_db' 
    AND TABLE_NAME = 'users' 
    AND COLUMN_NAME = 'profile_image';" 2>/dev/null

if [ $? -eq 0 ]; then
    print_result 0 "Users table profile_image column exists"
else
    print_result 1 "Users table profile_image column missing"
fi

# Check if owners table has updated document columns
echo "Checking owners table document columns..."
mysql -u root -pvishnu@1234 -D smartrentconnect_db -e "
    SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'smartrentconnect_db' 
    AND TABLE_NAME = 'owners' 
    AND COLUMN_NAME IN ('aadhar_card_image', 'pan_card_image');" 2>/dev/null

if [ $? -eq 0 ]; then
    print_result 0 "Owners table document columns exist"
else
    print_result 1 "Owners table document columns missing"
fi

# Check if tenants table profile_image column was removed
echo "Checking tenants table profile_image column removal..."
mysql -u root -pvishnu@1234 -D smartrentconnect_db -e "
    SELECT COUNT(*) as column_exists 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'smartrentconnect_db' 
    AND TABLE_NAME = 'tenants' 
    AND COLUMN_NAME = 'profile_image';" 2>/dev/null

if [ $? -eq 0 ]; then
    print_result 0 "Tenants table profile_image column removed"
else
    print_result 1 "Tenants table profile_image column still exists"
fi

# 7. Test Cloudinary Configuration
echo -e "\n${YELLOW}=== Testing Cloudinary Configuration ===${NC}"

echo "Testing Cloudinary connectivity..."
curl -s "https://res.cloudinary.com/dc9tciufe/image/upload/sample.jpg" -o /tmp/cloudinary_test.jpg

if [ -f "/tmp/cloudinary_test.jpg" ] && [ -s "/tmp/cloudinary_test.jpg" ]; then
    print_result 0 "Cloudinary connectivity working"
    rm /tmp/cloudinary_test.jpg
else
    print_result 1 "Cloudinary connectivity failed"
fi

# 8. Test Frontend API Integration
echo -e "\n${YELLOW}=== Testing Frontend API Integration ===${NC}"

echo "Testing frontend API endpoints..."
test_endpoint "GET" "/owner/properties" "" "401" "Owner properties endpoint (no auth)"
test_endpoint "GET" "/tenant/properties" "" "401" "Tenant properties endpoint (no auth)"
test_endpoint "GET" "/admin/properties" "" "401" "Admin properties endpoint (no auth)"

# 9. Test File Size and Type Validation
echo -e "\n${YELLOW}=== Testing File Validation ===${NC}"

# Create test files of different sizes
echo "Creating test files for validation..."

# Small valid image
echo "Small image content" > /tmp/small_image.jpg

# Large file (should fail)
dd if=/dev/zero of=/tmp/large_file.jpg bs=1M count=6 2>/dev/null

# Invalid file type
echo "Invalid file content" > /tmp/invalid_file.txt

echo "Test files created:"
echo "- /tmp/small_image.jpg (valid)"
echo "- /tmp/large_file.jpg (too large)"
echo "- /tmp/invalid_file.txt (invalid type)"

# 10. Summary
echo -e "\n${YELLOW}=== Test Summary ===${NC}"
echo "======================"
echo -e "Total Tests: $((PASSED + FAILED))"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"

if [ $FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All tests passed! Cloudinary migration is working correctly.${NC}"
else
    echo -e "\n${RED}⚠️ Some tests failed. Please check the issues above.${NC}"
fi

# Cleanup
echo -e "\n${YELLOW}Cleaning up test files...${NC}"
rm -f /tmp/test_*.jpg /tmp/test_*.json /tmp/large_file.jpg /tmp/invalid_file.txt /tmp/cloudinary_test.jpg

echo -e "\n${YELLOW}=== Test Complete ===${NC}"
echo "=================="
echo "Check the detailed results above and fix any issues before proceeding."
echo "For authenticated tests, please run the application with valid JWT tokens."
