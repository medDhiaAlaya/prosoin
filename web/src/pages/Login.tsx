import { useNavigate, useLocation } from "react-router-dom"
import { useEffect } from "react"
import { LoginForm } from "@/components/login-form"
import { useToast } from "@/hooks/use-toast"

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Check if there's a stored token on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleLoginSuccess = (userData: { email: string }) => {
    // Trigger storage event to update auth state in App.tsx
    window.dispatchEvent(new Event('storage'));
    
    // Show success message
    toast({
      title: "Login successful",
      description: `Welcome back, ${userData.email}!`,
    });

    // Navigate to dashboard or the page user tried to access
    const intended = location.state?.from?.pathname || '/dashboard';
    navigate(intended, { replace: true });
  }

  return <LoginForm onLoginSuccess={handleLoginSuccess} />
}
