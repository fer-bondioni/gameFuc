import LoginForm from "@/components/LoginForm";

export default function DashboardLoginPage() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Game Dashboard</h1>
        <LoginForm />
      </div>
    </div>
  );
}