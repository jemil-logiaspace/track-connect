import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { resetPassword } from "@/api/auth";

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(token!, password);
      toast.success("Password updated successfully");
      navigate("/login");
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response: { data: { error: string } } }).response?.data?.error
          : "Reset failed";
      toast.error(msg || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md p-[1px] rounded-[2.5rem] bg-gradient-to-b from-black/[0.04] to-transparent">
        <div className="rounded-[calc(2.5rem-1px)] bg-white p-8 sm:p-10 shadow-[0_2px_40px_-12px_rgba(0,0,0,0.08)]">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-8 group">
              <img src="/trace-logo.svg" alt="TRACE" className="h-8 w-auto" />
            </Link>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Set new password</h1>
            <p className="text-gray-500 text-sm mt-2">Enter your new password below</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="password" className="text-xs font-medium text-gray-500 uppercase tracking-[0.1em]">New Password</label>
              <div className="p-[1px] rounded-xl bg-black/[0.06] transition-all duration-500 ease-out-expo focus-within:bg-black/10">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full rounded-xl bg-white px-4 py-3 text-sm outline-none placeholder:text-gray-400 transition-all duration-500 ease-out-expo"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="confirm" className="text-xs font-medium text-gray-500 uppercase tracking-[0.1em]">Confirm Password</label>
              <div className="p-[1px] rounded-xl bg-black/[0.06] transition-all duration-500 ease-out-expo focus-within:bg-black/10">
                <input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full rounded-xl bg-white px-4 py-3 text-sm outline-none placeholder:text-gray-400 transition-all duration-500 ease-out-expo"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="relative w-full rounded-full bg-black text-white py-3.5 text-sm font-medium transition-all duration-500 ease-out-expo hover:bg-black/90 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-8">
            Remember your password?{" "}
            <Link to="/login" className="text-gray-900 font-medium hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
