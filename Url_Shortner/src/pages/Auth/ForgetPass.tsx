import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export function ForgetPassword() {
  const [auth, Setauth] = useState({ email: "", otp: "", newpass: "" });
  const [showOtpField, SetshowOtpField] = useState(false);
  const [showTimer, SetshowTimer] = useState({ show: false, timer: 60 });
  const [showChangePassword, SetshowChangePassword] = useState(false);
  const [showAlert, SetshowAlert] = useState({
    status: false,
    title: "",
    desc: "",
  });

  const navigate = useNavigate();

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

  async function SendEmail() {
    try {
      let res = await axios.post(
        `${import.meta.env.VITE_EMAIL_URL}/api/verify-email`,
        {
          email: auth.email,
          type: "otp",
          data: { appName: "UrlShortner" },
        },
        { withCredentials: true },
      );

      console.log(res.data);
      if (res.data == "email sent please check your spam also") {
        SetshowOtpField(true);
        SetshowTimer({ ...showTimer, show: true, timer: showTimer.timer - 1 });
        ShowAlert(true, "success", res.data);
      }
    } catch (error: any) {
      ShowAlert(true, "please try again", error.response.data);
    }
  }

  async function VerifyOTP() {
    try {
      let res = await axios.post(
        `${import.meta.env.VITE_AUTH_URL}/api/auth/verifyotp`,
        {
          email: auth.email,
          otp: auth.otp,
        },
        { withCredentials: true },
      );

      if (res.data == "correct otp") {
        SetshowChangePassword(true);
        ShowAlert(true, "success", res.data);
      }
    } catch (error: any) {
      ShowAlert(true, "please try again", error.response.data);
    }
  }

  async function ChangePassword() {
    try {
      let res = await axios.post(
        `${import.meta.env.VITE_AUTH_URL}/api/auth/forgot-password`,
        {
          email: auth.email,
          newPassword: auth.newpass,
        },
        { withCredentials: true },
      );

      if (res.data == "user updated") {
        await ShowAlert(true, "success", res.data);
        setTimeout(() => {
          return navigate("/");
        }, 5000);
      }
    } catch (error: any) {
      console.log(error);

      ShowAlert(true, "please try again", error.response.data);
    }
  }

  useEffect(() => {
    setTimeout(() => {
      if (showTimer.timer == 0) {
        return SetshowTimer({ show: false, timer: 60 });
      }
      if (showTimer.show == true) {
        return SetshowTimer({ ...showTimer, timer: showTimer.timer - 1 });
      }
    }, 1000);
  }, [showTimer.timer]);

  return (
    <>
      <div className="py-4 sm:py-5">
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
        <div className="my-5 w-full flex justify-center items-center px-2">
          <Card className="w-full max-w-xl p-5 sm:p-8 flex flex-col items-center">
            <CardTitle className="text-center text-2xl text-black font-bold">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-center">
              Enter your email to generate otp
            </CardDescription>
            <CardContent className="w-full">
              <form
                className="flex flex-col w-full"
                onSubmit={(e) => {
                  e.preventDefault();
                  SendEmail();
                }}
              >
                <span className="my-3 flex flex-col gap-2 w-full">
                  <h1 className="text-left">Email Address</h1>
                  <Input
                    className="py-6 my-1 w-full"
                    placeholder="name@company.com"
                    type="email"
                    required={true}
                    value={auth.email}
                    disabled={showOtpField ? true : false}
                    onChange={(e) => {
                      Setauth({ ...auth, email: e.target.value });
                    }}
                  />
                  <Button
                    type="submit"
                    className="w-fit cursor-pointer"
                    disabled={showOtpField ? true : false}
                  >
                    Send OTP
                  </Button>
                </span>
              </form>

              <form
                className="flex flex-col w-full"
                onSubmit={(e) => {
                  e.preventDefault();
                  VerifyOTP();
                }}
              >
                {/* enter otp  */}
                {showOtpField ? (
                  <>
                    <span className="my-3 flex flex-col gap-2 w-full">
                      <h1 className="text-left">Enter OTP</h1>
                      <Input
                        className="py-6 my-1"
                        placeholder="000000"
                        type="text"
                        maxLength={6}
                        minLength={6}
                        disabled={showChangePassword ? true : false}
                        required={true}
                        value={auth.otp}
                        onChange={(e) => {
                          Setauth({ ...auth, otp: e.target.value });
                        }}
                      />
                      {showTimer.show ? (
                        <h1 className="text-red-600">
                          Otp Expires in {showTimer.timer}
                        </h1>
                      ) : (
                        <h1 className="text-red-600">Otp Expired</h1>
                      )}

                      <>
                        <Button
                          className="w-fit cursor-pointer"
                          type="submit"
                          disabled={showChangePassword ? true : false}
                        >
                          Verify OTP
                        </Button>
                      </>
                    </span>
                  </>
                ) : null}
              </form>

              <form
                className="flex flex-col w-full"
                onSubmit={(e) => {
                  e.preventDefault();
                  ChangePassword();
                }}
              >
                {/* enter otp  */}
                {showChangePassword ? (
                  <>
                    <span className="my-3 flex flex-col gap-2 w-full">
                      <h1 className="text-left">Enter New Password</h1>
                      <Input
                        className="py-6 my-1"
                        placeholder="new password"
                        type="text"
                        required={true}
                        value={auth.newpass}
                        onChange={(e) => {
                          Setauth({ ...auth, newpass: e.target.value });
                        }}
                      />
                      <Button className="w-fit cursor-pointer" type="submit">
                        Change Password
                      </Button>
                    </span>
                  </>
                ) : null}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
