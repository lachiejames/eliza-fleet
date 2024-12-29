import { Link } from 'react-router-dom';
import { Sidebar } from './ui/sidebar';
import { Button } from './ui/button';
import { LayoutDashboard, UserCircle, Key } from 'lucide-react';

export function AppSidebar() {
  return (
    <Sidebar>
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold">Eliza Fleet</h2>
        <div className="space-y-1">
          <Link to="/">
            <Button variant="ghost" className="w-full justify-start">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link to="/character">
            <Button variant="ghost" className="w-full justify-start">
              <UserCircle className="mr-2 h-4 w-4" />
              Character Profile
            </Button>
          </Link>
          <Link to="/credentials">
            <Button variant="ghost" className="w-full justify-start">
              <Key className="mr-2 h-4 w-4" />
              Platform Credentials
            </Button>
          </Link>
        </div>
      </div>
    </Sidebar>
  );
}
