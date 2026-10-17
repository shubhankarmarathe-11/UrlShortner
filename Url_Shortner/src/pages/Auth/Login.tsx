import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { isLoggedIn } from "@/store/Loggedin";
import { Input } from "@/components/ui/input";
import {
  Link2,
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  LogIn,
} from "lucide-react";
import axios from "axios";
import { useState, useRef, useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";
import { ForgetPassword } from "./ForgetPass";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AUTH_URL, getErrorMessage } from "@/lib/api";

const Login = () => {
  const navigate = useNavigate();

  const [auth, Setauth] = useState({ email: "", password: "" });
  const [showpassword, SetshowPassword] = useState(false);

  const SetisLogged = isLoggedIn((state) => state.makeLogged);
  const SetisLogout = isLoggedIn((state) => state.makeLogout);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showForget, SetshowForget] = useState(false);

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

  const NotFoundInterceptor = async (google_token: string) => {
    try {
      const res = await axios.post(
        `${AUTH_URL}/api/auth/google/signup`,
        { google_token },
        { withCredentials: true }
      );
      if (res.status === 201 || res.status === 200) {
        SetisLogged();
        navigate("/dashboard");
      }
    } catch (error: any) {
      ShowAlert(true, "Registration Failed", getErrorMessage(error, "Signup failed"));
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSuccess = async (response: any) => {
    setGoogleLoading(true);
    const google_token = response.credential;

    try {
      const res = await axios.post(
        `${AUTH_URL}/api/auth/google/login`,
        { google_token },
        { withCredentials: true }
      );
      if (res.status === 201 || res.status === 200) {
        SetisLogged();
        navigate("/dashboard");
      }
    } catch (error: any) {
      // Check if user doesn't exist BEFORE showing any false alarm alert!
      if (error?.response?.data === "user not found" || error?.response?.data?.detail === "user not found") {
        return NotFoundInterceptor(String(google_token));
      }
      ShowAlert(true, "Authentication Failed", getErrorMessage(error, "Login failed"));
      setGoogleLoading(false);
    }
  };

  const SubmitLogin = async () => {
    if (!auth.email || !auth.password) {
      ShowAlert(true, "Missing Fields", "Please enter both email and password.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await axios.post(
        `${AUTH_URL}/api/auth/login`,
        {
          username: "",
          email: auth.email,
          password: auth.password,
          sub: "",
          picture: "",
        },
        { withCredentials: true }
      );

      if (res.status === 200 || res.status === 201) {
        SetisLogged();
        navigate("/dashboard");
      }
    } catch (error: any) {
      ShowAlert(true, "Login Error", getErrorMessage(error, "Invalid credentials"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-sky-50/60 text-slate-800 flex flex-col selection:bg-indigo-500 selection:text-white">
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

          {showForget ? (
            <Button
              onClick={() => SetshowForget(false)}
              variant="ghost"
              className="text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/60 font-medium text-sm sm:text-base flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Login</span>
            </Button>
          ) : (
            <Button
              onClick={() => navigate("/")}
              variant="ghost"
              className="text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/60 font-medium text-sm sm:text-base flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Button>
          )}
        </div>
      </header>

      {/* Content Container */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        {showForget ? (
          <div className="w-full max-w-xl animate-in fade-in duration-300">
            <ForgetPassword />
          </div>
        ) : (
          <div className="w-full max-w-md animate-in fade-in duration-300">
            <Card className="bg-white border border-sky-100 shadow-xl shadow-slate-200/60 rounded-2xl p-6 sm:p-8">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 shadow-xs">
                  <LogIn className="w-6 h-6" />
                </div>
                <CardTitle className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  Welcome Back
                </CardTitle>
                <CardDescription className="text-sm text-slate-500 mt-1">
                  Enter your credentials to access your account dashboard
                </CardDescription>
              </div>

              <CardContent className="p-0">
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    SubmitLogin();
                  }}
                >
                  {/* Email Field */}
                  <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm font-semibold text-slate-700">
                      Email Address
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                      <Input
                        className="h-11 pl-10 pr-3.5 text-sm bg-white border-slate-200 rounded-xl focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 transition-all"
                        placeholder="you@company.com"
                        type="email"
                        required={true}
                        value={auth.email}
                        onChange={(e) => {
                          Setauth({ ...auth, email: e.target.value });
                        }}
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs sm:text-sm font-semibold text-slate-700">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => SetshowForget(true)}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>

                    <div className="relative flex items-center">
                      <Lock className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                      <Input
                        className="h-11 pl-10 pr-10 text-sm bg-white border-slate-200 rounded-xl focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 transition-all"
                        placeholder="Enter your password"
                        type={showpassword ? "text" : "password"}
                        required={true}
                        value={auth.password}
                        onChange={(e) => {
                          Setauth({ ...auth, password: e.target.value });
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => SetshowPassword(!showpassword)}
                        className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                      >
                        {showpassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Sign In Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting || googleLoading}
                    className="w-full h-11 text-sm sm:text-base font-semibold bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-700 hover:to-sky-600 text-white shadow-md shadow-indigo-500/20 cursor-pointer rounded-xl flex items-center justify-center gap-2 group transition-all mt-2 disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner className="w-4 h-4 mr-1 text-white" />
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </Button>

                  {/* Divider */}
                  <div className="relative my-5">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-3 text-slate-400 font-semibold tracking-wider">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  {/* Google Login */}
                  <div className="flex flex-col items-center justify-center my-2 gap-2">
                    {googleLoading && (
                      <div className="flex items-center gap-2 text-xs text-indigo-600 font-medium">
                        <Spinner className="w-3.5 h-3.5" />
                        <span>Verifying with Google...</span>
                      </div>
                    )}
                    <GoogleOAuthProvider
                      clientId={`${import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}`}
                    >
                      <GoogleLogin
                        text="signin_with"
                        size="large"
                        theme="outline"
                        width="340"
                        onSuccess={handleSuccess}
                        onError={() => {
                          setGoogleLoading(false);
                          ShowAlert(true, "Google Sign-In Failed", "Google authentication was cancelled or failed.");
                        }}
                      />
                    </GoogleOAuthProvider>
                  </div>
                </form>

                {/* Footer Switcher */}
                <div className="mt-6 pt-5 border-t border-slate-100 text-center text-sm text-slate-600">
                  <span>Don't have an account? </span>
                  <button
                    type="button"
                    onClick={() => navigate("/register")}
                    className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
                  >
                    Create account
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default Login;
