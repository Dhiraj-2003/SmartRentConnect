import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ownerAPI } from '../../lib/api';
import { 
  Upload, 
  X, 
  MapPin, 
  Home, 
  DollarSign,
  Users,
  Bed,
  Bath,
  Square,
  Wifi,
  Car,
  Utensils,
  Tv,
  Wind,
  Shield,
  Zap,
  Waves,
  Dumbbell,
  WashingMachine,
  Refrigerator,
  Sofa,
  TreePine,
  IndianRupee
} from 'lucide-react';

interface PropertyFormData {
  title: string;
  description: string;
  propertyType: 'flat' | 'pg';
  location: string;
  city: string;
  state: string;
  pincode: string;
  rent: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  // PG specific fields
  sharingTypes: {
    single: number;
    double: number;
    triple: number;
  };
  amenities: string[];
  images: File[];
}

interface PropertyFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const AMENITY_OPTIONS = [
  { id: 'wifi', label: 'Wi-Fi', icon: Wifi },
  { id: 'parking', label: 'Parking', icon: Car },
  { id: 'kitchen', label: 'Kitchen', icon: Utensils },
  { id: 'tv', label: 'TV/Cable', icon: Tv },
  { id: 'ac', label: 'Air Conditioning', icon: Wind },
  { id: 'security', label: '24/7 Security', icon: Shield },
  { id: 'power_backup', label: 'Power Backup', icon: Zap },
  { id: 'washing_machine', label: 'Washing Machine', icon: WashingMachine },
  { id: 'refrigerator', label: 'Refrigerator', icon: Refrigerator },
  { id: 'furnished', label: 'Furnished', icon: Sofa },
  { id: 'gym', label: 'Gym/Fitness', icon: Dumbbell },
  { id: 'swimming_pool', label: 'Swimming Pool', icon: Waves },
  { id: 'garden', label: 'Garden/Park', icon: TreePine },
];

export const PropertyForm: React.FC<PropertyFormProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    description: '',
    propertyType: 'flat',
    location: '',
    city: '',
    state: '',
    pincode: '',
    rent: 0,
    bedrooms: 1,
    bathrooms: 1,
    area: 0,
    sharingTypes: {
      single: 0,
      double: 0,
      triple: 0
    },
    amenities: [],
    images: []
  });
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string[]>([]);

  const handleInputChange = (field: keyof PropertyFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAmenityToggle = (amenityId: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(id => id !== amenityId)
        : [...prev.amenities, amenityId]
    }));
  };

  const handleSharingTypeChange = (type: 'single' | 'double' | 'triple', value: number) => {
    setFormData(prev => ({
      ...prev,
      sharingTypes: {
        ...prev.sharingTypes,
        [type]: value
      }
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + formData.images.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    const newImages = [...formData.images, ...files];
    setFormData(prev => ({ ...prev, images: newImages }));

    // Create preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreview(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = imagePreview.filter((_, i) => i !== index);
    
    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(imagePreview[index]);
    
    setFormData(prev => ({ ...prev, images: newImages }));
    setImagePreview(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.location || !formData.city || !formData.state || !formData.pincode) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate based on property type
    if (formData.propertyType === 'flat' && !formData.rent) {
      toast.error('Please enter the rent amount');
      return;
    }

    if (formData.propertyType === 'pg') {
      const hasAtLeastOneSharing = formData.sharingTypes.single > 0 || 
                                    formData.sharingTypes.double > 0 || 
                                    formData.sharingTypes.triple > 0;
      if (!hasAtLeastOneSharing) {
        toast.error('Please enter rent for at least one sharing type');
        return;
      }
    }

    if (formData.images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    try {
      setLoading(true);
      
      // Prepare property data for the new API
      const propertyData: any = {
        title: formData.title,
        description: formData.description,
        propertyType: formData.propertyType,
        location: formData.location,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        bathrooms: formData.bathrooms.toString(),
        area: formData.area.toString(),
        amenities: formData.amenities.join(','),
        images: formData.images
      };

      if (formData.propertyType === 'flat') {
        propertyData.rent = formData.rent.toString();
        propertyData.bedrooms = formData.bedrooms.toString();
      } else {
        propertyData.sharingTypes = JSON.stringify(formData.sharingTypes);
        propertyData.rent = Math.max(formData.sharingTypes.single, formData.sharingTypes.double, formData.sharingTypes.triple).toString();
      }

      console.log('Submitting property data:', propertyData);
      const response = await ownerAPI.createPropertyWithImages(propertyData);
      
      console.log('Property creation response:', response.data);
      toast.success('Property submitted for admin approval! Images are being processed.');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        propertyType: 'flat',
        location: '',
        city: '',
        state: '',
        pincode: '',
        rent: 0,
        bedrooms: 1,
        bathrooms: 1,
        area: 0,
        sharingTypes: {
          single: 0,
          double: 0,
          triple: 0
        },
        amenities: [],
        images: []
      });
      setImagePreview([]);
      
      if (onSuccess) onSuccess();
      
    } catch (error: any) {
      console.error('Error creating property:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to create property. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Home className="w-5 h-5 mr-2" />
          Add New Property
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Submit your property for admin approval. Once approved, it will be visible to tenants.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Property Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Luxury 2BHK Apartment"
                required
              />
            </div>

            {/* Property Type Selection */}
            <div className="space-y-3">
              <Label>Property Type *</Label>
              <div className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="flat"
                    name="propertyType"
                    value="flat"
                    checked={formData.propertyType === 'flat'}
                    onChange={(e) => handleInputChange('propertyType', e.target.value)}
                    className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                  />
                  <Label htmlFor="flat" className="font-normal cursor-pointer">
                    Flat/Apartment
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="pg"
                    name="propertyType"
                    value="pg"
                    checked={formData.propertyType === 'pg'}
                    onChange={(e) => handleInputChange('propertyType', e.target.value)}
                    className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                  />
                  <Label htmlFor="pg" className="font-normal cursor-pointer">
                    PG (Paying Guest)
                  </Label>
                </div>
              </div>
            </div>
            
            {/* Address Fields */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Street Address *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="e.g., 123 Main Street, Area"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="e.g., Bangalore"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder="e.g., Karnataka"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode *</Label>
                  <Input
                    id="pincode"
                    value={formData.pincode}
                    onChange={(e) => handleInputChange('pincode', e.target.value)}
                    placeholder="e.g., 560001"
                    maxLength={6}
                    pattern="[0-9]{6}"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your property, nearby amenities, and what makes it special..."
              rows={4}
            />
          </div>

          {/* Property Details - Conditional based on type */}
          {formData.propertyType === 'flat' ? (
            // Flat Details
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rent">Monthly Rent (₹) *</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="rent"
                    type="number"
                    value={formData.rent || ''}
                    onChange={(e) => handleInputChange('rent', parseInt(e.target.value) || 0)}
                    placeholder="25000"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bedrooms">Bedrooms *</Label>
                <div className="relative">
                  <Bed className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="bedrooms"
                    type="number"
                    min="1"
                    value={formData.bedrooms}
                    onChange={(e) => handleInputChange('bedrooms', parseInt(e.target.value) || 1)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <div className="relative">
                  <Bath className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="bathrooms"
                    type="number"
                    min="1"
                    value={formData.bathrooms}
                    onChange={(e) => handleInputChange('bathrooms', parseInt(e.target.value) || 1)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="area">Area (sq ft)</Label>
                <div className="relative">
                  <Square className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="area"
                    type="number"
                    value={formData.area || ''}
                    onChange={(e) => handleInputChange('area', parseInt(e.target.value) || 0)}
                    placeholder="1200"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          ) : (
            // PG Details
            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold mb-3 block">Sharing Options & Rent (₹/month) *</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="single">Single Sharing</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="single"
                        type="number"
                        value={formData.sharingTypes.single || ''}
                        onChange={(e) => handleSharingTypeChange('single', parseInt(e.target.value) || 0)}
                        placeholder="15000"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="double">Double Sharing</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="double"
                        type="number"
                        value={formData.sharingTypes.double || ''}
                        onChange={(e) => handleSharingTypeChange('double', parseInt(e.target.value) || 0)}
                        placeholder="10000"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="triple">Triple Sharing</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="triple"
                        type="number"
                        value={formData.sharingTypes.triple || ''}
                        onChange={(e) => handleSharingTypeChange('triple', parseInt(e.target.value) || 0)}
                        placeholder="8000"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Enter rent for available sharing types. Leave blank if not available.
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <div className="relative">
                    <Bath className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="bathrooms"
                      type="number"
                      min="1"
                      value={formData.bathrooms}
                      onChange={(e) => handleInputChange('bathrooms', parseInt(e.target.value) || 1)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="area">Area (sq ft)</Label>
                  <div className="relative">
                    <Square className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="area"
                      type="number"
                      value={formData.area || ''}
                      onChange={(e) => handleInputChange('area', parseInt(e.target.value) || 0)}
                      placeholder="1200"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Amenities */}
          <div className="space-y-3">
            <Label>Amenities</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {AMENITY_OPTIONS.map((amenity) => {
                const Icon = amenity.icon;
                const isSelected = formData.amenities.includes(amenity.id);
                return (
                  <div
                    key={amenity.id}
                    onClick={() => handleAmenityToggle(amenity.id)}
                    className={`
                      flex items-center p-3 rounded-lg border cursor-pointer transition-colors
                      ${isSelected 
                        ? 'border-primary bg-primary/10 text-primary' 
                        : 'border-border hover:border-primary/50'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    <span className="text-sm">{amenity.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-3">
            <Label>Property Images * (Max 5)</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6">
              <div className="text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Click to upload or drag and drop images
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('image-upload')?.click()}
                  disabled={formData.images.length >= 5}
                >
                  Choose Images
                </Button>
              </div>
            </div>
            
            {/* Image Preview */}
            {imagePreview.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {imagePreview.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit for Approval'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
