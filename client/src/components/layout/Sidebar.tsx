import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  BookOpen, 
  Library, 
  CalendarDays, 
  FileText, 
  Settings,
  LogOut,
  User
} from "lucide-react";
import { useUser, useLogout } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [location] = useLocation();
  const { user } = useUser();
  const { mutate: logout } = useLogout();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/inquiry", label: "My Inquiry", icon: BookOpen },
    { href: "/resources", label: "Shared Resources", icon: Library },
    { href: "/meetings", label: "Meetings", icon: CalendarDays },
    { href: "/report", label: "Report Builder", icon: FileText },
  ];

  if (user?.role === "admin") {
    navItems.push({ href: "/settings", label: "Settings", icon: Settings });
  }

  return (
    <>
      {/* Mobile Header with Settings for Admins */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between z-50">
        <h1 className="text-lg font-serif font-bold text-white">Cohort Inquiry</h1>
        <div className="flex items-center gap-2">
          {user?.role === "admin" && (
            <Link href="/settings">
              <div className={cn(
                "p-2 rounded-md transition-colors",
                location === "/settings" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
              )}>
                <Settings className="h-5 w-5" />
              </div>
            </Link>
          )}
          <button
            onClick={() => logout()}
            className="p-2 text-slate-400 hover:text-white"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>

      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-100 hidden md:flex flex-col border-r border-slate-800">
      <div className="p-6">
        <h1 className="text-xl font-serif font-bold text-slate-100 tracking-tight">
          Cohort Inquiry
        </h1>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-medium">Research Collective</p>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer group",
                  isActive 
                    ? "bg-slate-800 text-white shadow-sm" 
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                )}
              >
                <item.icon className={cn("mr-3 h-5 w-5", isActive ? "text-secondary" : "text-slate-500 group-hover:text-slate-300")} />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center mb-4 px-2">
          <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300">
            <User className="h-4 w-4" />
          </div>
          <div className="ml-3 overflow-hidden">
            <p className="text-sm font-medium text-white truncate">{user?.fullName}</p>
            <p className="text-xs text-slate-500 truncate capitalize">{user?.role}</p>
          </div>
        </div>
        
        <button
          onClick={() => logout()}
          className="w-full flex items-center justify-center px-4 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
        >
          <LogOut className="mr-2 h-3.5 w-3.5" />
          Sign Out
        </button>
      </div>
    </aside>
    </>
  );
}
