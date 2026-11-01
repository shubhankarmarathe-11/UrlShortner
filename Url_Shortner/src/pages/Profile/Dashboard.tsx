import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  Link2,
  LogOut,
  Trash2,
  BarChart3,
  Copy,
  Check,
  ExternalLink,
  Calendar,
  Clock,
  Sparkles,
  Search,
  Plus,
  AlertCircle,
  Hash,
  Globe,
  Layers,
  Shuffle,
  RefreshCw,
  ShieldAlert,
  ArrowRight,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { generateRandomSlug } from "@/lib/utils";
import { isLoggedIn } from "@/store/Loggedin";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent } from "@/components/ui/card";
import {
  AUTH_URL,
  SHORT_URL,
  HOST_URL,
  REDIRECT_URL,
  safeJsonParse,
  getErrorMessage,
  performLogout,
  checkEmailAuthenticationStatus,
  checkPasswordAddedStatus,
} from "@/lib/api";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const SetisLogged = isLoggedIn((state) => state.makeLogged);
  const SetisLogout = isLoggedIn((state) => state.makeLogout);

  const blockOlddate = new Date().toISOString().slice(0, 16);

  const [shoLoader, SetshowLoader] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [authStatus, setAuthStatus] = useState<string | null>(null);
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);
  const [showAddPasswordModal, setShowAddPasswordModal] = useState(false);
  const [addPasswordInput, setAddPasswordInput] = useState("");
  const [showAddPasswordEye, setShowAddPasswordEye] = useState(false);
  const [isAddingPassword, setIsAddingPassword] = useState(false);
  const isMountedRef = useRef(true);
  const activeFetchIdRef = useRef(0);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showAlert, SetshowAlert] = useState({
    status: false,
    title: "",
    desc: "",
  });

  const alertTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [linkData, SetlinkData] = useState(() => {
    const initialUrl = location.state?.initialUrl || "";
    return {
      longlink: initialUrl,
      slug: initialUrl ? generateRandomSlug(8) : "",
      datetime: "",
    };
  });

  const handleUrlChange = (newUrl: string) => {
    SetlinkData((prev) => {
      // Auto-generate 8-character slug if slug is currently empty and user enters a URL
      const shouldAutoGenerate = newUrl.trim().length > 0 && !prev.slug.trim();
      return {
        ...prev,
        longlink: newUrl,
        slug: shouldAutoGenerate ? generateRandomSlug(8) : prev.slug,
      };
    });
  };

  const handleGenerateRandomSlug = () => {
    const newSlug = generateRandomSlug(8);
    SetlinkData((prev) => ({ ...prev, slug: newSlug }));
  };

  const [FetchedLinks, SetFetchedLinks] = useState<any[]>([]);

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

  async function CheckAuthStatus() {
    try {
      const status = await checkEmailAuthenticationStatus();
      if (isMountedRef.current) {
        setAuthStatus(status);
      }
    } catch {
      if (isMountedRef.current) {
        setAuthStatus("Internal server");
      }
    }
  }

  async function CheckPasswordStatus() {
    try {
      const status = await checkPasswordAddedStatus();
      if (isMountedRef.current) {
        setPasswordStatus(status);
      }
    } catch {
      if (isMountedRef.current) {
        setPasswordStatus("not added");
      }
    }
  }

  async function HandleAddAccountPassword() {
    const trimmedPassword = addPasswordInput.trim();
    if (!trimmedPassword) {
      ShowAlert(true, "Password Required", "Please enter a password.");
      return;
    }

    setIsAddingPassword(true);
    try {
      const res = await axios.put(
        `${AUTH_URL}/api/users/add_account_password`,
        { password: trimmedPassword },
        { withCredentials: true },
      );

      const resText =
        typeof res.data === "string"
          ? res.data.trim()
          : res.data?.message || res.data?.status || "";

      if (
        resText.toLowerCase().includes("password added") ||
        res.status === 200 ||
        res.status === 201
      ) {
        setPasswordStatus("added");
        setShowAddPasswordModal(false);
        setAddPasswordInput("");
        ShowAlert(true, "Success", "Password Added");
      } else if (resText.toLowerCase().includes("internal server error")) {
        ShowAlert(true, "Error", "Internal server error");
      } else {
        ShowAlert(true, "Notice", resText || "Password Added");
        setPasswordStatus("added");
        setShowAddPasswordModal(false);
        setAddPasswordInput("");
      }
    } catch (error: any) {
      const errData =
        typeof error?.response?.data === "string"
          ? error.response.data.trim()
          : error?.response?.data?.detail ||
            error?.response?.data?.message ||
            "";

      if (errData.toLowerCase().includes("internal server error")) {
        ShowAlert(true, "Error", "Internal server error");
      } else {
        ShowAlert(
          true,
          "Error",
          errData || getErrorMessage(error, "Internal server error"),
        );
      }
    } finally {
      setIsAddingPassword(false);
    }
  }

  function TriggerAuthenticateEmail() {
    navigate("/authenticate-email", {
      state: { fromDashboard: true },
    });
  }

  async function DeleteAccountFunction() {
    if (
      !window.confirm(
        "Are you sure you want to permanently delete your account? All your links and analytics will be removed.",
      )
    ) {
      return;
    }

    try {
      const res = await axios.delete(
        `${AUTH_URL}/api/users/accountdelete`,
        { withCredentials: true },
      );

      if (res.status === 202 || res.status === 200) {
        SetisLogout();
        navigate("/sign-in");
      }
    } catch (error: any) {
      ShowAlert(
        true,
        "Please try again",
        getErrorMessage(error, "Failed to delete account"),
      );
    }
  }

  async function LogoutFunction() {
    try {
      await performLogout();
      SetisLogout();
      navigate("/sign-in");
    } catch (error: any) {
      ShowAlert(
        true,
        "Please try again",
        getErrorMessage(error, "Logout failed"),
      );
    }
  }

  // Robust links request with automatic retry and race-condition safety
  async function GetActiveLinksFunction(showLoading = true) {
    const fetchId = ++activeFetchIdRef.current;
    if (showLoading) {
      SetshowLoader(true);
    } else {
      setIsRefreshing(true);
    }

    const maxRetries = 2;
    let attempt = 0;

    while (attempt <= maxRetries) {
      try {
        const res = await axios.get(
          `${SHORT_URL}/api/short/link`,
          { withCredentials: true, timeout: 10000 },
        );

        if (isMountedRef.current && fetchId === activeFetchIdRef.current) {
          const parsed = safeJsonParse<{ data?: any[] }>(res.data, { data: [] });
          SetFetchedLinks(parsed?.data || []);
          SetisLogged();
          SetshowLoader(false);
          setIsRefreshing(false);
        }
        return;
      } catch (error: any) {
        if (!isMountedRef.current || fetchId !== activeFetchIdRef.current) {
          return;
        }

        const errorMsg = error?.response?.data;
        const statusCode = error?.response?.status;

        if (errorMsg === "no data available") {
          SetFetchedLinks([]);
          SetshowLoader(false);
          setIsRefreshing(false);
          return;
        }

        if (
          errorMsg?.detail === "Unauthorized access" ||
          statusCode === 401 ||
          errorMsg === "refresh token expired"
        ) {
          SetisLogout();
          SetshowLoader(false);
          setIsRefreshing(false);
          return navigate("/sign-in");
        }

        const isNetworkOrServerError =
          !statusCode ||
          statusCode >= 500 ||
          error.code === "ECONNABORTED" ||
          error.message?.includes("Network Error");

        if (attempt < maxRetries && isNetworkOrServerError) {
          attempt++;
          await new Promise((resolve) => setTimeout(resolve, attempt * 450));
          continue;
        }

        ShowAlert(true, "Error", getErrorMessage(error, "Could not load links"));
        SetshowLoader(false);
        setIsRefreshing(false);
        return;
      }
    }
  }

  // Post request
  async function CreatelinkFunction() {
    if (!linkData.longlink.trim() || !linkData.slug.trim()) {
      ShowAlert(true, "Missing Fields", "Please provide both destination URL and custom slug.");
      return;
    }

    setIsSubmitting(true);
    try {
      const expireDate = linkData.datetime ? new Date(linkData.datetime).toISOString() : null;

      const res = await axios.post(
        `${SHORT_URL}/api/short/link`,
        {
          slug: linkData.slug.trim(),
          longlink: linkData.longlink.trim(),
          expiretime: expireDate,
        },
        { withCredentials: true },
      );

      if (res.status === 201 || res.status === 200) {
        SetlinkData({ datetime: "", longlink: "", slug: "" });
        ShowAlert(true, "Success", "Short link created successfully!");
        GetActiveLinksFunction();
      }
    } catch (error: any) {
      ShowAlert(
        true,
        "Please try again",
        getErrorMessage(error, "Failed to create link"),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  // Delete Request with Optimistic Update (Instant feedback)
  async function DeleteLinkFunction(link: string) {
    if (!window.confirm("Are you sure you want to delete this short link?")) {
      return;
    }

    // 1. Snapshot previous state for rollback
    const previousLinks = [...FetchedLinks];

    // 2. Optimistically remove item from UI immediately
    SetFetchedLinks((prev) => prev.filter((item) => item._id !== link));

    try {
      const res = await axios.delete(
        `${SHORT_URL}/api/short/link/${link}`,
        { withCredentials: true },
      );

      if (res.status === 201 || res.status === 200) {
        ShowAlert(true, "Deleted", "Link deleted successfully");
      }
    } catch (error: any) {
      // 3. Rollback state if network failed
      SetFetchedLinks(previousLinks);
      ShowAlert(
        true,
        "Failed to delete",
        getErrorMessage(error, "Failed to delete link"),
      );
    }
  }

  const handleCopyLink = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    } catch {
      ShowAlert(true, "Copy Error", "Failed to copy link to clipboard.");
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    GetActiveLinksFunction();
    CheckAuthStatus();
    CheckPasswordStatus();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  if (shoLoader) {
    return (
      <div className="flex flex-col gap-3 justify-center items-center bg-gradient-to-b from-sky-50 via-white to-sky-50 min-h-screen">
        <div className="w-16 h-16 rounded-2xl bg-white shadow-xl border border-sky-100 flex items-center justify-center">
          <Spinner className="size-8 text-indigo-600" />
        </div>
        <p className="text-sm font-medium text-slate-500 animate-pulse">
          Loading dashboard...
        </p>
      </div>
    );
  }

  // Filter links by search query
  const filteredLinks = FetchedLinks.filter((item: any) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.Slug?.toLowerCase().includes(q) ||
      item.LongUrl?.toLowerCase().includes(q)
    );
  });

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

      {/* Add Password Modal Dialog */}
      {showAddPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => {
                setShowAddPasswordModal(false);
                setAddPasswordInput("");
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Add Account Password</h3>
                <p className="text-xs text-slate-500">
                  Set a password for your account to sign in directly
                </p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                HandleAddAccountPassword();
              }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  New Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                  <Input
                    type={showAddPasswordEye ? "text" : "password"}
                    placeholder="Enter new password"
                    value={addPasswordInput}
                    onChange={(e) => setAddPasswordInput(e.target.value)}
                    className="h-11 pl-10 pr-10 text-sm bg-white border-slate-200 rounded-xl focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 transition-all"
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowAddPasswordEye(!showAddPasswordEye)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                  >
                    {showAddPasswordEye ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowAddPasswordModal(false);
                    setAddPasswordInput("");
                  }}
                  className="text-xs text-slate-600 hover:text-slate-800 h-9.5 px-3 rounded-xl cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isAddingPassword || !addPasswordInput.trim()}
                  className="h-9.5 px-4 text-xs font-semibold bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 text-white rounded-xl shadow-md shadow-indigo-500/20 cursor-pointer flex items-center gap-1.5 transition-all"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>{isAddingPassword ? "Adding Password..." : "Add password"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/80 border-b border-sky-100/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex justify-between items-center">
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Link2 className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 via-indigo-700 to-sky-600 bg-clip-text text-transparent">
                UrlShortner
              </span>
              <span className="text-[10px] text-slate-400 font-medium hidden sm:inline -mt-0.5">
                User Dashboard
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {authStatus === "not verified" && (
              <Button
                onClick={TriggerAuthenticateEmail}
                className="text-xs sm:text-sm font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md shadow-amber-500/25 rounded-lg px-3 sm:px-3.5 h-9 cursor-pointer flex items-center gap-1.5 transition-all"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Verify Email</span>
              </Button>
            )}

            {passwordStatus === "not added" && (
              <Button
                onClick={() => setShowAddPasswordModal(true)}
                className="text-xs sm:text-sm font-semibold bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 text-white shadow-md shadow-indigo-500/25 rounded-lg px-3 sm:px-3.5 h-9 cursor-pointer flex items-center gap-1.5 transition-all"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Add password</span>
              </Button>
            )}

            <Button
              onClick={DeleteAccountFunction}
              variant="ghost"
              className="text-xs sm:text-sm text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg px-2.5 sm:px-3 h-9 cursor-pointer flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Delete Account</span>
            </Button>
            <Button
              onClick={LogoutFunction}
              variant="outline"
              className="text-xs sm:text-sm text-slate-700 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/50 rounded-lg px-3 sm:px-4 h-9 cursor-pointer flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {/* Email Verification Banner */}
        {authStatus === "not verified" && (
          <div className="bg-gradient-to-r from-amber-50 via-orange-50/50 to-amber-50 border border-amber-200/90 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in fade-in duration-300">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 shadow-xs">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Your email is not verified</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 uppercase tracking-wider">
                    Action Required
                  </span>
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Verify your email address using the 6-digit verification code to authenticate your account.
                </p>
              </div>
            </div>
            <Button
              onClick={TriggerAuthenticateEmail}
              className="w-full sm:w-auto h-9.5 px-4 text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl shadow-md shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-1.5 shrink-0 transition-all"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Verify Email</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}

        {/* Add Password Banner */}
        {passwordStatus === "not added" && (
          <div className="bg-gradient-to-r from-indigo-50 via-sky-50/50 to-indigo-50 border border-indigo-200/90 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm animate-in fade-in duration-300">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 shadow-xs">
                <KeyRound className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Add Account Password</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 uppercase tracking-wider">
                    Password Not Set
                  </span>
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Set up a password for your account to sign in directly with email and password.
                </p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                HandleAddAccountPassword();
              }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto shrink-0"
            >
              <div className="relative flex items-center w-full sm:w-64">
                <Lock className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
                <Input
                  type={showAddPasswordEye ? "text" : "password"}
                  placeholder="Enter new password"
                  value={addPasswordInput}
                  onChange={(e) => setAddPasswordInput(e.target.value)}
                  className="h-9.5 pl-9 pr-9 text-xs sm:text-sm bg-white border-slate-200 rounded-xl focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowAddPasswordEye(!showAddPasswordEye)}
                  className="absolute right-2.5 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                >
                  {showAddPasswordEye ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              <Button
                type="submit"
                disabled={isAddingPassword || !addPasswordInput.trim()}
                className="h-9.5 px-4 text-xs font-semibold bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 text-white rounded-xl shadow-md shadow-indigo-500/20 cursor-pointer flex items-center justify-center gap-1.5 shrink-0 transition-all"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>{isAddingPassword ? "Adding..." : "Add password"}</span>
              </Button>
            </form>
          </div>
        )}

        {/* Quick Stats Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-white border-sky-100 shadow-sm rounded-2xl p-4 sm:p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Short Links
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
                {FetchedLinks.length}
              </h3>
            </div>
          </Card>

          <Card className="bg-white border-sky-100 shadow-sm rounded-2xl p-4 sm:p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Custom Slugs
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
                {FetchedLinks.filter((l) => l.Slug).length}
              </h3>
            </div>
          </Card>

          <Card className="bg-white border-sky-100 shadow-sm rounded-2xl p-4 sm:p-5 flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                authStatus === "verified"
                  ? "bg-emerald-50 text-emerald-600"
                  : authStatus === "not verified"
                  ? "bg-amber-50 text-amber-600"
                  : "bg-emerald-50 text-emerald-600"
              }`}
            >
              {authStatus === "not verified" ? (
                <ShieldAlert className="w-6 h-6" />
              ) : (
                <Clock className="w-6 h-6" />
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Account Status
              </p>
              <h3
                className={`text-2xl sm:text-3xl font-extrabold mt-0.5 ${
                  authStatus === "verified"
                    ? "text-emerald-600"
                    : authStatus === "not verified"
                    ? "text-amber-600 text-xl sm:text-2xl"
                    : "text-emerald-600"
                }`}
              >
                {authStatus === "verified"
                  ? "Verified"
                  : authStatus === "not verified"
                  ? "Unverified"
                  : "Live"}
              </h3>
            </div>
          </Card>
        </div>

        {/* Create Link Card */}
        <Card className="bg-white border border-sky-100 shadow-xl shadow-slate-200/50 rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Create a New Short Link
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Paste your destination URL, specify your custom alias, and set
                expiration
              </p>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              CreatelinkFunction();
            }}
            className="space-y-5"
          >
            {/* Long URL */}
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <Link2 className="w-4 h-4 text-indigo-500" />
                <span>Destination Long URL</span>
              </label>
              <Input
                type="url"
                placeholder="https://example.com/your-destination-link"
                value={linkData.longlink}
                onChange={(e) => handleUrlChange(e.target.value)}
                className="h-12 px-4 text-sm bg-white border-slate-200 rounded-xl focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 transition-all"
                required={true}
              />
            </div>

            {/* Slug & Date Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Slug Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                    <Hash className="w-4 h-4 text-indigo-500" />
                    <span>Custom Slug / Alias</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateRandomSlug}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Shuffle className="w-3 h-3" />
                    <span>Generate Random</span>
                  </button>
                </div>
                <div className="relative flex items-center">
                  <Input
                    type="text"
                    className="h-12 pl-4 pr-26 text-sm bg-white border-slate-200 rounded-xl focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 transition-all font-mono"
                    placeholder="e.g. 8-char alias or custom"
                    value={linkData.slug}
                    onChange={(e) => {
                      SetlinkData({ ...linkData, slug: e.target.value });
                    }}
                    required={true}
                  />
                  <button
                    type="button"
                    onClick={handleGenerateRandomSlug}
                    title="Generate random 8-character slug"
                    className="absolute right-1.5 h-9 px-3 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer border border-indigo-100/80 active:scale-95"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                    <span>Random</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Auto-fills when entering a URL, or click "Random" to generate an 8-character slug.
                </p>
              </div>

              {/* Expiration DateTime */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  <span>Expiration Date & Time</span>
                </label>
                <Input
                  min={blockOlddate}
                  className="h-12 px-4 text-sm bg-white border-slate-200 rounded-xl focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 transition-all"
                  type="datetime-local"
                  value={linkData.datetime}
                  onChange={(e) => {
                    SetlinkData({ ...linkData, datetime: e.target.value });
                  }}
                  required={true}
                />
              </div>
            </div>

            <Button
              className="h-12 px-8 text-sm sm:text-base font-semibold bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-700 hover:to-sky-600 text-white shadow-md shadow-indigo-500/25 cursor-pointer rounded-xl flex items-center gap-2 transition-all"
              type="submit"
              disabled={isSubmitting}
            >
              <Plus className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? "Generating Short Link..."
                  : "Create Short Link"}
              </span>
            </Button>
          </form>
        </Card>

        {/* Links List Section */}
        <section className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Your Active Links
              </h2>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                {FetchedLinks.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Search filter */}
              {FetchedLinks.length > 0 && (
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
                  <Input
                    type="text"
                    placeholder="Filter by slug or URL..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9.5 pl-9 pr-3 text-xs bg-white border-slate-200 rounded-lg focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500"
                  />
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => GetActiveLinksFunction(false)}
                disabled={isRefreshing}
                className="h-9.5 px-3 border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/60 rounded-lg flex items-center gap-1.5 cursor-pointer text-xs font-medium shrink-0 transition-all"
                title="Refresh Links"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-indigo-600" : ""}`}
                />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>

          {/* Cards Container */}
          <div className="space-y-4">
            {FetchedLinks.length === 0 ? (
              <div className="bg-white rounded-2xl border border-sky-100 p-10 sm:p-14 text-center shadow-sm flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mb-4">
                  <Link2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-800">
                  No short links created yet
                </h3>
                <p className="text-sm text-slate-500 max-w-sm mt-1">
                  Use the form above to create your first short link and start
                  tracking clicks!
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => GetActiveLinksFunction(false)}
                  disabled={isRefreshing}
                  className="mt-4 border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/60 rounded-lg flex items-center gap-1.5 cursor-pointer text-xs font-medium transition-all"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-indigo-600" : ""}`}
                  />
                  <span>Check for Links</span>
                </Button>
              </div>
            ) : filteredLinks.length === 0 ? (
              <div className="bg-white rounded-2xl border border-sky-100 p-8 text-center text-slate-500 text-sm">
                No links match "{searchQuery}"
              </div>
            ) : (
              filteredLinks.map((data: any) => {
                const shortUrl = `${HOST_URL}/${REDIRECT_URL}/${data.UserId}/${data.Slug}`;
                const isCopied = copiedId === data._id;
                const isExpired =
                  new Date(data.expireAt).getTime() < Date.now();

                return (
                  <Card
                    key={data._id}
                    className="group bg-white border border-sky-100 hover:border-indigo-200 hover:shadow-lg shadow-sm transition-all duration-200 rounded-2xl p-4 sm:p-6"
                  >
                    <CardContent className="p-0 space-y-4">
                      {/* Top Row: Slug, Expiration, and Actions */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
                            <span className="text-indigo-600 font-mono">/</span>
                            {data.Slug}
                          </span>
                          <span
                            className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                              isExpired
                                ? "bg-rose-100 text-rose-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {isExpired ? "Expired" : "Active"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Expires:</span>
                          <span className="font-medium text-slate-700">
                            {new Date(data.expireAt).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Middle Row: Long URL */}
                      <div className="space-y-1">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Target Destination
                        </span>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <a
                            href={data.LongUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="truncate hover:text-indigo-600 hover:underline flex items-center gap-1 max-w-full"
                          >
                            <span className="truncate">{data.LongUrl}</span>
                            <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-70" />
                          </a>
                        </div>
                      </div>

                      {/* Bottom Row: Short URL Box & Action Buttons */}
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2">
                        {/* Copyable Short URL */}
                        <div className="flex-1 flex items-center justify-between gap-2 bg-slate-50 border border-slate-200/80 rounded-xl p-2 sm:px-3 text-xs sm:text-sm">
                          <Link
                            to={shortUrl}
                            className="text-indigo-600 hover:text-indigo-700 font-mono font-medium truncate flex-1 hover:underline"
                            target="_blank"
                          >
                            {shortUrl}
                          </Link>
                          <Button
                            onClick={() => handleCopyLink(shortUrl, data._id)}
                            variant="ghost"
                            size="sm"
                            className={`h-8 px-2.5 text-xs font-semibold rounded-lg shrink-0 cursor-pointer transition-all ${
                              isCopied
                                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3.5 h-3.5 mr-1" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 mr-1 text-slate-500" />
                                <span>Copy</span>
                              </>
                            )}
                          </Button>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            className="h-9 px-3.5 text-xs sm:text-sm font-medium bg-indigo-50 hover:bg-indigo-100 text-indigo-700 cursor-pointer rounded-xl flex items-center gap-1.5 transition-colors shadow-none"
                            onClick={() => {
                              navigate(`/dashboard/${data._id}`);
                            }}
                          >
                            <BarChart3 className="w-4 h-4" />
                            <span>Analytics</span>
                          </Button>

                          <Button
                            className="h-9 px-3 text-xs sm:text-sm font-medium bg-rose-50 hover:bg-rose-100 text-rose-700 cursor-pointer rounded-xl flex items-center gap-1.5 transition-colors shadow-none"
                            onClick={() => {
                              DeleteLinkFunction(data._id);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
