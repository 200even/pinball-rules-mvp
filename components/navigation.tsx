import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Navigation() {
  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
              🎯 Pinball Rules
            </Link>
            
            <div className="hidden md:flex space-x-6">
              <Link 
                href="/games" 
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Games
              </Link>
              <Link 
                href="/admin" 
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Admin
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Future: Add authentication/account buttons here */}
          </div>
        </div>
        
        {/* Mobile menu */}
        <div className="md:hidden pb-4">
          <div className="flex space-x-4">
            <Link 
              href="/games" 
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors text-sm"
            >
              Games
            </Link>
            <Link 
              href="/admin" 
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors text-sm"
            >
              Admin
            </Link>
            <Link 
              href="/settings" 
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors text-sm"
            >
              Settings
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
