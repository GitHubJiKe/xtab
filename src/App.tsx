import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Toaster } from "@/components/ui/toaster";
import "./index.css";
import dayjs from "dayjs";
import sitesArr from "./site.json";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
// import { Cross1Icon } from "@radix-ui/react-icons";
// import * as DialogPrimitive from "@radix-ui/react-dialog";

localStorage.setItem("sitesArr", JSON.stringify(sitesArr));

interface Site {
  name: string;
  url: string;
  icon: string;
}

function App() {
  const { toast } = useToast();
  const [timeNow, setNow] = useState(dayjs().format("HH:mm:ss"));
  const [today, setToday] = useState(dayjs().format("YYYY/MM/DD"));
  const [opened, setOpened] = useState(false);
  const [sites, setSites] = useState<Site[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("sitesArr") || "[]");
    } catch (error) {
      console.error(error);
      return sitesArr;
    }
  });
  const [siteName, setSiteName] = useState("");
  const [siteUrl, setSiteUrl] = useState("");

  const onAddSite = () => {
    if (!siteName || !siteUrl)
      return toast({ title: "请填写完整", variant: "destructive" });

    setSites((_sites: Site[]) => {
      const newSites = [
        ...(_sites || sitesArr),
        { name: siteName, url: siteUrl, icon: `${siteUrl}/favicon.ico` },
      ];

      localStorage.setItem("sitesArr", JSON.stringify(newSites));
      return newSites;
    });
  };

  useEffect(() => {
    let interval = setInterval(() => {
      setNow(dayjs().format("HH:mm:ss"));
    }, 1000);
    let interval2 = setInterval(() => {
      setToday(dayjs().format("YYYY/MM/DD"));
    }, 1000 * 60 * 60);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        clearInterval(interval);
        clearInterval(interval2);
      } else {
        interval = setInterval(() => {
          setNow(dayjs().format("HH:mm:ss"));
        }, 1000);
        interval2 = setInterval(() => {
          setToday(dayjs().format("YYYY/MM/DD"));
        }, 1000 * 60 * 60);
      }
    });
    return () => {
      clearInterval(interval);
      clearInterval(interval2);
    };
  }, []);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      window.open(`https://www.google.com/search?q=${e.target.value}`);
    }
  };
  return (
    <div className="App p-4">
      <header className="App-header mb-4">
        <h2
          className="text-center flex flex-col justify-center items-center"
          style={{ fontSize: "5rem", fontWeight: 900 }}
        >
          {today}
          <div
            className="text-coolGray text-center inline-block"
            style={{ fontSize: "2rem", fontWeight: 400 }}
          >
            {timeNow}
          </div>
        </h2>
      </header>
      <Input
        placeholder="Google一下"
        className="w-2xl mb-4"
        onKeyDown={onKeyDown}
      />
      <div className="flex gap-8 mb-4">
        {sites.map((site) => (
          <Card className="p-4" style={{ minWidth: 200 }}>
            <a
              href={site.url}
              className="flex items-center gap-2 cursor-pointer justify-between"
              target="_blank"
            >
              {site.name}
              <img src={site.icon} className="w-10 h-10" />
            </a>
          </Card>
        ))}
      </div>
      <Dialog>
        <DialogTrigger asChild>
          <Button
            className="absolute right-4 top-4"
            onClick={() => setOpened(true)}
          >
            添加
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加网站</DialogTitle>
            <DialogDescription>
              你可以自定义你常用的网站到XTab
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="网站名称"
            value={siteName}
            onChange={(e) => {
              setSiteName(e.target.value);
            }}
          />
          <Input
            placeholder="网站地址"
            value={siteUrl}
            onChange={(e) => {
              setSiteUrl(e.target.value);
            }}
          />
          <Button onClick={onAddSite}>添加</Button>{" "}
        </DialogContent>
      </Dialog>
      <Toaster />
    </div>
  );
}

export default App;
