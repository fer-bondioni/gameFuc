import LoginForm from "@/components/LoginForm";

export default function DashboardLoginPage() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-extrabold text-center mb-8 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent drop-shadow-2xl">
          ⚙️ Panel de Administración
        </h1>
        <LoginForm />
      </div>
    </div>
  );
}
