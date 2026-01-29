import { Link } from 'react-router-dom';
import { Wind, User, LogIn, LogOut, Bell, MapPin, FileText } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/use-auth';

export function Header() {
  const { user, isAuthenticated, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg group-hover:blur-xl transition-all" />
            <div className="relative bg-gradient-to-br from-primary to-accent p-2 rounded-xl">
              <Wind className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">
              Delhi AQI
            </h1>
            <p className="text-xs text-muted-foreground -mt-0.5">
              Zoning & Forecast
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="hidden sm:flex">
            <Link to="/neighborhoods" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Neighborhoods
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="hidden sm:flex">
            <Link to="/documentation" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Docs
            </Link>
          </Button>
          <ThemeToggle />

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium truncate">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/alerts" className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    My Alerts
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="default" size="sm">
              <Link to="/auth" className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Sign In
              </Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
