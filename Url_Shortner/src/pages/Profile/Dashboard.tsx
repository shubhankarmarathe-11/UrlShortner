import { useNavigate } from "react-router-dom";
import { Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import axios from "axios";
import { Input } from "@/components/ui/input";

const Dashboard = () => {
  const navigate = useNavigate();
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

        <div className="my-5">
          <Input />
        </div>

        {/* dashboard */}
      </div>
    </>
  );
};

export default Dashboard;
