import { useNavigate, Link } from "react-router-dom";
import { Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { isLoggedIn } from "@/store/Loggedin";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent } from "@/components/ui/card";

const Dashboard = () => {
  const navigate = useNavigate();

  // const isLogged = isLoggedIn((state) => state.Logged);
  const SetisLogged = isLoggedIn((state: any) => state.makeLogged);
  const SetisLogout = isLoggedIn((state: any) => state.makeLogout);

  const blockOlddate = new Date().toISOString().slice(0, 16);

  const [shoLoader, SetshowLoader] = useState(true);

  const [showAlert, SetshowAlert] = useState({
    status: false,
    title: "",
    desc: "",
  });

  const [linkData, SetlinkData] = useState({
    longlink: "",
    slug: "",
    datetime: "",
  });

  const [reload, Setreload] = useState(true);

  const [FetchedLinks, SetFetchedLinks] = useState([]);

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

  async function DeleteAccountFunction() {
    try {
      let res = await axios.delete(
        `${import.meta.env.VITE_AUTH_URL}/api/auth/account`,
        { withCredentials: true },
      );

      if (res.data == "user deleted") return navigate("/sign-in");
    } catch (error: any) {
      ShowAlert(true, "please try again", error.response.data);
    }
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

  // post request
  async function CreatelinkFunction() {
    await CheckIsLoggedIn();

    try {
      let res = await axios.post(
        `${import.meta.env.VITE_SHORT_URL}/api/short/link`,
        {
          slug: linkData.slug,
          longlink: linkData.longlink,
          expiretime: new Date(linkData.datetime),
        },
        { withCredentials: true },
      );
      if (res.status == 201) {
        Setreload(!reload);
      }
    } catch (error: any) {
      ShowAlert(true, "please try again", error.response.data);
    }
  }

  // get Request

  async function GetActiveLinksFunction() {
    await CheckIsLoggedIn();

    try {
      let res = await axios.get(
        `${import.meta.env.VITE_SHORT_URL}/api/short/link`,
        { withCredentials: true },
      );
      console.log(res.data.data);
      SetFetchedLinks(res.data.data);
    } catch (error: any) {
      if (error.response.data != "no data available")
        ShowAlert(true, "Data not found", error.response.data);
    }
  }

  // delete Request

  async function DeleteLinkFunction(link: string) {
    try {
      let res = await axios.delete(
        `${import.meta.env.VITE_SHORT_URL}/api/short/link/${link}`,
        { withCredentials: true },
      );
      console.log(res);
    } catch (error: any) {
      ShowAlert(true, "please try again", error.response.data);
    }
  }

  useEffect(() => {
    CheckIsLoggedIn();
  }, []);

  useEffect(() => {
    GetActiveLinksFunction();
  }, [reload]);

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

        {/* header */}
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl sm:text-3xl text-primary font-bold cursor-pointer">
            <span className="flex items-center gap-2 sm:gap-3">
              <Link2 />
              SwiftLink
            </span>
          </h1>
          <span>
            <Button
              onClick={DeleteAccountFunction}
              className="bg-transparent text-red-600 text-base sm:text-lg cursor-pointer hover:bg-transparent"
            >
              Delete Account
            </Button>
          </span>
          <Button
            onClick={LogoutFunction}
            className="bg-transparent text-red-600 text-base sm:text-lg cursor-pointer hover:bg-transparent"
          >
            Logout
          </Button>
        </div>

        <div className="my-5 flex justify-center items-center">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              CreatelinkFunction();
            }}
            className="w-full max-w-3xl flex flex-col justify-center gap-4 sm:gap-5"
          >
            <h1 className="text-sm font-medium">Enter Long Url</h1>
            <Input
              type="url"
              placeholder="Enter Url"
              value={linkData.longlink}
              onChange={(e) => {
                SetlinkData({ ...linkData, longlink: e.target.value });
              }}
              className="p-5 border-2"
              required={true}
            />
            <h1 className="text-sm font-medium">Enter Slug</h1>
            <Input
              type="text"
              className="p-5 border-2"
              placeholder="Enter slug for short link"
              value={linkData.slug}
              onChange={(e) => {
                SetlinkData({ ...linkData, slug: e.target.value });
              }}
              required={true}
            />
            <h1 className="text-sm font-medium">Select Date and Time</h1>
            <Input
              min={blockOlddate}
              className="w-full sm:w-80 border-2"
              placeholder=""
              type="datetime-local"
              value={linkData.datetime}
              onChange={(e) => {
                SetlinkData({ ...linkData, datetime: e.target.value });
              }}
              required={true}
            />
            <Button className="w-fit cursor-pointer" type="submit">
              Submit
            </Button>
          </form>
        </div>

        <div className="my-5 w-full">
          <h1 className="my-5 text-2xl sm:text-3xl text-center">
            Active Links
          </h1>
          <span className="flex flex-col gap-5 my-8 sm:my-14 items-center justify-center px-0 sm:px-4">
            {FetchedLinks.length == 0 ? (
              <h1 className="text-center text-lg my-5">No Data Found</h1>
            ) : (
              FetchedLinks.map((data: any) => {
                return (
                  <div key={data._id} className="w-full max-w-4xl">
                    <Card className="group border hover:shadow-xl transition-all duration-300 rounded-2xl p-3 sm:p-5 bg-card">
                      <CardContent className="space-y-4 sm:space-y-5">
                        {/* Long URL */}
                        <div>
                          <p className="text-sm text-muted-foreground font-medium">
                            Long URL
                          </p>

                          <p className="truncate text-base mt-1">
                            {data.LongUrl}
                          </p>
                        </div>

                        {/* Slug + Expiry */}
                        <div className="flex flex-wrap gap-4 sm:gap-5 items-center">
                          <div className="flex flex-col">
                            <p className="text-sm text-muted-foreground">
                              Slug
                            </p>

                            <span className="font-semibold text-lg">
                              {data.Slug}
                            </span>
                          </div>

                          <div className="flex flex-col">
                            <p className="text-sm text-muted-foreground">
                              Expire At
                            </p>

                            <span className="rounded-full w-fit px-3 py-1 bg-red-100 text-red-600 text-sm">
                              {new Date(data.expireAt).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <span className="flex flex-wrap items-center gap-3 sm:gap-8">
                          <Button
                            className="bg-green-600 cursor-pointer text-sm sm:text-base"
                            onClick={() => {
                              navigate(`/dashboard/${data.LinkAnalytics[0]}`);
                            }}
                          >
                            View Analytics
                          </Button>
                          <Button
                            className="bg-red-600 cursor-pointer text-sm sm:text-base"
                            onClick={() => {
                              DeleteLinkFunction(data._id);
                            }}
                          >
                            Delete
                          </Button>
                        </span>

                        {/* Short URL */}
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Short Link
                          </p>

                          <div className="flex items-center justify-between gap-2 sm:gap-3 border rounded-xl p-2 sm:p-3 overflow-hidden">
                            <Link
                              to={`${
                                import.meta.env.VITE_SHORT_URL
                              }/${data.UserId}/${data.Slug}`}
                              className="text-violet-600 hover:text-violet-500 underline break-all font-medium text-xs sm:text-sm min-w-0 flex-1"
                            >
                              {import.meta.env.VITE_SHORT_URL}/{data.UserId}/
                              {data.Slug}
                            </Link>

                            <button
                              onClick={() =>
                                navigator.clipboard.writeText(
                                  `${import.meta.env.VITE_SHORT_URL}/${data.UserId}/${data.Slug}`,
                                )
                              }
                              className="shrink-0 px-2 sm:px-3 py-2 rounded-lg bg-violet-600 text-white hover:scale-105 transition text-xs sm:text-sm"
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })
            )}
          </span>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
