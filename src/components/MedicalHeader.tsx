import { Activity, Heart, Stethoscope } from "lucide-react";

export const MedicalHeader = () => {
  return (
    <div className="relative overflow-hidden text-primary-foreground py-12 px-6 mb-8 rounded-2xl shadow-xl" style={{
      background: 'linear-gradient(135deg, hsl(210 100% 40%) 0%, hsl(180 60% 50%) 50%, hsl(210 100% 40%) 100%)',
      backgroundSize: '200% 200%',
      animation: 'gradient-shift 5s ease infinite'
    }}>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-20"></div>
      
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <div className="flex justify-center items-center gap-4 mb-4">
          <Stethoscope className="w-10 h-10 animate-float" />
          <Heart className="w-12 h-12 animate-heartbeat" />
          <Activity className="w-10 h-10 animate-float-reverse" />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold mb-3 animate-slide-in-down">
          🩺 AI Medical Assistant
        </h1>
        
        <p className="text-lg md:text-xl opacity-95 max-w-2xl mx-auto animate-fade-in-scale stagger-1">
          Advanced disease prediction & personalized medicine recommendations with safety validation
        </p>
        
        <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm">
          <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full glass hover-lift animate-slide-in-left stagger-1">
            💊 Smart Drug Safety
          </span>
          <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full glass hover-lift animate-slide-in-up stagger-2">
            ⚕️ ML-Powered Diagnosis
          </span>
          <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full glass hover-lift animate-slide-in-right stagger-3">
            📊 Detailed Analytics
          </span>
        </div>
      </div>
    </div>
  );
};
