import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { ownerAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { isCloudinaryUrl } from '@/lib/api';
import { 
  User,
  Upload,
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  Shield,
  CheckCircle,
  AlertTriangle,
  Camera,
  Save
} from 'lucide-react';

interface OwnerProfileData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  dateOfBirth: string;
  profileImage?: File | string;
  documents: {
    aadhar?: File | string;
    pan?: File | string;
  };
  isProfileComplete: boolean;
  isVerified: boolean;
  verificationStatus?: string;
  rejectionReason?: string;
}

export const OwnerProfile: React.FC = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<OwnerProfileData>({
    fullName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    dateOfBirth: '',
    documents: {},
    isProfileComplete: false,
    isVerified: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileImagePreview, setProfileImagePreview] = useState<string>('');
  const [documentPreviews, setDocumentPreviews] = useState<{
    aadhar?: string;
    pan?: string;
  }>({});
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentDoc, setCurrentDoc] = useState<{url: string; type: 'image' | 'pdf'} | null>(null);

  // Helper function to get correct image URL (local or Cloudinary)
  const getImageUrl = (url: string | undefined): string => {
    if (!url) return '';
    
    // If it's already a full URL (Cloudinary), return as is
    if (url.startsWith('http')) {
      return url;
    }
    
    // If it's a relative path (local file), construct full URL
    if (url.startsWith('/uploads')) {
      return `http://localhost:8080${url}`;
    }
    
    // If it's just a filename or relative path, assume it's local
    return `http://localhost:8080/uploads/${url}`;
  };

  // Helper function to check if file is PDF
  const isPdfFile = (url: string): boolean => {
    return url.toLowerCase().endsWith('.pdf');
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      // Load profile data from backend
      const response = await ownerAPI.getProfile();
      const profileData = response.data;
      
      // Get stored URLs from localStorage
      const storedUrls = JSON.parse(localStorage.getItem('ownerFileUrls') || '{}');
      
      const loadedProfile = {
        fullName: profileData.fullName || '',
        email: profileData.email || user?.email || '',
        phone: profileData.phoneNumber || '',
        address: profileData.address || '',
        city: profileData.city || '',
        state: profileData.state || '',
        pincode: profileData.pincode || '',
        dateOfBirth: profileData.dateOfBirth || '',
        profileImage: profileData.profileImage || storedUrls.profileImageUrl || '',
        documents: {
          aadhar: profileData.aadharCardImage || storedUrls.aadharCardUrl || '',
          pan: profileData.panCardImage || storedUrls.panCardUrl || ''
        },
        isProfileComplete: profileData.isProfileComplete || false,
        isVerified: profileData.isVerified || false,
        verificationStatus: profileData.verificationStatus || 'PENDING',
        rejectionReason: profileData.rejectionReason || undefined
      };
      
      console.log('Profile loaded successfully with file URLs');
      
      setProfileData(loadedProfile);
      
      // Set image previews if URLs exist
      if (loadedProfile.profileImage && typeof loadedProfile.profileImage === 'string') {
        setProfileImagePreview(getImageUrl(loadedProfile.profileImage));
      }
      if (loadedProfile.documents.aadhar && typeof loadedProfile.documents.aadhar === 'string') {
        setDocumentPreviews(prev => ({ ...prev, aadhar: getImageUrl(loadedProfile.documents.aadhar as string) }));
      }
      if (loadedProfile.documents.pan && typeof loadedProfile.documents.pan === 'string') {
        setDocumentPreviews(prev => ({ ...prev, pan: getImageUrl(loadedProfile.documents.pan as string) }));
      }
      
      setLoading(false);
    } catch (error: any) {
      console.error('Failed to load profile:', error);
      
      // If it's a 400 error, it might be normal for new users
      if (error.response?.status === 400) {
        console.log('Profile not found - initializing empty profile for new user');
        setProfileData(prev => ({
          ...prev,
          email: user?.email || ''
        }));
      } else {
        toast.error('Failed to load profile');
      }
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof OwnerProfileData, value: any) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Profile image must be less than 5MB');
        return;
      }
      setProfileData(prev => ({ ...prev, profileImage: file }));
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  const handleViewDocument = (url: string) => {
    const isPdf = url.toLowerCase().endsWith('.pdf');
    setCurrentDoc({
      url,
      type: isPdf ? 'pdf' : 'image'
    });
    setViewerOpen(true);
  };

  const handleDocumentUpload = (type: 'aadhar' | 'pan', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('Document must be less than 10MB');
        return;
      }
      setProfileData(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          [type]: file
        }
      }));
      setDocumentPreviews(prev => ({
        ...prev,
        [type]: URL.createObjectURL(file)
      }));
    }
  };

  const removeDocument = (type: 'aadhar' | 'pan') => {
    setProfileData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [type]: undefined
      }
    }));
    setDocumentPreviews(prev => ({
      ...prev,
      [type]: undefined
    }));
  };

  const validateProfile = (): boolean => {
    const requiredFields = [
      'fullName', 'phone', 'address', 'city', 'state', 'pincode', 'dateOfBirth'
    ];
    
    for (const field of requiredFields) {
      if (!profileData[field as keyof OwnerProfileData]) {
        toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }

    if (!profileData.documents.aadhar) {
      toast.error('Please upload Aadhar card');
      return false;
    }

    if (!profileData.documents.pan) {
      toast.error('Please upload PAN card');
      return false;
    }

    return true;
  };

  const handleSaveProfile = async () => {
    if (!validateProfile()) return;

    try {
      setSaving(true);
      
      console.log('Starting profile save process...');
      
      // STEP 1: Upload files first and get URLs
      let profileImageUrl = typeof profileData.profileImage === 'string' ? profileData.profileImage : '';
      let aadharCardUrl = typeof profileData.documents.aadhar === 'string' ? profileData.documents.aadhar : '';
      let panCardUrl = typeof profileData.documents.pan === 'string' ? profileData.documents.pan : '';
      
      // Get existing URLs from localStorage if available
      const storedUrls = JSON.parse(localStorage.getItem('ownerFileUrls') || '{}');
      if (!profileImageUrl && storedUrls.profileImageUrl) {
        profileImageUrl = storedUrls.profileImageUrl;
      }
      if (!aadharCardUrl && storedUrls.aadharCardUrl) {
        aadharCardUrl = storedUrls.aadharCardUrl;
      }
      if (!panCardUrl && storedUrls.panCardUrl) {
        panCardUrl = storedUrls.panCardUrl;
      }
      
      try {
        // Upload profile image if it's a new file (File object)
        if (profileData.profileImage instanceof File) {
          console.log('Uploading profile image...');
          const profileImageResponse = await ownerAPI.uploadProfileImage(profileData.profileImage);
          profileImageUrl = profileImageResponse.data.imageUrl || profileImageResponse.data.filePath;
          console.log('Profile image uploaded:', profileImageUrl);
          
          // Store URL in localStorage
          const updatedUrls = { ...storedUrls, profileImageUrl };
          localStorage.setItem('ownerFileUrls', JSON.stringify(updatedUrls));
        }

        // Upload Aadhar card if it's a new file
        if (profileData.documents.aadhar instanceof File) {
          console.log('Uploading Aadhar card...');
          const aadharResponse = await ownerAPI.uploadDocument(profileData.documents.aadhar, 'aadhar');
          aadharCardUrl = aadharResponse.data.documentUrl || aadharResponse.data.filePath;
          console.log('Aadhar card uploaded:', aadharCardUrl);
          
          // Store URL in localStorage
          const updatedUrls = JSON.parse(localStorage.getItem('ownerFileUrls') || '{}');
          updatedUrls.aadharCardUrl = aadharCardUrl;
          localStorage.setItem('ownerFileUrls', JSON.stringify(updatedUrls));
        }

        // Upload PAN card if it's a new file
        if (profileData.documents.pan instanceof File) {
          console.log('Uploading PAN card...');
          const panResponse = await ownerAPI.uploadDocument(profileData.documents.pan, 'pan');
          panCardUrl = panResponse.data.documentUrl || panResponse.data.filePath;
          console.log('PAN card uploaded:', panCardUrl);
          
          // Store URL in localStorage
          const updatedUrls = JSON.parse(localStorage.getItem('ownerFileUrls') || '{}');
          updatedUrls.panCardUrl = panCardUrl;
          localStorage.setItem('ownerFileUrls', JSON.stringify(updatedUrls));
        }
      } catch (uploadError: any) {
        console.error('File upload failed:', uploadError);
        let errorMessage = 'Failed to upload files. Please try again.';
        
        if (uploadError.response?.data?.error) {
          errorMessage = uploadError.response.data.error;
        } else if (uploadError.response?.data?.message) {
          errorMessage = uploadError.response.data.message;
        } else if (uploadError.message) {
          errorMessage = uploadError.message;
        }
        
        toast.error(errorMessage);
        setSaving(false);
        return;
      }
      
      // STEP 2: Prepare profile data with file URLs
      const profileUpdateData = {
        fullName: profileData.fullName,
        phone: profileData.phone,
        address: profileData.address,
        city: profileData.city,
        state: profileData.state,
        pincode: profileData.pincode,
        dateOfBirth: profileData.dateOfBirth,
        profileImageUrl: profileImageUrl || '',
        aadharCardUrl: aadharCardUrl || '',
        panCardUrl: panCardUrl || ''
      };

      console.log('Profile data to save:', profileUpdateData);

      // STEP 3: Update profile with URLs using FormData
      const formData = new FormData();
      Object.entries(profileUpdateData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value.toString());
        }
      });

      // Debug: Log FormData contents
      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(key, ':', value);
      }

      // STEP 4: Save profile with URLs
      console.log('Saving profile with URLs...');
      const response = await ownerAPI.updateProfileWithUrls(formData);
      console.log('Profile saved successfully:', response.data);
      
      // Update local state
      setProfileData(prev => ({ 
        ...prev, 
        isProfileComplete: true,
        verificationStatus: 'PENDING', // Reset to pending when resubmitting
        rejectionReason: undefined, // Clear rejection reason
        profileImage: profileImageUrl,
        documents: {
          aadhar: aadharCardUrl,
          pan: panCardUrl
        }
      }));
      
      // Clear localStorage URLs after successful profile save since they're now in database
      localStorage.removeItem('ownerFileUrls');
      console.log('Cleared localStorage file URLs after successful profile save');
      
      toast.success('Profile updated successfully! Your profile is now under admin review.');
      
    } catch (error: any) {
      console.error('Failed to save profile:', error);
      let errorMessage = 'Failed to save profile. Please try again.';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const getProfileCompletionStatus = () => {
    const requiredFields = [
      profileData.fullName,
      profileData.phone,
      profileData.address,
      profileData.city,
      profileData.state,
      profileData.pincode,
      profileData.dateOfBirth,
      profileData.documents.aadhar,
      profileData.documents.pan
    ];
    
    const completedFields = requiredFields.filter(field => field).length;
    const totalFields = requiredFields.length;
    
    return {
      completed: completedFields,
      total: totalFields,
      percentage: Math.round((completedFields / totalFields) * 100)
    };
  };

  const completionStatus = getProfileCompletionStatus();

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Profile Management</h1>
        <p className="text-muted-foreground">
          Complete your profile to start listing properties
        </p>
      </div>

      {/* Profile Status Alert */}
      {!profileData.isProfileComplete && (
        <Alert className="mb-6 border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Profile Incomplete:</strong> Please complete your profile and upload required documents to start adding properties.
            Progress: {completionStatus.completed}/{completionStatus.total} fields completed ({completionStatus.percentage}%)
          </AlertDescription>
        </Alert>
      )}

      {profileData.isProfileComplete && !profileData.isVerified && profileData.verificationStatus !== 'REJECTED' && (
        <Alert className="mb-6 border-yellow-200 bg-yellow-50">
          <Shield className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Verification Pending:</strong> Your profile is complete and under admin review. You'll be able to add properties once verified.
          </AlertDescription>
        </Alert>
      )}

      {profileData.isProfileComplete && profileData.isVerified && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Profile Verified:</strong> Your profile is complete and verified. You can now add properties!
          </AlertDescription>
        </Alert>
      )}

      {profileData.verificationStatus === 'REJECTED' && profileData.rejectionReason && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div>
              <strong>Verification Rejected:</strong> Your profile verification was rejected by the admin.
              <div className="mt-2 p-3 bg-red-100 border border-red-200 rounded-md">
                <p className="text-sm font-medium text-red-800">Reason for rejection:</p>
                <p className="text-sm text-red-700 mt-1">{profileData.rejectionReason}</p>
              </div>
              <p className="text-sm mt-2">
                Please update your profile and documents according to the feedback above and resubmit for verification.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {/* Profile Image Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Camera className="w-5 h-5 mr-2" />
              Profile Picture
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-6">
              <div className="relative">
                <img
                  src={profileImagePreview || `https://ui-avatars.com/api/?name=${profileData.fullName}&size=120`}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageUpload}
                  className="hidden"
                  id="profile-image-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('profile-image-upload')?.click()}
                  className="absolute bottom-0 right-0 rounded-full p-2"
                >
                  <Upload className="w-4 h-4" />
                </Button>
              </div>
              <div>
                <h3 className="text-lg font-semibold">{profileData.fullName || 'Your Name'}</h3>
                <p className="text-sm text-muted-foreground">Upload a professional profile picture</p>
                <p className="text-xs text-muted-foreground mt-1">Max size: 5MB • JPG, PNG formats</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={profileData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+91 9876543210"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={profileData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Address Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Street Address *</Label>
              <Textarea
                id="address"
                value={profileData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter your complete address"
                rows={3}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={profileData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="e.g., Bangalore"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={profileData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="e.g., Karnataka"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode *</Label>
                <Input
                  id="pincode"
                  value={profileData.pincode}
                  onChange={(e) => handleInputChange('pincode', e.target.value)}
                  placeholder="e.g., 560001"
                  maxLength={6}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Identity Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Identity Documents *
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Aadhar Card */}
              <div className="space-y-3">
                <Label>Aadhar Card *</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  {documentPreviews.aadhar ? (
                    <div className="space-y-3">
                      {isPdfFile(documentPreviews.aadhar) ? (
                        <div className="flex items-center justify-center w-full h-32 bg-gray-100 rounded border">
                          <div className="text-center">
                            <FileText className="w-8 h-8 mx-auto mb-2 text-red-500" />
                            <p className="text-sm text-gray-600">PDF Document</p>
                          </div>
                        </div>
                      ) : (
                        <img
                          src={documentPreviews.aadhar}
                          alt="Aadhar Card"
                          className="w-full h-32 object-cover rounded"
                        />
                      )}
                      <div className="flex space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDocument(documentPreviews.aadhar)}
                          className="flex-1"
                        >
                          View Full
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeDocument('aadhar')}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600 mb-2">Upload Aadhar Card</p>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleDocumentUpload('aadhar', e)}
                        className="hidden"
                        id="aadhar-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('aadhar-upload')?.click()}
                      >
                        Choose File
                      </Button>
                      <p className="text-xs text-gray-500 mt-1">Max 10MB • JPG, PNG, PDF</p>
                    </div>
                  )}
                </div>
              </div>

              {/* PAN Card */}
              <div className="space-y-3">
                <Label>PAN Card *</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  {documentPreviews.pan ? (
                    <div className="space-y-3">
                      {isPdfFile(documentPreviews.pan) ? (
                        <div className="flex items-center justify-center w-full h-32 bg-gray-100 rounded border">
                          <div className="text-center">
                            <FileText className="w-8 h-8 mx-auto mb-2 text-red-500" />
                            <p className="text-sm text-gray-600">PDF Document</p>
                          </div>
                        </div>
                      ) : (
                        <img
                          src={documentPreviews.pan}
                          alt="PAN Card"
                          className="w-full h-32 object-cover rounded"
                        />
                      )}
                      <div className="flex space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDocument(documentPreviews.pan)}
                          className="flex-1"
                        >
                          View Full
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeDocument('pan')}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600 mb-2">Upload PAN Card</p>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleDocumentUpload('pan', e)}
                        className="hidden"
                        id="pan-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('pan-upload')?.click()}
                      >
                        Choose File
                      </Button>
                      <p className="text-xs text-gray-500 mt-1">Max 10MB • JPG, PNG, PDF</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verification Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Verification Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium">Account Verification</h4>
                <p className="text-sm text-gray-600">
                  {profileData.isVerified 
                    ? 'Your account is verified and you can list properties'
                    : profileData.isProfileComplete
                    ? 'Your profile is under admin review'
                    : 'Complete your profile to start the verification process'
                  }
                </p>
              </div>
              <Badge 
                variant={profileData.isVerified ? "default" : "secondary"}
                className={`${profileData.isVerified 
                  ? "bg-green-100 text-green-800" 
                  : profileData.isProfileComplete
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-800"
                } text-lg px-4 py-2`}
              >
                {profileData.isVerified ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Verified
                  </>
                ) : profileData.isProfileComplete ? (
                  <>
                    <Shield className="w-4 h-4 mr-1" />
                    Under Review
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    Incomplete
                  </>
                )}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            onClick={handleSaveProfile}
            disabled={saving}
            className="px-8"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Profile
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Document Viewer Modal */}
      <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Document Viewer</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {currentDoc?.type === 'pdf' ? (
              <iframe 
                src={currentDoc.url} 
                className="w-full h-[70vh] border rounded"
                title="Document Viewer"
              />
            ) : (
              <img 
                src={currentDoc?.url} 
                alt="Document Preview" 
                className="w-full h-auto max-h-[70vh] object-contain mx-auto"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
