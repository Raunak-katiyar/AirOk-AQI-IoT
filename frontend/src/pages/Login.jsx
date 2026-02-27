import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import API from "../api/axios";

// Simple UI components (agar shadcn nahi hai to raw HTML bhi use kar sakte ho)
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// Zod validation schema
const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

function Login() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (token && role) {
      redirectBasedOnRole(role);
    }
  }, []);

  const redirectBasedOnRole = (role) => {
    if (role === "admin") navigate("/admin", { replace: true });
    else if (role === "super_admin") navigate("/super-admin", { replace: true });
    else navigate("/dashboard", { replace: true });
  };

  const onSubmit = async (data) => {
    setServerError("");
    try {
      const res = await API.post("/api/auth/login", {
        email: data.email,
        password: data.password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      redirectBasedOnRole(res.data.role);
    } catch (err) {
      if (err.response?.status === 401) {
        setServerError("Invalid email or password");
      } else {
        setServerError("Server error. Please try again.");
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">AQI Monitoring System</CardTitle>
          <CardDescription>Sign in to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Error */}
            {serverError && (
              <div className="text-sm text-red-500 text-center bg-red-50 p-2 rounded">
                {serverError}
              </div>
            )}

            {/* Button */}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default Login;