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

  const isLogged = isLoggedIn((state) => state.Logged);
  const SetisLogged = isLoggedIn((state) => state.makeLogged);
  const SetisLogout = isLoggedIn((state) => state.makeLogout);

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
      console.log(res);
    } catch (error: any) {
      console.log(error);
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
      console.log(error);
      ShowAlert(true, "please try again", error.response.data);
    }
  }

  useEffect(() => {
    CheckIsLoggedIn();
  }, []);

  useEffect(() => {
    GetActiveLinksFunction();
  }, []);

  if (shoLoader) {
    return (
      <>
        <div className="flex justify-center items-center bg-sky-50 h-screen">
          <Spinner className="size-8" />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="h-screen bg-sky-50 p-5">
        {showAlert.status ? (
          <span className="absolute w-full flex items-center justify-center ">
            <Alert className="w-80 bg-neutral">
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
        <div className="flex justify-between items-center">
          <h1 className="text-3xl text-primary font-bold cursor-pointer">
            <span className="flex items-center gap-3">
              <Link2 />
              SwiftLink
            </span>
          </h1>
          <Button
            onClick={LogoutFunction}
            className="bg-transparent text-red-600 text-lg cursor-pointer hover:bg-transparent"
          >
            Logout
          </Button>
        </div>

        <div className="my-5 flex justify-center items-center ">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              CreatelinkFunction();
            }}
            className="w-6xl flex flex-col justify-center gap-5"
          >
            <h1>Enter Long Url</h1>
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
            <h1>Enter Slug</h1>
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
            <h1>Select Date and Time</h1>
            <Input
              className="w-80 border-2"
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

        <div className="my-5 w-screen">
          <h1 className="my-5 text-3xl text-center">Active Links</h1>
          <span className="flex flex-col gap-5 my-14 items-center justify-center">
            {FetchedLinks.map((data) => {
              return (
                <div className="w-4xl ">
                  <Card
                    key={data._id}
                    className="p-3 cursor-pointer bg-transparent"
                  >
                    <CardContent>
                      <span className="m-2 flex flex-col gap-2">
                        <p className="font-bold">Long Url</p>
                        <h1>{data.LongUrl}</h1>
                      </span>
                      <span className="m-2 flex flex-col gap-2">
                        <p className="font-bold ">Slug </p>
                        <h1>{data.Slug}</h1>
                      </span>
                      <span className="m-2 flex flex-col gap-2">
                        <p className="font-bold ">ExpireAT</p>
                        <h1>{data.expireAt}</h1>
                      </span>
                      <span className="m-2 flex flex-col gap-2">
                        <p className="font-bold ">ShortLink</p>
                        <h1>
                          <Link
                            to={`${import.meta.env.VITE_SHORT_URL}/${data.UserId}/${data.Slug}`}
                            className="text-violet-700 underline"
                          >
                            {import.meta.env.VITE_SHORT_URL}/{data.UserId}/
                            {data.Slug}
                          </Link>
                        </h1>
                      </span>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </span>
        </div>

        {/* dashboard */}
      </div>
    </>
  );
};

export default Dashboard;
