import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AUTH_URL, EMAIL_URL, getErrorMessage } from "@/lib/api";
import {
  Mail,
  KeyRound,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";

export function ForgetPassword() {
  const [auth, Setauth] = useState({ email: "", otp: "", newpass: "" });
  const [showOtpField, SetshowOtpField] = useState(false);
  const [showTimer, SetshowTimer] = useState({ show: false, timer: 60 });
  const [showChangePassword, SetshowChangePassword] = useState(false);
  const [showNewPassword, SetshowNewPassword] = useState(false);
  const [loading, Setloading] = useState(false);

  const [showAlert, SetshowAlert] = useState({
    status: false,
    title: "",
    desc: "",
  });

  const alertTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();

  function ShowAlert(status: boolean, title: string, desc: string) {
    if (alertTimerRef.current) {
      clearTimeout(alertTimerRef.current);
    }
    SetshowAlert({
      status: status,
      title: title,
      desc: desc,
    });
    if (status) {
      alertTimerRef.current = setTimeout(() => {
        SetshowAlert({ status: false, title: "", desc: "" });
      }, 4000);
    }
  }

  useEffect(() => {
    return () => {
      if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
    };
  }, []);

  async function SendEmail() {
    Setloading(true);
    try {
      const emailHtml = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
  <div style="text-align: center; margin-bottom: 28px;">
    <div style="display: inline-block; width: 48px; height: 48px; line-height: 48px; background: linear-gradient(135deg, #4f46e5, #0ea5e9); color: #ffffff; border-radius: 12px; font-weight: bold; font-size: 20px;">
      &#128279;
    </div>
    <h2 style="color: #0f172a; margin: 16px 0 6px 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">UrlShortner</h2>
    <p style="color: #64748b; font-size: 14px; margin: 0;">Password Reset Verification</p>
  </div>
  <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; border: 1px solid #f1f5f9; text-align: center;">
    <p style="color: #334155; font-size: 15px; margin: 0 0 16px 0; line-height: 1.5;">
      We received a request to reset the password for your account. Use the verification code below to complete the process:
    </p>
    <div style="display: inline-block; padding: 12px 24px; background: #ffffff; border: 2px dashed #4f46e5; border-radius: 10px; font-family: monospace; font-size: 28px; font-weight: 800; letter-spacing: 6px; color: #4f46e5; margin: 12px 0;">
      {{otp}}
    </div>
    <p style="color: #64748b; font-size: 13px; margin: 14px 0 0 0;">
      This verification code is valid for <strong>10 minutes</strong>. Please do not share this code with anyone.
    </p>
  </div>
  <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #f1f5f9; text-align: center;">
    <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin: 0;">
      If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
    </p>
  </div>
</div>
`.trim();

      let res = await axios.post(
        `${EMAIL_URL}/api/email`,
        {
          email: auth.email,
          subject: "Password Reset Verification Code - UrlShortner",
          html: emailHtml,
          type: "otp",
        },
        { withCredentials: true },
      );

      if (
        res.status === 200 ||
        res.status === 201 ||
        res.data === "email sent please check your spam also"
      ) {
        SetshowOtpField(true);
        SetshowTimer({ show: true, timer: 60 });
        ShowAlert(
          true,
          "OTP Sent",
          typeof res.data === "string"
            ? res.data
            : res.data?.message || "Email sent! Please check your spam folder as well."
        );
      }
    } catch (error: any) {
      ShowAlert(true, "Please try again", getErrorMessage(error, "Failed to send email"));
    } finally {
      Setloading(false);
    }
  }

  async function VerifyOTP() {
    Setloading(true);
    try {
      let res = await axios.post(
        `${AUTH_URL}/api/auth/verifyotp`,
        {
          email: auth.email,
          otp: auth.otp,
        },
        { withCredentials: true },
      );

      if (res.data === "correct otp" || res.status === 200) {
        SetshowChangePassword(true);
        ShowAlert(true, "Success", "OTP verified! Please enter your new password.");
      }
    } catch (error: any) {
      ShowAlert(true, "Invalid OTP", getErrorMessage(error, "Verification failed"));
    } finally {
      Setloading(false);
    }
  }

  async function ChangePassword() {
    Setloading(true);
    try {
      let res = await axios.post(
        `${AUTH_URL}/api/auth/forgot-password`,
        {
          email: auth.email,
          newPassword: auth.newpass,
        },
        { withCredentials: true },
      );

      if (res.data === "user updated" || res.status === 200) {
        ShowAlert(true, "Success", "Password updated successfully! Redirecting...");
        setTimeout(() => {
          navigate("/sign-in");
        }, 800);
      }
    } catch (error: any) {
      ShowAlert(true, "Please try again", getErrorMessage(error, "Could not change password"));
    } finally {
      Setloading(false);
    }
  }

  // Timer with cleanup
  useEffect(() => {
    let timerId: any;
    if (showTimer.show && showTimer.timer > 0) {
      timerId = setTimeout(() => {
        SetshowTimer((prev) => ({ ...prev, timer: prev.timer - 1 }));
      }, 1000);
    } else if (showTimer.show && showTimer.timer === 0) {
      SetshowTimer({ show: false, timer: 60 });
    }
    return () => clearTimeout(timerId);
  }, [showTimer.show, showTimer.timer]);

  // Current step calculation
  const currentStep = showChangePassword ? 3 : showOtpField ? 2 : 1;

  return (
    <div className="w-full">
      {/* Toast Notification */}
      {showAlert.status && (
        <div className="fixed top-5 left-0 right-0 z-50 flex items-center justify-center px-4 pointer-events-none animate-in fade-in slide-in-from-top-4 duration-300">
          <Alert className="w-full max-w-md bg-white border border-rose-200 shadow-xl shadow-slate-300/50 rounded-xl p-4 flex gap-3 items-start pointer-events-auto">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <AlertTitle className="text-sm font-semibold text-slate-900">
                {showAlert.title}
              </AlertTitle>
              <AlertDescription className="text-xs text-slate-600 mt-0.5">
                {showAlert.desc}
              </AlertDescription>
            </div>
          </Alert>
        </div>
      )}

      <Card className="bg-white border border-sky-100 shadow-xl shadow-slate-200/60 rounded-2xl p-6 sm:p-8">
        {/* Header with Icon */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Reset Password
          </CardTitle>
          <CardDescription className="text-sm text-slate-500 mt-1">
            Follow the 3 quick steps to recover and reset your account access
          </CardDescription>

          {/* Step Progress Indicators */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 mt-6 w-full max-w-xs">
            <div className="flex items-center gap-1.5">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${currentStep >= 1
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-400"
                  }`}
              >
                1
              </div>
              <span className="text-[11px] font-semibold text-slate-600 hidden sm:inline">
                Email
              </span>
            </div>
            <div
              className={`h-0.5 flex-1 transition-all ${currentStep >= 2 ? "bg-indigo-600" : "bg-slate-200"
                }`}
            />
            <div className="flex items-center gap-1.5">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${currentStep >= 2
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-400"
                  }`}
              >
                2
              </div>
              <span className="text-[11px] font-semibold text-slate-600 hidden sm:inline">
                OTP
              </span>
            </div>
            <div
              className={`h-0.5 flex-1 transition-all ${currentStep >= 3 ? "bg-indigo-600" : "bg-slate-200"
                }`}
            />
            <div className="flex items-center gap-1.5">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${currentStep >= 3
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-400"
                  }`}
              >
                3
              </div>
              <span className="text-[11px] font-semibold text-slate-600 hidden sm:inline">
                Reset
              </span>
            </div>
          </div>
        </div>

        <CardContent className="p-0 space-y-5">
          {/* Step 1: Email Form */}
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              SendEmail();
            }}
          >
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-semibold text-slate-700 flex justify-between">
                <span>Account Email</span>
                {showOtpField && (
                  <span className="text-emerald-600 text-xs font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Email sent
                  </span>
                )}
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                <Input
                  className="h-11 pl-10 pr-3.5 text-sm bg-white border-slate-200 rounded-xl focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 disabled:bg-slate-50 disabled:text-slate-500 transition-all"
                  placeholder="you@company.com"
                  type="email"
                  required={true}
                  value={auth.email}
                  disabled={showOtpField}
                  onChange={(e) => {
                    Setauth({ ...auth, email: e.target.value });
                  }}
                />
              </div>
            </div>

            {!showOtpField && (
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 text-sm font-semibold bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-700 hover:to-sky-600 text-white shadow-md shadow-indigo-500/20 cursor-pointer rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                <span>{loading ? "Sending OTP..." : "Send Verification OTP"}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </form>

          {/* Step 2: OTP Verification */}
          {showOtpField && (
            <form
              className="space-y-3 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300"
              onSubmit={(e) => {
                e.preventDefault();
                VerifyOTP();
              }}
            >
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs sm:text-sm font-semibold text-slate-700">
                    6-Digit Verification Code
                  </label>
                  {showTimer.show ? (
                    <span className="text-xs text-indigo-600 font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 animate-spin" />
                      Expires in {showTimer.timer}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => SendEmail()}
                      className="text-xs text-rose-600 hover:underline font-medium cursor-pointer"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>

                <div className="relative flex items-center">
                  <KeyRound className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                  <Input
                    className="h-11 pl-10 pr-3.5 text-sm bg-white border-slate-200 rounded-xl tracking-widest font-mono text-center sm:text-left focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 disabled:bg-slate-50 disabled:text-slate-500 transition-all"
                    placeholder="000000"
                    type="text"
                    maxLength={6}
                    minLength={6}
                    disabled={showChangePassword}
                    required={true}
                    value={auth.otp}
                    onChange={(e) => {
                      Setauth({ ...auth, otp: e.target.value });
                    }}
                  />
                </div>
              </div>

              {!showChangePassword && (
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 text-sm font-semibold bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-700 hover:to-sky-600 text-white shadow-md shadow-indigo-500/20 cursor-pointer rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                  <span>{loading ? "Verifying..." : "Verify OTP Code"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </form>
          )}

          {/* Step 3: Change Password Form */}
          {showChangePassword && (
            <form
              className="space-y-3 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300"
              onSubmit={(e) => {
                e.preventDefault();
                ChangePassword();
              }}
            >
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-semibold text-slate-700">
                  Enter New Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                  <Input
                    className="h-11 pl-10 pr-10 text-sm bg-white border-slate-200 rounded-xl focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 transition-all"
                    placeholder="Create a strong password"
                    type={showNewPassword ? "text" : "password"}
                    required={true}
                    minLength={8}
                    value={auth.newpass}
                    onChange={(e) => {
                      Setauth({ ...auth, newpass: e.target.value });
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => SetshowNewPassword(!showNewPassword)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 text-sm font-semibold bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white shadow-md shadow-emerald-500/20 cursor-pointer rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                <span>{loading ? "Updating..." : "Update Password & Return to Home"}</span>
                <CheckCircle2 className="w-4 h-4" />
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
