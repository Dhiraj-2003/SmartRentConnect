import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/enhanced-button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building, 
  QrCode, 
  CreditCard, 
  Search,
  Shield,
  Users,
  Smartphone,
  CheckCircle,
  Star,
  ArrowRight,
  Play
} from 'lucide-react';
import heroImage from '@/assets/hero-bg.jpg';

export const Landing: React.FC = () => {
  const features = [
    {
      icon: Search,
      title: 'Smart Property Search',
      description: 'Find your perfect home with advanced filters, location-based search, and real-time availability.',
      userType: 'Tenants'
    },
    {
      icon: QrCode,
      title: 'Digital Guest Passes',
      description: 'Create and manage visitor passes with QR codes for seamless and secure guest entry.',
      userType: 'Tenants'
    },
    {
      icon: Building,
      title: 'Property Management',
      description: 'Effortlessly manage multiple properties, track rent payments, and handle tenant requests.',
      userType: 'Owners'
    },
    {
      icon: CreditCard,
      title: 'Secure Payments',
      description: 'Integrated payment system with Razorpay for quick, secure, and hassle-free transactions.',
      userType: 'All Users'
    },
    {
      icon: Shield,
      title: 'Advanced Security',
      description: 'QR code verification system for watchmen to ensure only authorized visitors enter.',
      userType: 'Security'
    },
    {
      icon: Users,
      title: 'Role-Based Access',
      description: 'Customized dashboards and features for tenants, owners, admins, and security personnel.',
      userType: 'All Users'
    }
  ];

  const stats = [
    { value: '10,000+', label: 'Happy Users' },
    { value: '5,000+', label: 'Properties Listed' },
    { value: '50,000+', label: 'Guest Passes Created' },
    { value: '99.9%', label: 'Uptime' }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Property Owner',
      content: 'SmartRentConnect has revolutionized how I manage my rental properties. The automated payment system and tenant communication features save me hours every week.',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Tenant',
      content: 'Finding my apartment was so easy with the smart search filters. The guest pass system is incredibly convenient for having visitors over.',
      rating: 5
    },
    {
      name: 'David Williams',
      role: 'Building Security',
      content: 'The QR code verification system makes my job much easier and more secure. No more manual visitor logs or confusion about authorized guests.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">SmartRentConnect</span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-smooth">Features</a>
              <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-smooth">How it Works</a>
              <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-smooth">Testimonials</a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-smooth">Pricing</a>
            </nav>

            <div className="flex items-center space-x-3">
              <Link to="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button variant="gradient">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Modern smart building" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 to-background/70"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-3xl">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
              🚀 Now Available - Smart Property Management
            </Badge>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              The Future of 
              <span className="bg-gradient-primary bg-clip-text text-transparent"> Rental Management</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Connect tenants, owners, and security through one intelligent platform. 
              Streamline property search, guest management, payments, and security with 
              cutting-edge technology.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link to="/register">
                <Button variant="gradient" size="xl" className="w-full sm:w-auto">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button variant="outline" size="xl" className="w-full sm:w-auto">
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gradient-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Everything You Need in One Platform
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Designed for tenants, property owners, admins, and security personnel. 
              Each role gets a customized experience with powerful features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="group hover:shadow-elevated transition-smooth border-border/50">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-smooth">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="mb-2">
                      <Badge variant="outline" className="text-xs mb-3">
                        {feature.userType}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              How SmartRentConnect Works
            </h2>
            <p className="text-xl text-muted-foreground">
              Simple steps to revolutionize your rental experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary-foreground">1</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Sign Up & Choose Role</h3>
              <p className="text-muted-foreground">
                Create your account as a tenant, property owner, admin, or security personnel. 
                Get instant access to role-specific features.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary-foreground">2</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Explore & Connect</h3>
              <p className="text-muted-foreground">
                Search properties, manage listings, create guest passes, or verify visitors. 
                Everything is seamlessly integrated and user-friendly.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary-foreground">3</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Manage & Grow</h3>
              <p className="text-muted-foreground">
                Handle payments, track analytics, manage complaints, and enjoy 
                a streamlined rental management experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-gradient-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Loved by Thousands of Users
            </h2>
            <p className="text-xl text-muted-foreground">
              See what our community has to say about SmartRentConnect
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-warning fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
            Ready to Transform Your Rental Experience?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of users who have already revolutionized their property management workflow.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button variant="gradient" size="xl">
                Start Your Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="xl">
                Sign In to Continue
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-center space-x-6 mt-8 text-sm text-muted-foreground">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-success" />
              Free 30-day trial
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-success" />
              No credit card required
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-success" />
              Cancel anytime
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Building className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground">SmartRentConnect</span>
              </div>
              <p className="text-muted-foreground text-sm">
                The future of rental management is here. Connect, manage, and grow with confidence.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-smooth">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition-smooth">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-smooth">API</a></li>
                <li><a href="#" className="hover:text-foreground transition-smooth">Integrations</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-smooth">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-smooth">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-smooth">Careers</a></li>
                <li><a href="#" className="hover:text-foreground transition-smooth">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-smooth">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-smooth">Documentation</a></li>
                <li><a href="#" className="hover:text-foreground transition-smooth">Status</a></li>
                <li><a href="#" className="hover:text-foreground transition-smooth">Privacy Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 SmartRentConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};