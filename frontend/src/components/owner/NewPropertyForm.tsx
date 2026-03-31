import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  IndianRupee,
  FileText,
  Download
} from 'lucide-react';

interface PropertyFormData {
  title: string;
  propertyType: 'FLAT' | 'PG';
  description: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  deposit: number;
  amenities: string[];
  images: File[];
  documents: PropertyDocumentData[];
  
  // Flat specific fields
  bhkType: string;
  rentPerMonth: number;
  totalRooms: number;
  bathrooms: number;
  furnishingType: string;
  flatNumber: string;
  
  // PG specific fields
  genderAllowed: string;
  foodIncluded: boolean;
  floorConfigs: FloorConfigData[];
}

interface PGRoomData {
  roomNumber: string;
  sharingType: 'SINGLE' | 'DOUBLE' | 'TRIPLE';
  bathrooms: number;
  pricePerBed: number;
}

interface FloorConfigData {
  floorNumber: number;
  startingRoomNumber: string;
  totalRooms: number;
  sharingType: 'SINGLE' | 'DOUBLE' | 'TRIPLE';
  bathrooms: number;
  pricePerBed: number;
}

interface PropertyDocumentData {
  file: File;
  documentType: string;
  documentName: string;
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

const DOCUMENT_TYPES = [
  { value: 'OWNERSHIP_PROOF', label: 'Ownership Proof' },
  { value: 'TAX_RECEIPT', label: 'Tax Receipt' },
  { value: 'NOC', label: 'NOC (No Objection Certificate)' },
  { value: 'BUILDING_PLAN', label: 'Building Plan' },
  { value: 'FIRE_SAFETY', label: 'Fire Safety Certificate' },
  { value: 'ELECTRICITY_BILL', label: 'Electricity Bill' },
  { value: 'WATER_BILL', label: 'Water Bill' },
  { value: 'SOCIETY_NOC', label: 'Society NOC' },
  { value: 'RENTAL_AGREEMENT', label: 'Rental Agreement' },
  { value: 'OTHER', label: 'Other' },
];

export const NewPropertyForm: React.FC<PropertyFormProps> = ({ onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    propertyType: 'FLAT',
    description: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    deposit: 0,
    amenities: [],
    images: [],
    documents: [],
    
    // Flat specific
    bhkType: '',
    rentPerMonth: 0,
    totalRooms: 0,
    bathrooms: 0,
    furnishingType: '',
    flatNumber: '',
    
    // PG specific
    genderAllowed: '',
    foodIncluded: false,
    floorConfigs: []
  });

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + formData.images.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    const newImages = [...formData.images, ...files];
    const newPreviews = [...imagePreview, ...files.map(file => URL.createObjectURL(file))];
    
    setFormData(prev => ({ ...prev, images: newImages }));
    setImagePreview(newPreviews);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreview[index]);
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = imagePreview.filter((_, i) => i !== index);
    
    setFormData(prev => ({ ...prev, images: newImages }));
    setImagePreview(newPreviews);
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Document size should be less than 10MB');
      return;
    }

    // Check file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only PDF, JPG, and PNG files are allowed');
      return;
    }

    const newDocument: PropertyDocumentData = {
      file: file,
      documentType: 'OTHER',
      documentName: file.name
    };

    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, newDocument]
    }));

    // Reset file input
    e.target.value = '';
  };

  const removeDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const updateDocumentType = (index: number, documentType: string) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.map((doc, i) => 
        i === index ? { ...doc, documentType } : doc
      )
    }));
  };

  const addFloorConfig = () => {
    const newFloorConfig: FloorConfigData = {
      floorNumber: formData.floorConfigs.length + 1,
      startingRoomNumber: `${formData.floorConfigs.length + 1}01`,
      totalRooms: 5,
      sharingType: 'DOUBLE',
      bathrooms: 1,
      pricePerBed: 5000
    };
    setFormData(prev => ({
      ...prev,
      floorConfigs: [...prev.floorConfigs, newFloorConfig]
    }));
  };

  const removeFloorConfig = (index: number) => {
    setFormData(prev => ({
      ...prev,
      floorConfigs: prev.floorConfigs.filter((_, i) => i !== index)
    }));
  };

  const updateFloorConfig = (index: number, field: keyof FloorConfigData, value: any) => {
    setFormData(prev => ({
      ...prev,
      floorConfigs: prev.floorConfigs.map((config, i) => 
        i === index ? { ...config, [field]: value } : config
      )
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error('Property title is required');
      return false;
    }
    if (!formData.description.trim()) {
      toast.error('Description is required');
      return false;
    }
    if (!formData.address.trim()) {
      toast.error('Address is required');
      return false;
    }
    if (!formData.city.trim()) {
      toast.error('City is required');
      return false;
    }
    if (!formData.state.trim()) {
      toast.error('State is required');
      return false;
    }
    if (!formData.pincode.trim()) {
      toast.error('Pincode is required');
      return false;
    }
    if (formData.images.length === 0) {
      toast.error('At least one image is required');
      return false;
    }
    
    if (formData.documents.length === 0) {
      toast.error('At least one verification document is required');
      return false;
    }
    
    // Validate that all documents have a document type
    for (const document of formData.documents) {
      if (!document.documentType || document.documentType === '') {
        toast.error('Please select a document type for all uploaded documents');
        return false;
      }
    }

    if (formData.propertyType === 'FLAT') {
      if (!formData.bhkType) {
        toast.error('BHK type is required');
        return false;
      }
      if (formData.rentPerMonth <= 0) {
        toast.error('Rent per month must be greater than 0');
        return false;
      }
      if (formData.totalRooms <= 0) {
        toast.error('Total rooms must be greater than 0');
        return false;
      }
      if (formData.bathrooms <= 0) {
        toast.error('Bathrooms must be greater than 0');
        return false;
      }
      if (!formData.furnishingType) {
        toast.error('Furnishing type is required');
        return false;
      }
      if (!formData.flatNumber.trim()) {
        toast.error('Flat number is required');
        return false;
      }
    } else {
      if (!formData.genderAllowed) {
        toast.error('Gender preference is required');
        return false;
      }
      if (formData.floorConfigs.length === 0) {
        toast.error('At least one floor configuration is required for PG');
        return false;
      }
      
      // Validate each floor configuration
      for (const config of formData.floorConfigs) {
        if (!config.startingRoomNumber.trim()) {
          toast.error('Starting room number is required for all floors');
          return false;
        }
        if (config.totalRooms <= 0) {
          toast.error('Total rooms must be greater than 0 for all floors');
          return false;
        }
        if (config.pricePerBed <= 0) {
          toast.error('Price per bed must be greater than 0 for all floors');
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      // Prepare property data
      const propertyData: any = {
        title: formData.title,
        propertyType: formData.propertyType,
        description: formData.description,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        deposit: formData.deposit,
        amenities: formData.amenities.join(','),
      };

      if (formData.propertyType === 'FLAT') {
        propertyData.bhkType = formData.bhkType;
        propertyData.rentPerMonth = formData.rentPerMonth;
        propertyData.totalRooms = formData.totalRooms;
        propertyData.bathrooms = formData.bathrooms;
        propertyData.furnishingType = formData.furnishingType;
        propertyData.flatNumber = formData.flatNumber;
      } else {
        propertyData.genderAllowed = formData.genderAllowed;
        propertyData.foodIncluded = formData.foodIncluded;
        propertyData.floorConfigs = formData.floorConfigs;
      }

      // Prepare documents for upload
      const documentsForUpload = formData.documents.map(doc => ({
        documentType: doc.documentType,
        file: doc.file
      }));

      // Single transaction: Create property with images and documents
      const propertyResponse = await ownerAPI.createProperty(
        propertyData, 
        formData.images, 
        documentsForUpload
      );
      
      toast.success('Property submitted for admin approval!');
      
      // Reset form
      setFormData({
        title: '',
        propertyType: 'FLAT',
        description: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        deposit: 0,
        amenities: [],
        bhkType: '',
        rentPerMonth: 0,
        totalRooms: 0,
        bathrooms: 0,
        furnishingType: '',
        flatNumber: '',
        genderAllowed: '',
        foodIncluded: false,
        floorConfigs: [],
        images: [],
        documents: []
      });
      
      setImagePreview([]);
      
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error: any) {
      console.error('Error creating property:', error);
      toast.error(error.response?.data?.message || 'Failed to create property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-6xl mx-auto">
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
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Property Type Selection */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Step 1: Select Property Type</Label>
            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                variant={formData.propertyType === 'FLAT' ? 'default' : 'outline'}
                className={`h-20 flex flex-col space-y-2 ${
                  formData.propertyType === 'FLAT' 
                    ? 'border-primary bg-primary text-primary-foreground' 
                    : 'hover:border-primary'
                }`}
                onClick={() => handleInputChange('propertyType', 'FLAT')}
              >
                <Home className="w-6 h-6" />
                <span>Flat/Apartment</span>
              </Button>
              <Button
                type="button"
                variant={formData.propertyType === 'PG' ? 'default' : 'outline'}
                className={`h-20 flex flex-col space-y-2 ${
                  formData.propertyType === 'PG' 
                    ? 'border-primary bg-primary text-primary-foreground' 
                    : 'hover:border-primary'
                }`}
                onClick={() => handleInputChange('propertyType', 'PG')}
              >
                <Users className="w-6 h-6" />
                <span>PG/Hostel</span>
              </Button>
            </div>
          </div>

          {/* Step 2: Basic Information */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Step 2: Basic Information</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Property Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="2BHK Apartment in Prime Location"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Deposit Amount (₹) *</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="number"
                    value={formData.deposit || ''}
                    onChange={(e) => handleInputChange('deposit', parseInt(e.target.value) || 0)}
                    placeholder="50000"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your property, its features, location benefits, etc."
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Address *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="123 Main Street, Area Name"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>City *</Label>
                <Input
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Mumbai"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>State *</Label>
                <Input
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="Maharashtra"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Pincode *</Label>
                <Input
                  value={formData.pincode}
                  onChange={(e) => handleInputChange('pincode', e.target.value)}
                  placeholder="400001"
                  required
                />
              </div>
            </div>
          </div>

          {/* Step 3: Property Specific Details */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">
              Step 3: {formData.propertyType === 'FLAT' ? 'Flat Details' : 'PG Details'}
            </Label>
            
            {formData.propertyType === 'FLAT' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>BHK Type *</Label>
                  <select
                    value={formData.bhkType}
                    onChange={(e) => handleInputChange('bhkType', e.target.value)}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="">Select BHK</option>
                    <option value="1RK">1RK</option>
                    <option value="1BHK">1BHK</option>
                    <option value="2BHK">2BHK</option>
                    <option value="3BHK">3BHK</option>
                    <option value="4BHK">4BHK</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label>Rent per Month (₹) *</Label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      type="number"
                      value={formData.rentPerMonth || ''}
                      onChange={(e) => handleInputChange('rentPerMonth', parseInt(e.target.value) || 0)}
                      placeholder="15000"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Total Rooms *</Label>
                  <Input
                    type="number"
                    value={formData.totalRooms || ''}
                    onChange={(e) => handleInputChange('totalRooms', parseInt(e.target.value) || 0)}
                    placeholder="2"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Bathrooms *</Label>
                  <Input
                    type="number"
                    value={formData.bathrooms || ''}
                    onChange={(e) => handleInputChange('bathrooms', parseInt(e.target.value) || 0)}
                    placeholder="2"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Furnishing Type *</Label>
                  <select
                    value={formData.furnishingType}
                    onChange={(e) => handleInputChange('furnishingType', e.target.value)}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="UNFURNISHED">Unfurnished</option>
                    <option value="SEMI_FURNISHED">Semi Furnished</option>
                    <option value="FURNISHED">Fully Furnished</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label>Flat Number *</Label>
                  <Input
                    value={formData.flatNumber}
                    onChange={(e) => handleInputChange('flatNumber', e.target.value)}
                    placeholder="A-101"
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Gender Allowed *</Label>
                    <select
                      value={formData.genderAllowed}
                      onChange={(e) => handleInputChange('genderAllowed', e.target.value)}
                      className="w-full p-2 border rounded-md"
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="MALE">Male Only</option>
                      <option value="FEMALE">Female Only</option>
                      <option value="ANY">Anyone</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Food Included</Label>
                    <select
                      value={formData.foodIncluded ? 'true' : 'false'}
                      onChange={(e) => handleInputChange('foodIncluded', e.target.value === 'true')}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Floor Configurations</Label>
                    <Button type="button" onClick={addFloorConfig} variant="outline" size="sm">
                      Add Floor
                    </Button>
                  </div>
                  
                  {formData.floorConfigs.map((config, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">Floor {config.floorNumber}</h4>
                        <Button
                          type="button"
                          onClick={() => removeFloorConfig(index)}
                          variant="outline"
                          size="sm"
                          disabled={formData.floorConfigs.length <= 1}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <div className="space-y-2">
                          <Label>Floor Number</Label>
                          <Input
                            type="number"
                            value={config.floorNumber}
                            onChange={(e) => updateFloorConfig(index, 'floorNumber', parseInt(e.target.value) || 0)}
                            placeholder="1"
                            min="0"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Starting Room Number *</Label>
                          <Input
                            value={config.startingRoomNumber}
                            onChange={(e) => updateFloorConfig(index, 'startingRoomNumber', e.target.value)}
                            placeholder="101"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Total Rooms *</Label>
                          <Input
                            type="number"
                            value={config.totalRooms}
                            onChange={(e) => updateFloorConfig(index, 'totalRooms', parseInt(e.target.value) || 0)}
                            placeholder="5"
                            min="1"
                            max="50"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Sharing Type *</Label>
                          <select
                            value={config.sharingType}
                            onChange={(e) => updateFloorConfig(index, 'sharingType', e.target.value as 'SINGLE' | 'DOUBLE' | 'TRIPLE')}
                            className="w-full p-2 border rounded-md"
                            required
                          >
                            <option value="SINGLE">Single</option>
                            <option value="DOUBLE">Double</option>
                            <option value="TRIPLE">Triple</option>
                          </select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Bathrooms</Label>
                          <Input
                            type="number"
                            value={config.bathrooms}
                            onChange={(e) => updateFloorConfig(index, 'bathrooms', parseInt(e.target.value) || 0)}
                            placeholder="1"
                            min="0"
                            max="10"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Price per Bed (₹) *</Label>
                          <div className="relative">
                            <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                              type="number"
                              value={config.pricePerBed}
                              onChange={(e) => updateFloorConfig(index, 'pricePerBed', parseInt(e.target.value) || 0)}
                              placeholder="5000"
                              className="pl-10"
                              min="0"
                              required
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3 p-3 bg-muted rounded-md">
                        <p className="text-sm text-muted-foreground">
                          This will generate {config.totalRooms} rooms ({config.totalRooms * (config.sharingType === 'SINGLE' ? 1 : config.sharingType === 'DOUBLE' ? 2 : 3)} beds) 
                          starting from room {config.startingRoomNumber}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Step 4: Amenities */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Step 4: Amenities</Label>
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

          {/* Step 5: Images */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Step 5: Property Images * (Max 5)</Label>
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

          {/* Step 6: Documents */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Step 6: Property Documents * (At least 1 required)</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6">
              <div className="text-center">
                <FileText className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Upload verification documents (PDF, JPG, PNG - Max 10MB each)
                </p>
                <p className="text-xs text-orange-600 mb-2">
                  At least one document is required for property verification
                </p>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleDocumentUpload}
                  className="hidden"
                  id="document-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('document-upload')?.click()}
                >
                  Choose Documents
                </Button>
              </div>
            </div>
            
            {formData.documents.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Uploaded Documents:</Label>
                {formData.documents.map((document, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{document.documentName}</p>
                          <p className="text-xs text-muted-foreground">
                            {(document.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <select
                          value={document.documentType}
                          onChange={(e) => updateDocumentType(index, e.target.value)}
                          className="text-sm p-2 border rounded-md"
                          required
                        >
                          {DOCUMENT_TYPES.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeDocument(index)}
                          disabled={formData.documents.length <= 1}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
            
            {formData.documents.length === 0 && (
              <p className="text-sm text-orange-600">
                ⚠️ At least one verification document is required to submit the property
              </p>
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
              {loading ? 'Submitting...' : 'Submit for Verification'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
