import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { forgotPassword } from "@/api/auth";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch {
      setSent(true);
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
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Forgot password</h1>
            <p className="text-gray-500 text-sm mt-2">Enter your email to receive a reset link</p>
          </div>

          {sent ? (
            <div className="text-center space-y-6">
              <div className="w-14 h-14 rounded-full bg-black/[0.03] flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <p className="text-sm text-gray-500">If that email exists, a reset link has been sent.</p>
              <Link to="/login">
                <button className="relative w-full rounded-full bg-black text-white py-3.5 text-sm font-medium transition-all duration-500 ease-out-expo hover:bg-black/90 active:scale-[0.98] disabled:opacity-50">
                  Back to Sign In
                </button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="email" className="text-xs font-medium text-gray-500 uppercase tracking-[0.1em]">Email</label>
                <div className="p-[1px] rounded-xl bg-black/[0.06] transition-all duration-500 ease-out-expo focus-within:bg-black/10">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full rounded-xl bg-white px-4 py-3 text-sm outline-none placeholder:text-gray-400 transition-all duration-500 ease-out-expo"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="relative w-full rounded-full bg-black text-white py-3.5 text-sm font-medium transition-all duration-500 ease-out-expo hover:bg-black/90 active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          )}

          {!sent && (
            <p className="text-center text-sm text-gray-500 mt-8">
              Remember your password?{" "}
              <Link to="/login" className="text-gray-900 font-medium hover:underline">Sign In</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
