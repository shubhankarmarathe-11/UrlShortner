import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link2, Upload, Clipboard, Wand2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <>
      <div className="h-full bg-sky-50 p-5">
        <div className="flex justify-between items-center border-b-2 p-3">
          <h1 className="text-3xl text-primary font-bold cursor-pointer">
            <span className="flex items-center gap-3">
              <Link2 />
              SwiftLink
            </span>
          </h1>

          <span>
            <h1></h1>
            <h1></h1>
            <h1></h1>
            <h1></h1>
          </span>

          <span className="flex gap-3">
            <Button
              onClick={() => {
                navigate("/sign-in");
              }}
              className="px-3 cursor-pointer bg-transparent text-neutral hover:bg-transparent"
            >
              Login
            </Button>
            <Button
              onClick={() => {
                navigate("/register");
              }}
              className="px-3 cursor-pointer"
            >
              Signup
            </Button>
          </span>
        </div>

        <div className="flex flex-col items-center justify-center my-5 gap-5">
          <h1 className="text-7xl text-center font-bold lg:w-5xl my-5">
            Shorten your links,{" "}
            <span className="text-primary">broaden your reach</span>
          </h1>
          <p className="w-2xl text-center">
            The enterprise-grade link management platform. Create, share, and
            track high-performing short links in miliseconds.
          </p>

          <span className="bg-white flex p-3 justify-center items-center gap-2">
            <Input
              className="p-8 px-16"
              placeholder="Paste your long URL here"
              type="url"
            />
            <Button className="p-8 cursor-pointer px-10">Shorten</Button>
          </span>

          <div className="flex p-3 justify-center items-center gap-2 flex-col w-full my-10">
            <h1 className="font-bold text-2xl">How it works</h1>
            <p>Three simple steps to maximize your digital impact</p>

            <div className="flex justify-between w-full my-10">
              <span className="bg-white rounded-2xl p-5 flex flex-col gap-5 items-center justify-center">
                <h1 className="rounded-full bg-primary p-3">
                  <Clipboard size={50} className=" text-white" />
                </h1>
                <h1 className="text-2xl font-bold">Paste</h1>
                <p className="text-neutral">
                  Drop your long, messy link into our secure shortening engine.
                </p>
              </span>
              <span className="bg-white rounded-2xl p-5 flex flex-col gap-5 items-center justify-center">
                <h1 className="rounded-full bg-secondary p-3">
                  <Wand2 size={50} className="text-neutral" />
                </h1>
                <h1 className="text-2xl font-bold">Shorten</h1>
                <p className="text-neutral">
                  Customizze your alias or generate a memorable slug instantly
                </p>
              </span>
              <span className="bg-white rounded-2xl p-5 py-10 gap-5 flex flex-col items-center justify-center">
                <h1 className="rounded-full bg-primary p-3">
                  <Upload size={50} className="text-black" />
                </h1>
                <h1 className="text-2xl font-bold">Share</h1>
                <p className="text-neutral">
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
