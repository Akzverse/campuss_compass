import { GraduationCap, Briefcase, ShieldCheck, UserCircle } from 'lucide-react';

interface RoleSelectionProps {
  onSelectRole: (role: string) => void;
}

export default function RoleSelection({ onSelectRole }: RoleSelectionProps) {
  const roles = [
    {
      id: 'student',
      name: 'Student',
      description: 'Find classrooms, labs, and student facilities',
      icon: GraduationCap,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50',
    },
    {
      id: 'faculty',
      name: 'Faculty',
      description: 'Locate faculty cabins and departmental offices',
      icon: Briefcase,
      gradient: 'from-emerald-500 to-teal-500',
      bgGradient: 'from-emerald-50 to-teal-50',
    },
    {
      id: 'admin',
      name: 'Administrative Staff',
      description: 'Access administrative offices and departments',
      icon: ShieldCheck,
      gradient: 'from-violet-500 to-purple-500',
      bgGradient: 'from-violet-50 to-purple-50',
    },
    {
      id: 'visitor',
      name: 'Visitor',
      description: 'Get simplified navigation for common areas',
      icon: UserCircle,
      gradient: 'from-amber-500 to-orange-500',
      bgGradient: 'from-amber-50 to-orange-50',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            Who are you?
          </h1>
          <p className="text-xl text-slate-600">
            Select your role to get personalized navigation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <button
                key={role.id}
                onClick={() => onSelectRole(role.id)}
                className={`bg-gradient-to-br ${role.bgGradient} p-8 rounded-2xl border-2 border-transparent hover:border-slate-300 hover:shadow-2xl transition-all duration-300 text-left group`}
              >
                <div className={`bg-gradient-to-br ${role.gradient} w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  {role.name}
                </h3>
                <p className="text-slate-600">
                  {role.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
