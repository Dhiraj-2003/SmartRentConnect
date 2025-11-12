import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { StatCard } from '@/components/Dashboard/StatCard';
import { Button } from '@/components/ui/enhanced-button';
import { 
  ScanLine, 
  UserCheck, 
  Clock, 
  AlertTriangle,
  QrCode,
  Shield,
  FileText,
  Users
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const WatchmanDashboard: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    { title: 'Passes Verified Today', value: '24', icon: ScanLine, color: 'primary' as const },
    { title: 'Visitors Checked In', value: '18', icon: UserCheck, color: 'success' as const },
    { title: 'Pending Verification', value: '3', icon: Clock, color: 'warning' as const },
    { title: 'Security Alerts', value: '1', icon: AlertTriangle, color: 'destructive' as const },
  ];

  const recentEntries = [
    { 
      name: 'John Doe', 
      purpose: 'Guest Pass - A101', 
      time: '10:30 AM', 
      status: 'verified',
      passId: 'GP001234'
    },
    { 
      name: 'Sarah Wilson', 
      purpose: 'Delivery - B205', 
      time: '09:45 AM', 
      status: 'verified',
      passId: 'GP001235'
    },
    { 
      name: 'Mike Johnson', 
      purpose: 'Maintenance - C302', 
      time: '09:15 AM', 
      status: 'pending',
      passId: 'GP001236'
    },
  ];

  const shiftInfo = {
    startTime: '06:00 AM',
    endTime: '06:00 PM',
    totalHours: '12 hours',
    currentTime: new Date().toLocaleTimeString(),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Security Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome, {user?.name} • Gate security and visitor management
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>

      {/* Shift Information */}
      <div className="bg-card rounded-lg shadow-card border border-border p-6 mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">Current Shift</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-foreground">{shiftInfo.startTime}</div>
            <div className="text-sm text-muted-foreground">Shift Start</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-foreground">{shiftInfo.endTime}</div>
            <div className="text-sm text-muted-foreground">Shift End</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-foreground">{shiftInfo.totalHours}</div>
            <div className="text-sm text-muted-foreground">Total Hours</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-primary">{shiftInfo.currentTime}</div>
            <div className="text-sm text-muted-foreground">Current Time</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-card rounded-lg shadow-card border border-border p-6 mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">Security Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/verify-pass">
            <Button variant="outline" className="w-full flex flex-col h-20 space-y-2">
              <QrCode className="w-5 h-5" />
              <span className="text-sm">Verify Pass</span>
            </Button>
          </Link>
          <Link to="/entry-logs">
            <Button variant="outline" className="w-full flex flex-col h-20 space-y-2">
              <FileText className="w-5 h-5" />
              <span className="text-sm">Entry Logs</span>
            </Button>
          </Link>
          <Link to="/emergency">
            <Button variant="outline" className="w-full flex flex-col h-20 space-y-2">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-sm">Emergency Alert</span>
            </Button>
          </Link>
          <Link to="/visitor-register">
            <Button variant="outline" className="w-full flex flex-col h-20 space-y-2">
              <Users className="w-5 h-5" />
              <span className="text-sm">Visitor Register</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Entries */}
        <div className="bg-card rounded-lg shadow-card border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Recent Entries</h2>
            <Link to="/entry-logs">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
          <div className="space-y-3">
            {recentEntries.map((entry, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-foreground">{entry.name}</p>
                  <p className="text-xs text-muted-foreground">{entry.purpose}</p>
                  <p className="text-xs text-muted-foreground">Pass: {entry.passId}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    entry.status === 'verified' 
                      ? 'bg-success/10 text-success' 
                      : 'bg-warning/10 text-warning'
                  }`}>
                    {entry.status}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">{entry.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Status */}
        <div className="bg-card rounded-lg shadow-card border border-border p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Security Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-success" />
                <div>
                  <p className="text-sm font-medium text-foreground">Main Gate</p>
                  <p className="text-xs text-muted-foreground">All systems operational</p>
                </div>
              </div>
              <span className="text-success text-sm">●</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
              <div className="flex items-center space-x-3">
                <QrCode className="w-5 h-5 text-success" />
                <div>
                  <p className="text-sm font-medium text-foreground">QR Scanner</p>
                  <p className="text-xs text-muted-foreground">Working normally</p>
                </div>
              </div>
              <span className="text-success text-sm">●</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-warning" />
                <div>
                  <p className="text-sm font-medium text-foreground">Camera System</p>
                  <p className="text-xs text-muted-foreground">Camera 3 needs maintenance</p>
                </div>
              </div>
              <span className="text-warning text-sm">●</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};