import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { isLoggedIn } from "@/store/Loggedin";
import { Link2, Eye, EyeClosed } from "lucide-react";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import axios from "axios";

const Signup = () => {
  const navigate = useNavigate();

  const [auth, Setauth] = useState({ email: "", password: "", username: "" });
  const [showpassword, SetshowPassword] = useState(false);

  const isLogged = isLoggedIn((state: any) => state.Logged);
  const SetisLogged = isLoggedIn((state: any) => state.makeLogged);
  const SetisLogout = isLoggedIn((state: any) => state.makeLogout);

  const [shoLoader, SetshowLoader] = useState(true);

  const [showAlert, SetshowAlert] = useState({
    status: false,
    title: "",
    desc: "",
  });

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

  const ExistAlreadyInterceptor = async (google_token: string) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_AUTH_URL}/api/auth/google/login`,
        {
          google_token,
        },
        { withCredentials: true },
      );
      if (res.status == 201) {
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      }
    } catch (error: any) {
      ShowAlert(true, "Not Found", error.response.data);
      SetshowLoader(false);
    }
  };

  const handleSuccess = async (response: any) => {
    SetshowLoader(true);
    const google_token = response.credential;

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_AUTH_URL}/api/auth/google/signup`,
        {
          google_token,
        },
        { withCredentials: true },
      );
      if (res.status == 201) {
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      }
      console.log(res);
    } catch (error: any) {
      ShowAlert(true, "Not Found", error.response.data);
      if (error.response.data == "user exist already")
        return ExistAlreadyInterceptor(String(google_token));
    }
  };

  const SubmitSignup = async () => {
    console.log(auth);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_AUTH_URL}/api/auth/signup`,
        {
          username: auth.username,
          email: auth.email,
          password: auth.password,
        },
        { withCredentials: true },
      );

      if (res.status == 201) {
        SetisLogged();
        navigate("/dashboard");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const CheckIsLoggedIn = async () => {
    try {
      let res = await axios.get(
        `${import.meta.env.VITE_AUTH_URL}/api/auth/isloggedin`,
        { withCredentials: true },
      );

      console.log(res.data);

      if (res.status == 200) {
        SetisLogged();
        navigate("/dashboard");
      }
    } catch (error: any) {
      if (error.response.data == "refresh token expired") {
        SetisLogout();
        SetshowLoader(false);
      }
    }
  };

  useEffect(() => {
    if (isLogged) navigate("/dashboard");
    if (!isLogged) {
      CheckIsLoggedIn();
    }
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

      <div className="min-h-screen bg-sky-50 p-4 sm:p-5">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl text-primary font-bold cursor-pointer">
            <span className="flex items-center gap-2 sm:gap-3">
              <Link2 />
              UrlShortner
            </span>
          </h1>
          <Button
            onClick={() => {
              navigate("/");
            }}
            className="bg-transparent text-primary text-base sm:text-lg cursor-pointer hover:bg-transparent"
          >
            Back to Home
          </Button>
        </div>
        <div className="my-5 w-full flex justify-center items-center px-2">
          <Card className="w-full max-w-xl p-5 sm:p-8 flex flex-col items-center">
            <CardTitle className="text-center text-2xl font-bold">
              Create your account
            </CardTitle>
            <CardDescription className="text-center text-sm">
              Experience the future of link management
            </CardDescription>
            <CardContent className="w-full">
              <form
                className="flex flex-col w-full"
                onSubmit={(e) => {
                  e.preventDefault();
                  SubmitSignup();
                }}
              >
                <span className="flex justify-center my-3 rounded-2xl cursor-pointer">
                  <GoogleOAuthProvider
                    clientId={`${import.meta.env.VITE_GOOGLE_CLIENT_ID}`}
                  >
                    <GoogleLogin
                      text="signup_with"
                      size="large"
                      theme="outline"
                      width={"auto"}
                      onSuccess={handleSuccess}
                      onError={() => {}}
                    />
                  </GoogleOAuthProvider>
                </span>

                <h1 className="text-neutral text-center my-3">
                  OR CONTINUE WITH EMAIL
                </h1>

                <span className="my-3">
                  <h1 className="text-left">Full Name</h1>
                  <Input
                    className="py-6 my-1"
                    placeholder="John Doe"
                    value={auth.username}
                    onChange={(e) => {
                      Setauth({ ...auth, username: e.target.value });
                    }}
                  />
                </span>
                <span className="my-3">
                  <h1 className="text-left">Email Address</h1>
                  <Input
                    className="py-6 my-1"
                    placeholder="name@company.com"
                    value={auth.email}
                    onChange={(e) => {
                      Setauth({ ...auth, email: e.target.value });
                    }}
                  />
                </span>
                <span className="my-3">
                  <h1 className="text-left">Password</h1>
                  <span className="flex items-center gap-1 outline-1 rounded-md my-2 px-2 focus-visible:ring-2 focus-visible:ring-offset-2">
                    <Input
                      className="py-5 my-1 outline-none border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      placeholder="your password"
                      type={showpassword ? "text" : "password"}
                      value={auth.password}
                      onChange={(e) => {
                        Setauth({ ...auth, password: e.target.value });
                      }}
                    />
                    {showpassword ? (
                      <Eye
                        className="cursor-pointer"
                        onClick={() => {
                          SetshowPassword(!showpassword);
                        }}
                      />
                    ) : (
                      <EyeClosed
                        className="cursor-pointer"
                        onClick={() => {
                          SetshowPassword(!showpassword);
                        }}
                      />
                    )}
                  </span>
                  <h1 className="text-left text-neutral">
                    Enter at least 8 characters
                  </h1>
                </span>

                <Button className="bg-primary text-white w-full p-8 cursor-pointer my-3">
                  Create Account
                </Button>
              </form>
            </CardContent>
            <h1 className="font-bold">
              Already have an account?{" "}
              <span
                className="text-primary cursor-pointer"
                onClick={() => {
                  navigate("/sign-in");
                }}
              >
                Log in
              </span>
            </h1>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Signup;
