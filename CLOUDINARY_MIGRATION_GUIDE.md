# Cloudinary Migration Guide

## Overview
This document outlines the complete migration from local file storage to Cloudinary for all file uploads in SmartRentConnect. All user types (Tenant, Owner, Admin, Watchman) now use Cloudinary for storing and accessing files.

## 🎯 Migration Summary

### ✅ What's Been Migrated
- **Profile Images**: All user profile images now stored on Cloudinary
- **Owner Documents**: Aadhar and PAN cards uploaded to Cloudinary
- **Property Images**: All property images stored on Cloudinary
- **Property Documents**: Property-related documents on Cloudinary
- **Tenant Documents**: Tenant-specific documents on Cloudinary

### 🏗️ Architecture Changes

#### Backend Changes
1. **New Controllers**:
   - `UnifiedFileUploadController` - Handles all file uploads to Cloudinary
   - `CloudinaryFileController` - Serves Cloudinary configuration

2. **Updated Entities**:
   - `User` entity now has `profileImage` field (inherited by all user types)
   - `Owner` entity updated to use Cloudinary URLs for documents
   - `Tenant` entity removed duplicate `profileImage` field
   - `PropertyImage` and `PropertyDocument` entities optimized for Cloudinary URLs

3. **Database Schema**:
   - Added `profile_image` column to `users` table
   - Updated column lengths to 500 characters for Cloudinary URLs
   - Added indexes for better performance
   - Created migration script: `migrate_to_cloudinary.sql`

#### Frontend Changes
1. **New API Services**:
   - `fileUploadAPI` - Unified file upload endpoints
   - `cloudinaryAPI` - Cloudinary configuration and helpers
   - Helper functions for URL optimization

2. **New Components**:
   - `CloudinaryImage` - Optimized image display component
   - `CloudinaryFileUpload` - Unified file upload component

3. **Updated API Calls**:
   - All file upload methods now use Cloudinary endpoints
   - Property image uploads use new unified API

## 📁 File Structure After Migration

### Cloudinary Folder Structure
```
smartrentconnect/
├── tenant/{tenantId}/
│   ├── profile-images/
│   └── documents/{documentType}/
├── owner/{ownerId}/
│   ├── profile-images/
│   ├── documents/aadhar/
│   ├── documents/pan/
│   └── property/{propertyId}/
│       ├── images/
│       └── documents/
├── admin/{adminId}/
│   └── profile-images/
└── watchman/{watchmanId}/
    └── profile-images/
```

## 🔧 Implementation Details

### Backend Endpoints

#### Unified File Upload (`/api/upload/*`)
- `POST /api/upload/profile-image` - Upload profile image (all user types)
- `POST /api/upload/owner/document` - Upload owner documents
- `POST /api/upload/property/images` - Upload property images
- `POST /api/upload/property/documents` - Upload property documents
- `POST /api/upload/tenant/document` - Upload tenant documents

#### Cloudinary File Access (`/api/files/*`)
- `GET /api/files/test` - Test Cloudinary controller
- `GET /api/files/validation-info` - Get file validation rules
- `GET /api/files/cloudinary-config` - Get Cloudinary configuration

### Frontend API Methods

#### fileUploadAPI
```typescript
// Profile image upload
fileUploadAPI.uploadProfileImage(file)

// Owner document upload
fileUploadAPI.uploadOwnerDocument(file, 'aadhar' | 'pan')

// Property uploads
fileUploadAPI.uploadPropertyImages(files, propertyId)
fileUploadAPI.uploadPropertyDocuments(files, propertyId)

// Tenant document upload
fileUploadAPI.uploadTenantDocument(file, documentType)
```

#### Helper Functions
```typescript
// Check if URL is Cloudinary URL
isCloudinaryUrl(url)

// Get Cloudinary public ID
getCloudinaryPublicId(url)

// Create optimized URL
createOptimizedCloudinaryUrl(url, { width, height, quality, format })
```

## 🗄️ Database Migration

### Run Migration Script
```sql
-- Run the complete migration script
mysql -u root -p smartrentconnect_db < migrate_to_cloudinary.sql
```

### Key Changes
1. **users table**: Added `profile_image` column
2. **owners table**: Updated document columns to 500 chars, removed duplicate profile_image
3. **tenants table**: Removed duplicate profile_image column
4. **Added indexes** for performance
5. **Created views** for monitoring

### Verification Queries
```sql
-- Check Cloudinary URLs
SELECT * FROM cloudinary_file_urls;

-- Check migration status
SELECT table_name, column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name IN ('users', 'owners', 'tenants', 'property_images', 'property_documents')
AND column_name LIKE '%image%' OR column_name LIKE '%document%';
```

## 🚀 Usage Examples

### Frontend Component Usage

#### Profile Image Upload
```tsx
import CloudinaryFileUpload from '@/components/ui/cloudinary-file-upload';

<CloudinaryFileUpload
  uploadType="profile"
  onUploadSuccess={(url) => setProfileImageUrl(url)}
  accept="image/*"
  maxSize={5}
/>
```

#### Property Images Upload
```tsx
<CloudinaryFileUpload
  uploadType="property-images"
  propertyId={propertyId}
  multiple={true}
  maxFiles={10}
  onUploadSuccess={(url) => handleImageUpload(url)}
  accept="image/*"
/>
```

#### Optimized Image Display
```tsx
import CloudinaryImage from '@/components/ui/cloudinary-image';

<CloudinaryImage
  src={imageUrl}
  alt="Property image"
  width={400}
  height={300}
  quality={80}
  format="webp"
  className="rounded-lg"
/>
```

## 🔒 Security Considerations

1. **File Validation**: Server-side validation for file types and sizes
2. **Cloudinary Security**: Using signed URLs and upload presets
3. **Access Control**: Role-based upload permissions
4. **URL Protection**: Cloudinary URLs are secure and temporary

## 📊 Performance Benefits

1. **CDN Delivery**: Cloudinary's global CDN for faster loading
2. **Image Optimization**: Automatic format conversion and compression
3. **Bandwidth Savings**: WebP format and quality optimization
4. **Scalability**: No local storage limitations
5. **Reliability**: Cloudinary's infrastructure reliability

## 🔄 Backward Compatibility

### Local File Support
- Existing local file URLs will still work during transition
- Admin can still access local files via old endpoints
- Gradual migration possible

### Migration Strategy
1. New uploads go directly to Cloudinary
2. Existing files can be migrated gradually
3. Use `file_migration_log` table to track progress

## 🛠️ Configuration

### Environment Variables
```properties
# Cloudinary Configuration (already configured)
cloudinary.cloud.name=${CLOUDINARY_CLOUD_NAME:dc9tciufe}
cloudinary.api.key=${CLOUDINARY_API_KEY:762387894556319}
cloudinary.api.secret=${CLOUDINARY_API_SECRET:cirt89TvpUw2mAKqf7iRrs1pmw8}
```

### File Upload Limits
```properties
app.max.file.size=5242880  # 5MB
app.allowed.image.types=jpg,jpeg,png,webp
app.allowed.document.types=pdf,jpg,jpeg,png
```

## 🧪 Testing

### Test Endpoints
```bash
# Test Cloudinary controller
curl http://localhost:8080/api/files/test

# Get validation info
curl http://localhost:8080/api/files/validation-info

# Test profile upload (with auth)
curl -X POST -F "file=@test.jpg" http://localhost:8080/api/upload/profile-image
```

### Frontend Testing
1. Test profile image upload for all user types
2. Test property image/document uploads
3. Verify image optimization and display
4. Test error handling and validation

## 📝 Migration Checklist

### Pre-Migration
- [ ] Backup database
- [ ] Test Cloudinary configuration
- [ ] Verify API keys and permissions

### Migration
- [ ] Run database migration script
- [ ] Deploy backend changes
- [ ] Deploy frontend changes
- [ ] Test all upload endpoints

### Post-Migration
- [ ] Verify all file uploads work
- [ ] Test image display optimization
- [ ] Monitor Cloudinary usage
- [ ] Update documentation

## 🆘 Troubleshooting

### Common Issues
1. **Upload Fails**: Check Cloudinary credentials and file size limits
2. **Images Not Displaying**: Verify URL format and CORS settings
3. **Performance Issues**: Check Cloudinary optimization settings
4. **Database Errors**: Verify migration script completion

### Debug Commands
```sql
-- Check Cloudinary URLs in database
SELECT COUNT(*) FROM users WHERE profile_image LIKE 'https://res.cloudinary.com%';

-- Check file migration log
SELECT * FROM file_migration_log WHERE migration_status = 'FAILED';
```

## 📈 Monitoring

### Cloudinary Dashboard
- Monitor upload usage and bandwidth
- Track storage consumption
- Set up alerts for usage limits

### Database Monitoring
- Monitor file_migration_log table
- Track Cloudinary URL adoption rate
- Monitor storage column updates

---

**Migration Complete! 🎉**

All file uploads are now handled by Cloudinary with optimized delivery and storage.
