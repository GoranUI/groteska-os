
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';

const Header = () => {
  const { user, profile, signOut } = useAuth();

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="bg-background border-b border-border px-4 sm:px-6 py-3 sm:py-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
          <SidebarTrigger className="md:hidden flex-shrink-0" />
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-semibold text-foreground truncate">
              Welcome back, {displayName}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Manage your financial data</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
          <div className="flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline max-w-24 truncate">{displayName}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={signOut}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4 mr-0 sm:mr-2" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Header;
