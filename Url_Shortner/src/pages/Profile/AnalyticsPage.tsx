import { Button } from "@/components/ui/button";
import {
  Link2,
  ArrowLeft,
  LogOut,
  MousePointerClick,
  Users,
  Zap,
  Globe,
  Clock,
  Laptop,
  Smartphone,
  Tablet,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { isLoggedIn } from "@/store/Loggedin";
import { Spinner } from "@/components/ui/spinner";
import { useState, useEffect, useRef } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import {
  SHORT_URL,
  safeJsonParse,
  getErrorMessage,
  performLogout,
} from "@/lib/api";

type Analytics = {
  userip: string;
  clickedAt: string;
  userAgent: string;
  browser: string;
  os: string;
  deviceType: string;
  referer: string;
  responseTimeMs: number | null;
  _id: string;
};

function AnalyticsTable({ data }: { data: Analytics[] }) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-sky-100 p-10 sm:p-14 text-center shadow-sm flex flex-col items-center">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mb-3">
          <MousePointerClick className="w-7 h-7" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-slate-800">
          No click events recorded yet
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mt-1">
          Share your short link to start tracking real-time visitor IPs, browsers, and devices!
        </p>
      </div>
    );
  }

  const getDeviceIcon = (type: string) => {
    const t = type?.toLowerCase() || "";
    if (t.includes("mobile") || t.includes("phone")) {
      return <Smartphone className="w-3.5 h-3.5" />;
    }
    if (t.includes("tablet") || t.includes("ipad")) {
      return <Tablet className="w-3.5 h-3.5" />;
    }
    return <Laptop className="w-3.5 h-3.5" />;
  };

  return (
    <div className="rounded-2xl border border-sky-100 bg-white overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <Table className="w-full text-left">
          <TableHeader className="bg-slate-50/80 border-b border-slate-100">
            <TableRow>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 py-3.5 px-4">
                Visitor IP
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 py-3.5 px-4">
                Timestamp
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 py-3.5 px-4">
                Browser & Client
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 py-3.5 px-4">
                OS
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 py-3.5 px-4">
                Device
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 py-3.5 px-4">
                Referer
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 py-3.5 px-4 text-right">
                Response
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-slate-100 text-sm">
            {data.map((item, index) => (
              <TableRow
                key={item._id || index}
                className="hover:bg-sky-50/40 transition-colors"
              >
                {/* IP Address */}
                <TableCell className="py-3.5 px-4 font-mono text-xs font-medium text-slate-700">
                  <span className="bg-slate-100 px-2 py-1 rounded-md text-slate-800">
                    {item.userip || "Unknown"}
                  </span>
                </TableCell>

                {/* Clicked At */}
                <TableCell className="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap">
                  {new Date(item.clickedAt).toLocaleString()}
                </TableCell>

                {/* Browser & Client */}
                <TableCell className="py-3.5 px-4 max-w-xs">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-800 text-xs sm:text-sm">
                      {item.browser || "Unknown"}
                    </span>
                    <span
                      title={item.userAgent}
                      className="text-[11px] text-slate-400 truncate max-w-[200px]"
                    >
                      {item.userAgent || "-"}
                    </span>
                  </div>
                </TableCell>

                {/* OS */}
                <TableCell className="py-3.5 px-4 text-xs text-slate-700">
                  <span className="bg-slate-100 px-2 py-0.5 rounded-full font-medium text-slate-700">
                    {item.os || "Unknown"}
                  </span>
                </TableCell>

                {/* Device Type */}
                <TableCell className="py-3.5 px-4">
                  <span className="inline-flex items-center gap-1.5 capitalize rounded-full px-2.5 py-0.5 text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {getDeviceIcon(item.deviceType)}
                    <span>{item.deviceType || "Desktop"}</span>
                  </span>
                </TableCell>

                {/* Referer */}
                <TableCell className="py-3.5 px-4 text-xs text-slate-600 max-w-[180px]">
                  {item.referer && item.referer !== "-" ? (
                    <a
                      href={item.referer}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-indigo-600 hover:underline flex items-center gap-1 truncate"
                    >
                      <span className="truncate">{item.referer}</span>
                      <ExternalLink className="w-3 h-3 shrink-0 opacity-70" />
                    </a>
                  ) : (
                    <span className="text-slate-400">Direct / None</span>
                  )}
                </TableCell>

                {/* Response Time */}
                <TableCell className="py-3.5 px-4 text-right">
                  {item.responseTimeMs !== null && item.responseTimeMs !== undefined ? (
                    <span
                      className={`inline-block text-xs font-mono font-semibold px-2 py-0.5 rounded-md ${
                        item.responseTimeMs < 100
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : item.responseTimeMs < 300
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {item.responseTimeMs} ms
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">-</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export const AnalyticsPage = () => {
  const navigate = useNavigate();
  let { _id } = useParams();

  const SetisLogged = isLoggedIn((state) => state.makeLogged);
  const SetisLogout = isLoggedIn((state) => state.makeLogout);

  const [shoLoader, SetshowLoader] = useState(true);

  const [showAlert, SetshowAlert] = useState({
    status: false,
    title: "",
    desc: "",
  });

  const alertTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [FetchData, SetFetchData] = useState<Analytics[]>([]);
  const [ClickedCount, SetClickedCount] = useState(0);

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

  const FetchAnalytics = async (signal?: AbortSignal) => {
    try {
      const res = await axios.get(
        `${SHORT_URL}/api/short/link/${_id}`,
        { withCredentials: true, signal },
      );

      const parsed = safeJsonParse<{ data?: any }>(res.data, {});
      const dataObj = parsed?.data?.data || parsed?.data || {};

      SetClickedCount(dataObj.ClickedCount || 0);
      SetFetchData(dataObj.Data || []);
      SetisLogged();
    } catch (error: any) {
      if (axios.isCancel(error)) return;

      const errorMsg = error?.response?.data;
      if (
        errorMsg === "refresh token expired" ||
        errorMsg?.detail === "Unauthorized access" ||
        error?.response?.status === 401
      ) {
        SetisLogout();
        navigate("/sign-in");
      } else {
        ShowAlert(true, "Error", getErrorMessage(error, "Failed to load analytics"));
      }
    } finally {
      SetshowLoader(false);
    }
  };

  async function LogoutFunction() {
    try {
      await performLogout();
      SetisLogout();
      navigate("/sign-in");
    } catch (error: any) {
      ShowAlert(true, "Please try again", getErrorMessage(error, "Logout failed"));
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    FetchAnalytics(controller.signal);

    return () => {
      controller.abort();
    };
  }, [_id]);

  if (shoLoader) {
    return (
      <div className="flex flex-col gap-3 justify-center items-center bg-gradient-to-b from-sky-50 via-white to-sky-50 min-h-screen">
        <div className="w-16 h-16 rounded-2xl bg-white shadow-xl border border-sky-100 flex items-center justify-center">
          <Spinner className="size-8 text-indigo-600" />
        </div>
        <p className="text-sm font-medium text-slate-500 animate-pulse">
          Loading analytics...
        </p>
      </div>
    );
  }

  // Calculate quick metrics
  const uniqueVisitors = new Set(FetchData.map((d) => d.userip)).size;
  const validLatencies = FetchData.filter((d) => typeof d.responseTimeMs === "number");
  const avgLatency =
    validLatencies.length > 0
      ? Math.round(
          validLatencies.reduce((acc, curr) => acc + (curr.responseTimeMs || 0), 0) /
            validLatencies.length,
        )
      : null;

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

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/80 border-b border-sky-100/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate("/dashboard")}
              variant="ghost"
              className="p-2 sm:px-3 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline font-medium text-sm">Dashboard</span>
            </Button>
            <div className="h-5 w-px bg-slate-200 hidden sm:block" />
            <div
              onClick={() => navigate("/")}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-xs">
                <Link2 className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-900 text-lg hidden sm:inline">
                UrlShortner
              </span>
            </div>
          </div>

          <Button
            onClick={LogoutFunction}
            variant="outline"
            className="text-xs sm:text-sm text-slate-700 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/50 rounded-lg px-3 sm:px-4 h-9 cursor-pointer flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {/* Page Title & Breadcrumb */}
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
            Real-Time Analytics
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
            Link Performance & Clickstream
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tracking traffic, referer sources, device intelligence, and response latencies
          </p>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: Total Clicks */}
          <Card className="bg-white border-sky-100 shadow-sm rounded-2xl p-5">
            <CardContent className="p-0 space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Total Clicks
                </span>
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <MousePointerClick className="w-4 h-4" />
                </div>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-indigo-600">
                {ClickedCount}
              </h2>
              <p className="text-xs text-slate-400">Recorded click events</p>
            </CardContent>
          </Card>

          {/* Card 2: Unique Visitors */}
          <Card className="bg-white border-sky-100 shadow-sm rounded-2xl p-5">
            <CardContent className="p-0 space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Unique IPs
                </span>
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-sky-600">
                {uniqueVisitors}
              </h2>
              <p className="text-xs text-slate-400">Distinct visitor IPs</p>
            </CardContent>
          </Card>

          {/* Card 3: Avg Latency */}
          <Card className="bg-white border-sky-100 shadow-sm rounded-2xl p-5">
            <CardContent className="p-0 space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Avg Latency
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-emerald-600">
                {avgLatency !== null ? `${avgLatency}ms` : "-"}
              </h2>
              <p className="text-xs text-slate-400">Redirect response time</p>
            </CardContent>
          </Card>

          {/* Card 4: Logged Sessions */}
          <Card className="bg-white border-sky-100 shadow-sm rounded-2xl p-5">
            <CardContent className="p-0 space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Stream Logs
                </span>
                <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-violet-600">
                {FetchData.length}
              </h2>
              <p className="text-xs text-slate-400">Detailed sessions</p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Detailed Table */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Detailed Visitor Logs
              </h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {FetchData.length}
              </span>
            </div>
          </div>

          <AnalyticsTable data={FetchData} />
        </section>
      </main>
    </div>
  );
};

