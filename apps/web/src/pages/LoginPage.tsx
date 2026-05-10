import { FormEvent, useState } from "react";
import { ToastBanner, useToast } from "../../../../packages/shared/src/ui/toast";
import { requestOtp, verifyOtp } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const [mobile, setMobile] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const { toast, showToast, dismissToast } = useToast();

  async function onRequestOtp(event: FormEvent) {
    event.preventDefault();
    dismissToast();

    try {
      const response = await requestOtp(mobile);
      setOtpSent(true);
      showToast("success", response.otp ? `Demo OTP: ${response.otp}` : "OTP sent to your mobile");
    } catch {
      showToast("error", "Unable to send OTP. Please try again.");
    }
  }

  async function onVerifyOtp(event: FormEvent) {
    event.preventDefault();
    dismissToast();

    try {
      const data = await verifyOtp(mobile, otp, name);
      login(data);
    } catch {
      showToast("error", "Invalid OTP or session expired.");
    }
  }

  return (
    <section className="page">
      <article className="card login-card">
        <h2>Login / Signup</h2>
        <p>Use mobile OTP to continue to Prakruthi Natural Farms.</p>

        <ToastBanner toast={toast} onDismiss={dismissToast} />

        {!otpSent ? (
          <form onSubmit={onRequestOtp} className="form-stack">
            <input
              value={mobile}
              onChange={(event) => setMobile(event.target.value)}
              maxLength={10}
              placeholder="10-digit mobile number"
              required
            />
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name (optional for first login)"
            />
            <button type="submit">Request OTP</button>
          </form>
        ) : (
          <form onSubmit={onVerifyOtp} className="form-stack">
            <input value={mobile} disabled />
            <input
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
              maxLength={6}
              placeholder="Enter OTP"
              required
            />
            <button type="submit">Verify OTP</button>
          </form>
        )}

      </article>
    </section>
  );
}
