import { Button } from "@/components/ui/button";
import { Link2 } from "lucide-react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { isLoggedIn } from "@/store/Loggedin";
import { Spinner } from "@/components/ui/spinner";
import { useState, useEffect } from "react";
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
  return (
    <div className="rounded-xl border overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>IP</TableHead>

            <TableHead>Clicked At</TableHead>

            <TableHead>Browser</TableHead>

            <TableHead>OS</TableHead>

            <TableHead>Device</TableHead>

            <TableHead>Referer</TableHead>

            <TableHead>Response</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((item, index) => (
            <TableRow key={index}>
              <TableCell>{item.userip}</TableCell>

              <TableCell>{new Date(item.clickedAt).toLocaleString()}</TableCell>

              <TableCell>
                <div>
                  <p className="font-medium">{item.browser}</p>

                  <p className="text-xs text-muted-foreground truncate max-w-[250px]">
                    {item.userAgent}
                  </p>
                </div>
              </TableCell>

              <TableCell>{item.os}</TableCell>

              <TableCell>
                <span className="capitalize rounded-md px-2 py-1 bg-secondary">
                  {item.deviceType}
                </span>
              </TableCell>

              <TableCell>
                <div className="truncate max-w-[180px]">
                  {item.referer || "-"}
                </div>
              </TableCell>

              <TableCell>
                {item.responseTimeMs ? `${item.responseTimeMs} ms` : "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export const AnalyticsPage = () => {
  const navigate = useNavigate();

  let { _id } = useParams();

  const isLogged = isLoggedIn((state) => state.Logged);
  const SetisLogged = isLoggedIn((state) => state.makeLogged);
  const SetisLogout = isLoggedIn((state) => state.makeLogout);

  const [shoLoader, SetshowLoader] = useState(true);

  const [showAlert, SetshowAlert] = useState({
    status: false,
    title: "",
    desc: "",
  });

  const [FetchData, SetFetchData] = useState<[]>([]);
  const [ClickedCount, SetClickedCount] = useState(0);

  const CheckIsLoggedIn = async () => {
    try {
      let res = await axios.get(
        `${import.meta.env.VITE_AUTH_URL}/api/auth/isloggedin`,
        { withCredentials: true },
      );

      if (res.status == 200) {
        SetisLogged();
        SetshowLoader(false);
      }
    } catch (error: any) {
      if (error.response.data == "refresh token expired") {
        SetisLogout();
        SetshowLoader(false);
        navigate("/sign-in");
      }
    }
  };

  const FetchAnalytics = async () => {
    try {
      let res = await axios.get(
        `${import.meta.env.VITE_SHORT_URL}/api/short/link/${_id}`,
        { withCredentials: true },
      );
      SetClickedCount(res.data.data.data.ClickedCount);
      SetFetchData(res.data.data.data.Data);
    } catch (error: any) {
      if (error.response.data == "refresh token expired") {
        SetisLogout();
        SetshowLoader(false);
        navigate("/sign-in");
      }
    }
  };

  async function ShowAlert(status: boolean, title: string, desc: string) {
    SetshowAlert({
      status: status,
      title: title,
      desc: desc,
    });
    setTimeout(() => {
      SetshowAlert({ status: false, title: "", desc: "" });
    }, 4000);
  }

  async function LogoutFunction() {
    try {
      let res = await axios.post(
        `${import.meta.env.VITE_AUTH_URL}/api/auth/logout`,
        {},
        { withCredentials: true },
      );

      if (res.data == "logout successful") return navigate("/sign-in");
    } catch (error: any) {
      ShowAlert(true, "please try again", error.response.data);
    }
  }

  useEffect(() => {
    CheckIsLoggedIn();
  }, []);

  useEffect(() => {
    FetchAnalytics();
  }, []);

  if (shoLoader) {
    return (
      <>
        <div className="flex justify-center items-center bg-sky-50 min-h-screen">
          <Spinner className="size-8" />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-sky-50 p-4 sm:p-5">
        {showAlert.status ? (
          <span className="fixed top-4 left-0 right-0 z-50 flex items-center justify-center px-4">
            <Alert className="w-full max-w-sm bg-neutral">
              <AlertTitle className="text-lg text-white">
                {showAlert.title}
              </AlertTitle>
              <AlertDescription className="text-white text-sm">
                {showAlert.desc}
              </AlertDescription>
            </Alert>
          </span>
        ) : null}

        <div className="flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl text-primary font-bold cursor-pointer">
            <span className="flex items-center gap-2 sm:gap-3">
              <Link2 />
              SwiftLink
            </span>
          </h1>
          <Button
            onClick={LogoutFunction}
            className="bg-transparent text-red-600 text-base sm:text-lg cursor-pointer hover:bg-transparent"
          >
            Logout
          </Button>
        </div>

        <div className="p-3 sm:p-5 flex flex-col gap-8 sm:gap-15">
          <Card className="w-fit min-w-[200px] sm:min-w-[250px] p-4 sm:p-5 rounded-2xl">
            <CardContent className="space-y-2">
              <p className="text-muted-foreground">Link Clicked</p>

              <h1 className="text-4xl sm:text-5xl font-black text-violet-600">
                {ClickedCount}
              </h1>

              <p className="text-sm text-muted-foreground">Total Visits</p>
            </CardContent>
          </Card>
          <div>
            <h1 className="text-xl sm:text-2xl my-3 font-bold">Details - </h1>
            <AnalyticsTable data={FetchData} />
          </div>
        </div>
      </div>
    </>
  );
};
