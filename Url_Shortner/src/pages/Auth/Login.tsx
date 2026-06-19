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
import { Mail, Link2, Eye, EyeClosed } from "lucide-react";
import axios from "axios";
import { useEffect, useState } from "react";

import { Spinner } from "@/components/ui/spinner";
import { ForgetPassword } from "./ForgetPass";

const Login = () => {
  const navigate = useNavigate();

  const [auth, Setauth] = useState({ email: "", password: "" });
  const [showpassword, SetshowPassword] = useState(false);

  const isLogged = isLoggedIn((state) => state.Logged);
  const SetisLogged = isLoggedIn((state) => state.makeLogged);
  const SetisLogout = isLoggedIn((state) => state.makeLogout);

  const [shoLoader, SetshowLoader] = useState(true);
  const [showForget, SetshowForget] = useState(false);

  const SubmitLogin = async () => {
    try {
      SetshowLoader(true);
      const res = await axios.post(
        `${import.meta.env.VITE_AUTH_URL}/api/auth/login`,
        {
          email: auth.email,
          password: auth.password,
        },
        { withCredentials: true },
      );
      if (res.status == 201) {
        await SetisLogged();
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
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
        <div className="flex justify-center items-center bg-sky-50 h-screen">
          <Spinner className="size-8" />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="h-screen bg-sky-50 p-5">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl text-primary font-bold cursor-pointer">
            <span className="flex items-center gap-3">
              <Link2 />
              SwiftLink
            </span>
          </h1>
          {showForget ? (
            <Button
              onClick={() => {
                SetshowForget(false);
              }}
              className="bg-transparent text-primary text-lg cursor-pointer hover:bg-transparent"
            >
              Back to Login
            </Button>
          ) : (
            <Button
              onClick={() => {
                navigate("/");
              }}
              className="bg-transparent text-primary text-lg cursor-pointer hover:bg-transparent"
            >
              Back to Home
            </Button>
          )}
        </div>
        {showForget ? (
          <ForgetPassword />
        ) : (
          <div className="my-5 w-full flex justify-center items-center">
            <Card className="w-xl p-8 flex flex-col items-center">
              <CardTitle className="text-center text-2xl text-black font-bold">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-center  ">
                Enter your credentials to access your dashboard
              </CardDescription>
              <CardContent className="">
                <form
                  className="flex flex-col "
                  onSubmit={(e) => {
                    e.preventDefault();
                    SubmitLogin();
                  }}
                >
                  <span className="my-3">
                    <h1 className="text-left">Email Address</h1>
                    <Input
                      className="py-6 my-1"
                      placeholder="name@company.com"
                      type="email"
                      required={true}
                      value={auth.email}
                      onChange={(e) => {
                        Setauth({ ...auth, email: e.target.value });
                      }}
                    />
                  </span>
                  <span className="my-3">
                    <span className="flex justify-between">
                      <h1 className="text-left">Password</h1>
                      <h1
                        className="text-primary cursor-pointer "
                        onClick={() => {
                          SetshowForget(true);
                        }}
                      >
                        Forgot Password?
                      </h1>
                    </span>
                    <span className="flex items-center gap-1 outline-1 rounded-md my-2 px-2 focus-visible:ring-2 focus-visible:ring-offset-2">
                      <Input
                        className="py-5 my-1 outline-none border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                        placeholder="your password"
                        type={showpassword ? "text" : "password"}
                        required={true}
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

                  <Button className="bg-primary text-white w-96 p-8 cursor-pointer my-3">
                    Sign In
                  </Button>

                  <h1 className="text-neutral text-center my-3">
                    OR CONTINUE WITH
                  </h1>
                  <span className="flex justify-center my-3 border border-black rounded-2xl cursor-pointer">
                    <Button className="cursor-pointer p-6 text-neutral bg-white hover:bg-white">
                      <Mail />
                      Google
                    </Button>
                  </span>
                </form>
              </CardContent>
              <h1 className="font-bold">
                Don't have an account?{" "}
                <span
                  className="text-primary cursor-pointer "
                  onClick={() => {
                    navigate("/register");
                  }}
                >
                  Sign up
                </span>
              </h1>
            </Card>
          </div>
        )}
      </div>
    </>
  );
};

export default Login;
