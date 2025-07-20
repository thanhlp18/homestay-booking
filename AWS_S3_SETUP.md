# AWS S3 Image Upload Configuration

This guide explains how to set up AWS S3 for image uploads in the TidyToto admin system.

## Prerequisites

1. AWS Account with S3 access
2. S3 bucket created for storing images
3. IAM user with appropriate S3 permissions

## Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID="your-aws-access-key-id"
AWS_SECRET_ACCESS_KEY="your-aws-secret-access-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="your-s3-bucket-name"
```

## AWS Setup Steps

### 1. Create S3 Bucket

1. Go to AWS S3 Console
2. Click "Create bucket"
3. Choose a unique bucket name (e.g., `tidytoto-images`)
4. Select your preferred region
5. **Important**: Uncheck "Block all public access" for public image access
   - **Note**: You can keep "Block public access to buckets and objects granted through new access control lists (ACLs)" checked - we'll use bucket policies instead of ACLs
6. Enable versioning (recommended)
7. Create the bucket

### 2. Configure Bucket Policy

Add this bucket policy to allow public read access to images:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        }
    ]
}
```

### 3. Create IAM User

1. Go to AWS IAM Console
2. Click "Users" → "Add user"
3. Enter username (e.g., `tidytoto-s3-user`)
4. Select "Programmatic access"
5. Click "Next: Permissions"

### 4. Set IAM Permissions

Create a custom policy with these permissions:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:PutObjectAcl",
                "s3:GetObject",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket"
            ],
            "Resource": "arn:aws:s3:::your-bucket-name"
        }
    ]
}
```

### 5. Get Access Keys

1. After creating the user, save the Access Key ID and Secret Access Key
2. Add these to your environment variables

## Folder Structure

Images are automatically organized by type:
- Branch images: `branches/`
- Room images: `rooms/`
- General uploads: `uploads/`

## Features

- ✅ Automatic file validation (image types only)
- ✅ File size limits (5MB max)
- ✅ Unique filename generation
- ✅ Progress tracking
- ✅ Error handling
- ✅ Mobile responsive upload interface
- ✅ Multiple file uploads
- ✅ Image preview

## API Endpoints

### Single File Upload
```
POST /api/admin/upload
Content-Type: multipart/form-data

Body:
- file: File
- folder: string (optional, defaults to "uploads")
```

### Multiple File Upload
```
PUT /api/admin/upload
Content-Type: multipart/form-data

Body:
- files: File[]
- folder: string (optional, defaults to "uploads")
```

## Usage in Admin Forms

### For uploading images:
```jsx
<S3ImageUpload
  value={imageUrls}
  onChange={setImageUrls}
  maxCount={8}
  folder="branches" // or "rooms"
/>
```

### For displaying images:
```jsx
import ImageDisplay, { ImageGallery } from './components/ImageDisplay';

// Single image
<ImageDisplay 
  src="https://your-bucket.s3.amazonaws.com/branches/image.jpg"
  width={100}
  height={100}
  alt="Branch image"
/>

// Image gallery
<ImageGallery 
  images={branch.images}
  size="medium"
  maxDisplay={4}
/>
```

## Installation

The required packages have been added to `package.json`:

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner uuid
npm install --save-dev @types/uuid
```

## Troubleshooting

### Common Issues

1. **Upload fails with 403 Forbidden**
   - Check IAM permissions
   - Verify bucket policy allows PutObject

1. **"AccessControlListNotSupported" error**
   - This occurs when ACLs are disabled on your bucket
   - The code has been updated to not use ACLs - ensure you're using the latest version
   - Use bucket policies for public access instead of ACLs

2. **Images not loading in UI**
   - **Step 1**: Test direct access - copy an image URL and open in browser
   - **Step 2**: If direct access fails, check bucket public access settings:
     - Uncheck "Block all public access" 
     - Keep ACL-related blocks checked
   - **Step 3**: Verify bucket policy allows GetObject (see setup instructions above)
   - **Step 4**: If direct access works but UI doesn't show images, check for CORS issues

3. **CORS errors**
   - Add CORS configuration to your S3 bucket:
   ```json
   [
       {
           "AllowedHeaders": ["*"],
           "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
           "AllowedOrigins": ["*"],
           "ExposeHeaders": []
       }
   ]
   ```

### Testing

1. Go to Admin → Branches or Rooms
2. Click "Add" or "Edit" 
3. Try uploading an image
4. Check that the image appears in your S3 bucket
5. Verify the image URL is saved to the database
6. **Test public access**: Copy an image URL and open it directly in a browser
7. **Check UI display**: Verify images show properly in the admin interface

## Security Notes

- Images are made publicly accessible through bucket policies (not ACLs)
- Only admin users can upload images (authentication required)
- File type validation prevents non-image uploads
- File size limits prevent abuse
- Unique filenames prevent conflicts
- ACLs are disabled for enhanced security 