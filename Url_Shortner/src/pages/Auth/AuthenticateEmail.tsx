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
import { useNavigate, useLocation } from "react-router-dom";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AUTH_URL, EMAIL_URL, getErrorMessage } from "@/lib/api";
import { isLoggedIn } from "@/store/Loggedin";
import {
  Mail,
  KeyRound,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Link2,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

export function AuthenticateEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const SetisLogged = isLoggedIn((state) => state.makeLogged);

  // Email passed from Google login/signup or dashboard via navigate state
  const initialEmail = (location.state?.email as string) || "";
  const isFromGoogle = Boolean(location.state?.fromGoogle || initialEmail);

  const [auth, Setauth] = useState({
    email: initialEmail,
    otp: "",
  });

  const [showOtpField, SetshowOtpField] = useState(false);
  const [showTimer, SetshowTimer] = useState({ show: false, timer: 60 });
  const [loading, Setloading] = useState(false);

  const [showAlert, SetshowAlert] = useState({
    status: false,
    title: "",
    desc: "",
  });

  const alertTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    if (!auth.email.trim()) {
      ShowAlert(true, "Email Required", "Please enter your email address.");
      return;
    }

    Setloading(true);
    try {
      const emailHtml = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
  <div style="text-align: center; margin-bottom: 28px;">
    <div style="display: inline-block; width: 48px; height: 48px; line-height: 48px; background: linear-gradient(135deg, #4f46e5, #0ea5e9); color: #ffffff; border-radius: 12px; font-weight: bold; font-size: 20px;">
      &#128279;
    </div>
    <h2 style="color: #0f172a; margin: 16px 0 6px 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">UrlShortner</h2>
    <p style="color: #64748b; font-size: 14px; margin: 0;">Email Verification</p>
  </div>
  <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; border: 1px solid #f1f5f9; text-align: center;">
    <p style="color: #334155; font-size: 15px; margin: 0 0 16px 0; line-height: 1.5;">
      We received a request to authenticate your email for your UrlShortner account. Use the verification code below to complete the process:
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
      If you did not initiate this request, you can safely ignore this email.
    </p>
  </div>
</div>
`.trim();

      const res = await axios.post(
        `${EMAIL_URL}/api/email`,
        {
          email: auth.email.trim(),
          subject: "Email Verification Code - UrlShortner",
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
            : res.data?.message ||
                "Verification code sent! Please check your inbox and spam folder.",
        );
      }
    } catch (error: any) {
      ShowAlert(
        true,
        "Failed to send email",
        getErrorMessage(error, "Could not send verification code"),
      );
    } finally {
      Setloading(false);
    }
  }

  async function VerifyOTP() {
    if (!auth.otp || auth.otp.trim().length !== 6) {
      ShowAlert(
        true,
        "Invalid OTP",
        "Please enter the complete 6-digit verification code.",
      );
      return;
    }

    Setloading(true);
    try {
      let res;
      try {
        res = await axios.post(
          `${AUTH_URL}/api/users/authenticate_email`,
          {
            otp: auth.otp.trim(),
            email: auth.email.trim(),
          },
          { withCredentials: true },
        );
      } catch (err: any) {
        if (err?.response?.status === 405) {
          res = await axios.put(
            `${AUTH_URL}/api/users/authenticate_email`,
            {
              otp: auth.otp.trim(),
              email: auth.email.trim(),
            },
            { withCredentials: true },
          );
        } else {
          throw err;
        }
      }

      const resData =
        typeof res.data === "string"
          ? res.data.trim()
          : res.data?.message || res.data?.detail || res.data?.status || "";

      if (
        resData.toLowerCase() === "correct otp" ||
        resData.toLowerCase().includes("correct otp") ||
        res.status === 200 ||
        res.status === 201
      ) {
        SetisLogged();
        ShowAlert(
          true,
          "Email Authenticated",
          "correct otp! Redirecting to dashboard...",
        );
        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
      } else if (
        resData.toLowerCase() === "wrong otp" ||
        resData.toLowerCase().includes("wrong otp")
      ) {
        ShowAlert(true, "Verification Failed", "wrong otp");
      } else {
        ShowAlert(
          true,
          "Email Authenticated",
          resData || "Email verified successfully! Redirecting to dashboard...",
        );
        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
      }
    } catch (error: any) {
      const errMsg =
        typeof error?.response?.data === "string"
          ? error.response.data.trim()
          : error?.response?.data?.detail ||
            error?.response?.data?.message ||
            "";

      if (
        errMsg.toLowerCase() === "wrong otp" ||
        errMsg.toLowerCase().includes("wrong otp")
      ) {
        ShowAlert(true, "Verification Failed", "wrong otp");
      } else {
        ShowAlert(
          true,
          "Verification Failed",
          getErrorMessage(error, "Invalid or expired OTP code"),
        );
      }
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

  const currentStep = showOtpField ? 2 : 1;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-sky-50/60 text-slate-800 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification */}
      {showAlert.status && (
        <div className="fixed top-5 left-0 right-0 z-50 flex items-center justify-center px-4 pointer-events-none animate-in fade-in slide-in-from-top-4 duration-300">
          <Alert className="w-full max-w-md bg-white border border-indigo-200 shadow-xl shadow-slate-300/50 rounded-xl p-4 flex gap-3 items-start pointer-events-auto">
            <AlertCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
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

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/70 border-b border-sky-100/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex justify-between items-center">
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Link2 className="w-5 h-5" />
            </div>
            <span className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 via-indigo-700 to-sky-600 bg-clip-text text-transparent">
              UrlShortner
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => navigate("/dashboard")}
              variant="ghost"
              className="text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/60 font-medium text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer"
            >
              <span>Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
            <Button
              onClick={() => navigate("/sign-in")}
              variant="ghost"
              className="text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/60 font-medium text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Content Container */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-xl animate-in fade-in duration-300">
          <Card className="bg-white border border-sky-100 shadow-xl shadow-slate-200/60 rounded-2xl p-6 sm:p-8">
            {/* Header with Icon */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 shadow-xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Authenticate Email
              </CardTitle>
              <CardDescription className="text-sm text-slate-500 mt-1 max-w-md">
                Verify your email address using the 6-digit verification code to authenticate your account
              </CardDescription>

              {/* Step Progress Indicators */}
              <div className="flex items-center justify-center gap-2 sm:gap-4 mt-6 w-full max-w-xs">
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      currentStep >= 1
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    1
                  </div>
                  <span className="text-[11px] font-semibold text-slate-600">
                    Email
                  </span>
                </div>
                <div
                  className={`h-0.5 flex-1 transition-all ${
                    currentStep >= 2 ? "bg-indigo-600" : "bg-slate-200"
                  }`}
                />
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      currentStep >= 2
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    2
                  </div>
                  <span className="text-[11px] font-semibold text-slate-600">
                    Verify OTP
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
                  <label className="text-xs sm:text-sm font-semibold text-slate-700 flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <span>Account Email</span>
                      {isFromGoogle && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                          <Sparkles className="w-3 h-3 text-indigo-500" /> Google Account
                        </span>
                      )}
                    </span>
                    {showOtpField && (
                      <span className="text-emerald-600 text-xs font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> OTP sent
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
                    <span>
                      {loading ? "Sending OTP..." : "Send Verification OTP"}
                    </span>
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
                          className="text-xs text-indigo-600 hover:underline font-medium cursor-pointer"
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
                        required={true}
                        value={auth.otp}
                        onChange={(e) => {
                          Setauth({ ...auth, otp: e.target.value });
                        }}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 text-sm font-semibold bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-700 hover:to-sky-600 text-white shadow-md shadow-indigo-500/20 cursor-pointer rounded-xl flex items-center justify-center gap-2 transition-all"
                  >
                    <span>
                      {loading ? "Verifying OTP..." : "Verify OTP & Continue to Dashboard"}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </form>
              )}

              {/* Skip / Return option */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="text-xs text-slate-400 hover:text-indigo-600 font-medium cursor-pointer transition-colors"
                >
                  Return to Dashboard &rarr;
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default AuthenticateEmail;
