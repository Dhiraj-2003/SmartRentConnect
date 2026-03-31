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
  Play,
  Zap,
  Clock,
  Globe,
  TrendingUp,
  Award,
  Lock,
  Wifi,
  MapPin
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
      <section className="relative overflow-hidden min-h-screen flex items-center">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5"></div>
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-20 left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse delay-500"></div>
          </div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-3xl">
              <Badge className="mb-6 bg-gradient-to-r from-primary/20 to-secondary/20 text-primary border-0 animate-bounce">
                <Zap className="w-4 h-4 mr-2" />
                AI-Powered Property Management
              </Badge>
              
              <h1 className="text-5xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
                Smart Rental Revolution
              </h1>
              
              <p className="text-xl text-foreground/80 mb-8 leading-relaxed font-medium">
                Experience the next generation of property management. Connect tenants, owners, and security through our intelligent platform with QR-based guest management, automated payments, and real-time analytics.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link to="/register">
                  <Button variant="gradient" size="xl" className="w-full sm:w-auto group">
                    Start Free Trial
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button variant="outline" size="xl" className="w-full sm:w-auto group">
                  <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Watch Demo
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-6 mb-8">
                <div className="flex items-center text-sm text-foreground/80 font-medium">
                  <CheckCircle className="w-4 h-4 mr-2 text-success" />
                  SOC 2 Compliant
                </div>
                <div className="flex items-center text-sm text-foreground/80 font-medium">
                  <Shield className="w-4 h-4 mr-2 text-success" />
                  Bank-Level Security
                </div>
                <div className="flex items-center text-sm text-foreground/80 font-medium">
                  <Award className="w-4 h-4 mr-2 text-success" />
                  Industry Leading
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative">
              <div className="relative z-10">
                <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/50 shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                        <Building className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Property Dashboard</h3>
                        <p className="text-sm text-muted-foreground">Real-time insights</p>
                      </div>
                    </div>
                    <Badge className="bg-success/10 text-success border-success/20">Live</Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-background/70 rounded-lg border border-border/30">
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-foreground">Luxury Apartment</span>
                      </div>
                      <span className="text-sm font-bold text-success">₹25,000/mo</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-background/70 rounded-lg border border-border/30">
                      <div className="flex items-center space-x-3">
                        <Users className="w-4 h-4 text-secondary" />
                        <span className="text-sm font-medium text-foreground">Active Tenants</span>
                      </div>
                      <span className="text-sm font-bold text-foreground">142</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-background/70 rounded-lg border border-border/30">
                      <div className="flex items-center space-x-3">
                        <TrendingUp className="w-4 h-4 text-accent" />
                        <span className="text-sm font-medium text-foreground">Revenue Growth</span>
                      </div>
                      <span className="text-sm font-bold text-success">+23%</span>
                    </div>
                  </div>
                </Card>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-secondary/20 rounded-full blur-xl animate-pulse delay-700"></div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="text-3xl lg:text-4xl font-bold text-foreground group-hover:scale-110 transition-transform">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gradient-to-br from-background via-primary/5 to-secondary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Zap className="w-4 h-4 mr-2" />
              Powerful Features
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Everything You Need in One Platform
            </h2>
            <p className="text-xl text-foreground/75 max-w-3xl mx-auto font-medium">
              Designed for tenants, property owners, admins, and security personnel. 
              Each role gets a customized experience with powerful features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <CardContent className="p-6 relative z-10">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <div className="mb-3">
                      <Badge variant="outline" className="text-xs bg-background/50 border-primary/20 text-primary">
                        {feature.userType}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-foreground/70 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                    
                    {/* Hover Arrow */}
                    <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="w-4 h-4 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Additional Feature Highlights */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">24/7 Availability</h3>
              <p className="text-foreground/70 text-sm">Access your dashboard anytime, anywhere with our cloud-based platform</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Multi-Location Support</h3>
              <p className="text-foreground/70 text-sm">Manage properties across multiple cities and regions from one dashboard</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wifi className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Real-time Sync</h3>
              <p className="text-foreground/70 text-sm">Instant updates across all devices with real-time synchronization</p>
            </div>
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
            <p className="text-xl text-foreground/75 font-medium">
              Simple steps to revolutionize your rental experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary-foreground">1</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Sign Up & Choose Role</h3>
              <p className="text-foreground/70">
                Create your account as a tenant, property owner, admin, or security personnel. 
                Get instant access to role-specific features.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary-foreground">2</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Explore & Connect</h3>
              <p className="text-foreground/70">
                Search properties, manage listings, create guest passes, or verify visitors. 
                Everything is seamlessly integrated and user-friendly.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary-foreground">3</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Manage & Grow</h3>
              <p className="text-foreground/70">
                Handle payments, track analytics, manage complaints, and enjoy 
                a streamlined rental management experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Showcase */}
      <section className="py-24 bg-gradient-to-r from-primary/10 via-background to-secondary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-primary/20 to-secondary/20 text-primary border-0">
              <Lock className="w-4 h-4 mr-2" />
              Enterprise Grade Technology
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Built with Modern Tech Stack
            </h2>
            <p className="text-xl text-foreground/75 max-w-3xl mx-auto font-medium">
              Powered by cutting-edge technologies to ensure scalability, security, and performance
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Advanced Security</h3>
                  <p className="text-foreground/70">End-to-end encryption, JWT authentication, and role-based access control ensure your data is always protected.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Lightning Fast</h3>
                  <p className="text-foreground/70">Built with React, TypeScript, and modern frameworks for optimal performance and user experience.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Cloud Native</h3>
                  <p className="text-foreground/70">Scalable cloud infrastructure with 99.9% uptime guarantee and automatic backups.</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <Card className="p-8 bg-card/80 backdrop-blur-sm border-border/50 shadow-2xl">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-foreground">System Status</h3>
                    <Badge className="bg-success/10 text-success border-success/20">
                      <div className="w-2 h-2 bg-success rounded-full mr-2 animate-pulse"></div>
                      All Systems Operational
                    </Badge>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground/80 font-medium">API Response Time</span>
                      <span className="text-sm font-bold text-success">45ms</span>
                    </div>
                    <div className="w-full bg-background/70 rounded-full h-2 border border-border/20">
                      <div className="bg-gradient-to-r from-success to-primary h-2 rounded-full w-[95%]"></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground/80 font-medium">Database Performance</span>
                      <span className="text-sm font-bold text-success">Excellent</span>
                    </div>
                    <div className="w-full bg-background/70 rounded-full h-2 border border-border/20">
                      <div className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full w-[98%]"></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground/80 font-medium">Security Score</span>
                      <span className="text-sm font-bold text-success">A+</span>
                    </div>
                    <div className="w-full bg-background/70 rounded-full h-2 border border-border/20">
                      <div className="bg-gradient-to-r from-secondary to-accent h-2 rounded-full w-full"></div>
                    </div>
                  </div>
                </div>
              </Card>
              
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-secondary/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
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
            <p className="text-xl text-foreground/75 font-medium">
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
                  <p className="text-foreground/80 mb-4 italic leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-foreground/70 font-medium">{testimonial.role}</div>
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
          <p className="text-xl text-foreground/75 mb-8 font-medium">
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

          <div className="flex items-center justify-center space-x-6 mt-8 text-sm text-foreground/70 font-medium">
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
            <p>&copy; 2025 SmartRentConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};