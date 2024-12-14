import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Toaster } from "@/components/ui/toaster";
import "./index.css";
import "./App.css";
import dayjs from "dayjs";
import sitesArr from "./site.json";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { CrossCircledIcon } from "@radix-ui/react-icons";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Badge } from "@/components/ui/badge";
import { ThemeProvider } from "./components/theme-provider";
import { ThemeToggle } from "./components/theme-toggle";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TodoList } from "./module/todolist";

function initStorage() {
  let _sitesArr = sitesArr;
  const sites = JSON.parse(localStorage.getItem("sitesArr") || "[]");
  if (sites.length < sitesArr.length) {
    _sitesArr = [..._sitesArr, ...sites];
  }
  localStorage.setItem("sitesArr", JSON.stringify(_sitesArr));
}

initStorage();

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
  const [alertOpened, setAlertOpened] = useState(false);
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
  const [deleteSite, setDeleteSite] = useState<Site | null>(null);

  const [isSimple, setIsSimple] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("isSimple") || "false");
    } catch (error) {
      console.error(error);
      return false;
    }
  });
  const [isEditing, setIsEditing] = useState(false);

  const [searchList, setSearchList] = useState<
    Array<{ keyword: string; time: string }>
  >(() => {
    try {
      const list = JSON.parse(localStorage.getItem("searchList") || "[]");
      return list.filter(
        (item: {
          time: string | number | dayjs.Dayjs | Date | null | undefined;
        }) => {
          return dayjs(item.time).isSame(dayjs(), "day");
        }
      );
    } catch (error) {
      console.error(error);
      return [];
    }
  });

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

    setSiteName("");
    setSiteUrl("");
    setOpened(false);
  };

  const onDeleteSite = (site: Site) => {
    setSites((_sites: Site[]) => {
      const newSites = _sites.filter((_site) => _site.url !== site.url);
      localStorage.setItem("sitesArr", JSON.stringify(newSites));
      return newSites;
    });
    setAlertOpened(false);
  };

  const onDelete = (site: Site) => {
    setAlertOpened(true);
    setDeleteSite(site);
  };

  const onConfirmDelete = () => {
    setAlertOpened(false);
    deleteSite && onDeleteSite(deleteSite);
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
      searchList.push({
        keyword: e.target.value,
        time: dayjs().format("YYYY/MM/DD HH:mm:ss"),
      });

      setSearchList([...searchList]);
      window.open(`https://www.google.com/search?q=${e.target.value}`);
    }
  };

  useEffect(() => {
    localStorage.setItem("searchList", JSON.stringify(searchList));
    return () => {};
  }, [searchList]);

  useEffect(() => {
    localStorage.setItem("isSimple", JSON.stringify(isSimple));
    return () => {};
  }, [isSimple]);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="p-4 min-w-[900px]">
        <header className="App-header mb-4 flex justify-between">
          <ThemeToggle />
          <h1
            className="text-center flex justify-center items-center flex-col gap-0"
            style={{ fontSize: "5rem", fontWeight: 900 }}
          >
            XTab
            <label
              className="ml-4"
              style={{ fontSize: ".6rem", fontWeight: 600, color: "#bbb" }}
            >
              {today}~{timeNow}
            </label>
          </h1>
          <Button
            variant={isSimple ? "default" : "secondary"}
            onClick={() => setIsSimple(!isSimple)}
          >
            精简
          </Button>
        </header>
        <div className="mb-20 text-center flex justify-center mt-4">
          <Input
            placeholder="Google一下"
            style={{ width: "25%" }}
            onKeyDown={onKeyDown}
          />
        </div>
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={40} minSize={20}>
            <h2 className="mb-4 text-lg">常用站点</h2>
            <div className="flex gap-4 mb-4 w-auto flex-wrap max-h-[40vh] overflow-y-auto">
              {sites.map((site) => (
                <Card
                  key={site.url}
                  className="px-6 py-3 relative"
                  style={{ width: 200, height: 40 }}
                >
                  <a
                    href={site.url}
                    className={`flex items-center gap-2 cursor-pointer ${
                      isSimple ? "justify-center" : "justify-between"
                    } h-full text-sm`}
                    target="_blank"
                  >
                    {site.name}
                    {!isSimple && <img src={site.icon} className="w-5 h-5" />}
                  </a>
                  {isEditing && (
                    <CrossCircledIcon
                      className="cursor-pointer absolute right-1 bottom-1"
                      onClick={() => onDelete(site)}
                    />
                  )}
                </Card>
              ))}
            </div>
            <div className="flex mr-4">
              <Button
                size={"sm"}
                variant={"secondary"}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "取消" : "编辑"}
              </Button>
              <Button
                className="ml-4"
                size={"sm"}
                onClick={() => setOpened(true)}
              >
                添加
              </Button>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={20} minSize={20}>
            <h2 className="mb-4 ml-4 text-lg">今日搜索</h2>
            <div className="flex gap-4 mb-4 ml-4 w-auto flex-wrap overflow-y-auto max-h-[40vh]">
              {searchList.map((item, index) => {
                return (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() =>
                      window.open(
                        `https://www.google.com/search?q=${item.keyword}`
                      )
                    }
                    style={{
                      fontSize: "0.8rem",
                      padding: "0.2rem 0.4rem",
                      borderRadius: "0.2rem",
                      height: 24,
                    }}
                  >
                    {item.keyword}
                  </Badge>
                );
              })}
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={40} minSize={40}>
            <h2 className="mb-4 ml-4 text-lg">代办事项</h2>
            <div className="ml-4">
              <TodoList />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
        <Dialog.Root open={opened} onOpenChange={setOpened}>
          <Dialog.Portal>
            <Dialog.Overlay className="DialogOverlay" />
            <Dialog.Content className="DialogContent">
              <Dialog.Title className="DialogTitle">添加网站</Dialog.Title>
              <Dialog.Description className="DialogDescription">
                填写网站名称和地址
              </Dialog.Description>
              <Input
                className="mb-4"
                placeholder="网站名称"
                value={siteName}
                onChange={(e) => {
                  setSiteName(e.target.value);
                }}
              />
              <Input
                className="mb-4"
                placeholder="网站地址"
                value={siteUrl}
                onChange={(e) => {
                  setSiteUrl(e.target.value);
                }}
              />
              <div className="flex justify-end gap-4">
                <Button onClick={() => setOpened(false)} variant={"secondary"}>
                  取消
                </Button>
                <Button onClick={onAddSite}>添加</Button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        <Toaster />

        <AlertDialog open={alertOpened}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle> 你确定要删除这个网站吗？</AlertDialogTitle>
              <AlertDialogDescription>
                这个操作无法撤销，你的数据将被永久删除。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setAlertOpened(false)}>
                取消
              </AlertDialogCancel>
              <AlertDialogAction onClick={onConfirmDelete}>
                确定
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ThemeProvider>
  );
}

export default App;
