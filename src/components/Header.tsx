
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';

const Header = () => {
  const { user, profile, signOut } = useAuth();

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <SidebarTrigger className="md:hidden" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Welcome back, {displayName}
            </h2>
            <p className="text-sm text-gray-600">Manage your financial data</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">{displayName}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={signOut}
            className="text-gray-600 hover:text-gray-900"
          >
            <LogOut className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Header;
