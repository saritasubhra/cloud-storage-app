import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import AuthLayout from "../components/AuthLayout.jsx";
import TextField from "../components/TextField.jsx";
import Button from "../components/Button.jsx";
import GoogleAuthButton from "../components/GoogleAuthButton.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { getErrorMessage } from "../utils/getErrorMessage.js";

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const redirectTo = location.state?.from?.pathname || "/dashboard";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.email.trim()) nextErrors.email = "Email is required";
    if (!form.password) nextErrors.password = "Password is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const user = await login(form);
      toast.success(`Welcome back, ${user.name.split(" ")[0]}`);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error, "Couldn't log you in. Check your details and try again."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to get to your files."
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/register" className="font-medium text-ochre-dark hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <TextField
          id="email"
          name="email"
          type="email"
          label="Email"
          autoComplete="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
        />
        <TextField
          id="password"
          name="password"
          type="password"
          label="Password"
          autoComplete="current-password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
        />

        <Button type="submit" loading={submitting}>
          Log in
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-ink-soft">
        <div className="h-px flex-1 bg-moss-light" />
        or
        <div className="h-px flex-1 bg-moss-light" />
      </div>

      <GoogleAuthButton label="Continue with Google" />
    </AuthLayout>
  );
}

export default LoginPage;
