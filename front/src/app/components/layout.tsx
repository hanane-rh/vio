import { Outlet, Link, useLocation } from 'react-router';
import { Heart, Sparkles, Star, Zap, Home } from 'lucide-react';
import { AvatarDisplay } from './avatar-display';
import { useUser } from '../context/user-context';

export function Layout() {
  const location = useLocation();
  const { profile } = useUser();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/future-self', label: 'Future Self', icon: Sparkles },
    { path: '/constellation', label: 'Constellation', icon: Star },
    { path: '/challenges', label: 'Challenges', icon: Zap },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-teal-50 to-emerald-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-lg border-b border-teal-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-400 flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" fill="currentColor" />
              </div>
              <h1 className="text-2xl font-semibold text-slate-800">CarePath</h1>
            </div>
            
            <nav className="flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-teal-400 to-emerald-400 text-white shadow-md'
                        : 'text-slate-600 hover:bg-white/60 hover:text-teal-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Link>
                );
              })}

              {/* Avatar in header */}
              {profile && (
                <div className="ml-2 pl-2 border-l border-teal-200">
                  <AvatarDisplay config={profile.avatar} size="small" />
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white/50 backdrop-blur-sm border-t border-teal-100 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2">
            <p className="text-sm text-slate-600">
              <Heart className="w-4 h-4 inline text-rose-400 mr-1" fill="currentColor" />
              Every step forward is a victory. We're proud of you.
            </p>
            <p className="text-xs text-slate-500">
              CarePath — Your compassionate companion on the journey to healing
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}