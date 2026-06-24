import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link2, Upload, Clipboard, Wand2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <>
      <div className="min-h-screen bg-sky-50 p-4 sm:p-5">
        <div className="flex justify-between items-center border-b-2 p-2 sm:p-3">
          <h1 className="text-2xl sm:text-3xl text-primary font-bold cursor-pointer">
            <span className="flex items-center gap-2 sm:gap-3">
              <Link2 />
              SwiftLink
            </span>
          </h1>

          <span className="flex gap-2 sm:gap-3">
            <Button
              onClick={() => {
                navigate("/sign-in");
              }}
              className="px-2 sm:px-3 cursor-pointer bg-transparent text-neutral hover:bg-transparent text-sm sm:text-base"
            >
              Login
            </Button>
            <Button
              onClick={() => {
                navigate("/register");
              }}
              className="px-2 sm:px-3 cursor-pointer text-sm sm:text-base"
            >
              Signup
            </Button>
          </span>
        </div>

        <div className="flex flex-col items-center justify-center my-5 gap-5">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-center font-bold w-full max-w-5xl my-5 px-2">
            Shorten your links,{" "}
            <span className="text-primary">broaden your reach</span>
          </h1>
          <p className="text-center px-4 max-w-2xl">
            The enterprise-grade link management platform. Create, share, and
            track high-performing short links in miliseconds.
          </p>

          <span className="bg-white flex flex-col sm:flex-row p-3 justify-center items-center gap-2 w-full max-w-2xl rounded-xl">
            <Input
              className="p-6 sm:p-8 w-full"
              placeholder="Paste your long URL here"
              type="url"
            />
            <Button className="p-6 sm:p-8 cursor-pointer w-full sm:w-auto px-6 sm:px-10">
              Shorten
            </Button>
          </span>

          <div className="flex p-3 justify-center items-center gap-2 flex-col w-full my-6 sm:my-10">
            <h1 className="font-bold text-2xl">How it works</h1>
            <p className="text-center">Three simple steps to maximize your digital impact</p>

            <div className="flex flex-col sm:flex-row justify-between w-full my-6 sm:my-10 gap-4 sm:gap-3">
              <span className="bg-white rounded-2xl p-5 flex flex-col gap-5 items-center justify-center flex-1">
                <h1 className="rounded-full bg-primary p-3">
                  <Clipboard size={50} className=" text-white" />
                </h1>
                <h1 className="text-2xl font-bold">Paste</h1>
                <p className="text-neutral text-center">
                  Drop your long, messy link into our secure shortening engine.
                </p>
              </span>
              <span className="bg-white rounded-2xl p-5 flex flex-col gap-5 items-center justify-center flex-1">
                <h1 className="rounded-full bg-secondary p-3">
                  <Wand2 size={50} className="text-neutral" />
                </h1>
                <h1 className="text-2xl font-bold">Shorten</h1>
                <p className="text-neutral text-center">
                  Customizze your alias or generate a memorable slug instantly
                </p>
              </span>
              <span className="bg-white rounded-2xl p-5 py-8 gap-5 flex flex-col items-center justify-center flex-1">
                <h1 className="rounded-full bg-primary p-3">
                  <Upload size={50} className="text-black" />
                </h1>
                <h1 className="text-2xl font-bold">Share</h1>
                <p className="text-neutral text-center">
                  Distribute your link across any platform and watch the traffic
                  grow
                </p>
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LandingPage;
