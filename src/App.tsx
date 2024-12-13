import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import "./index.css";
import dayjs from "dayjs";
import sites from "./site.json";
import { useEffect, useState } from "react";

function App() {
  const [timeNow, setNow] = useState(dayjs().format("HH:mm:ss"));

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(dayjs().format("HH:mm:ss"));
    }, 1000);
    return () => {
      clearInterval(interval);
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
          className="text-center"
          style={{ fontSize: "5rem", fontWeight: 900 }}
        >
          {dayjs().format("YYYY/MM/DD")}
          <div
            className="text-coolGray"
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
          <Card className="p-4">
            <a
              href={site.url}
              className="flex items-center gap-2 cursor-pointer"
              target="_blank"
            >
              {site.name}
              <img src={site.icon} className="w-10 h-10" />
            </a>
          </Card>
        ))}
      </div>
      <Button>确定</Button>
    </div>
  );
}

export default App;
