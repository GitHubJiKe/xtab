import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Toaster } from "@/components/ui/toaster";
import "./index.css";
import "./App.css";
import dayjs from "dayjs";
import sitesArr from "./site.json";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  CrossCircledIcon,
  HamburgerMenuIcon,
  Cross1Icon,
  CopyIcon,
} from "@radix-ui/react-icons";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
// import component 👇
import Drawer from "react-modern-drawer";
import { ToastContainer, toast as toastify } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";
//import styles 👇
import "react-modern-drawer/dist/index.css";

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
import { Textarea } from "./components/ui/textarea";
import { askAI, getAIContext } from "./lib/utils";
import hljs from "highlight.js";
import { createClient } from "@supabase/supabase-js";

console.log(import.meta.env.VITE_GOOGLE_API_KEY);

const supabaseUrl = "https://ulxzzlzxrhdndksbsqox.supabase.co";
const supabaseAnonKey = import.meta.env.VITE__SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function initStorage() {
  let _sitesArr = sitesArr;
  const sites = JSON.parse(localStorage.getItem("sitesArr") || "[]");
  localStorage.setItem(
    "sitesArr",
    JSON.stringify(sites.length ? sites : _sitesArr)
  );
}

initStorage();

interface Site {
  name: string;
  url: string;
  icon: string;
}

function App() {
  hljs.highlightAll();
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [aiChat, setAiChat] = useState("");
  const [aiChatList, setAiChatList] = useState<
    Array<{ content: string; type: string }>
  >([]);

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

  const onKeyDownOfTextArea = (e: { target: any; key: string }) => {
    if (e.key === "Enter") {
      // @ts-ignore
      e.preventDefault(); // 阻止默认的换行行为
      setAiChatList([
        ...aiChatList,
        { content: e.target.value, type: "question" },
      ]);
      setAiChat("");
    }
  };

  useEffect(() => {
    if (aiChatList.length % 2 === 1 && aiChatList.length > 0) {
      askAI(
        aiChatList[aiChatList.length - 1].content,
        getAIContext(aiChatList)
      ).then((res) => {
        setAiChatList([...aiChatList, { content: res, type: "answer" }]);
      });
    }
  }, [aiChatList.length]);

  const aiContentRef = useRef();

  useEffect(() => {
    if (aiContentRef.current) {
      // @ts-ignore
      aiContentRef.current.scrollTop = aiContentRef.current.scrollHeight;
    }
  }, [aiChatList.length]);

  const copyToClipboard = (content: string) => {
    const el = document.createElement("textarea");
    el.value = content;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    toastify("已复制到剪贴板");
  };

  const syncSitesToDatabase = async () => {
    try {
      // 先获取数据库中的所有站点
      const { data: existingSites, error: fetchError } = await supabase
        .from('sites')
        .select('*');

      if (fetchError) throw fetchError;

      if (!existingSites || existingSites.length === 0) {
        // 如果数据库为空，执行全量插入
        const { error: insertError } = await supabase
          .from('sites')
          .insert(sites.map(site => ({
            ...site,
            updated_at: new Date().toISOString()
          })));

        if (insertError) throw insertError;
      } else {
        // 如果数据库已有数据，执行 upsert 操作
        const sitesToUpsert = existingSites.map(site => ({
          ...site,
          id: existingSites.find(es => es.url === site.url)?.id,
          updated_at: new Date().toISOString()
        }));

        const newSites = sites.filter(v=>{
          if (existingSites.find(i=>i.name !==v.name)) {
            return true
          }

          return false
        })

        const { error: insertError } = await supabase
        .from('sites')
        .insert(newSites.map(site => ({
          ...site,
          updated_at: new Date().toISOString()
        })));

        if (insertError) throw insertError;

        const { error: upsertError } = await supabase
          .from('sites')
          .upsert(sitesToUpsert, {
            onConflict: 'url',
            ignoreDuplicates: false
          });

        if (upsertError) throw upsertError;
      }

      toast({ title: "同步成功", variant: "default" });
    } catch (error) {
      console.error('Error syncing sites:', error);
      toast({ 
        title: "同步失败", 
        description: (error as Error).message, 
        variant: "destructive" 
      });
    }
  };

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
          <div className="flex gap-4">
            <Button onClick={() => setIsDrawerOpen(true)}>
              <HamburgerMenuIcon />
            </Button>
           
          </div>
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
                    className={`flex items-center gap-2 cursor-pointer justify-between h-full text-sm`}
                    target="_blank"
                  >
                    {site.name}
                    <img src={site.icon} className="w-5 h-5" />
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
              <Button   
                className="ml-4"
                size={"sm"} 
                onClick={syncSitesToDatabase}>
                同步
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
            <Dialog.Content
              className="DialogContent"
              style={{ zIndex: 99999999 }}
            >
              <Dialog.Title className="DialogTitle">添加网站</Dialog.Title>
              <Dialog.Description className="DialogDescription">
                填写网站名称和地址
              </Dialog.Description>
              <Input
                className="mb-4 text-black"
                placeholder="网站名称"
                value={siteName}
                onChange={(e) => {
                  setSiteName(e.target.value);
                }}
              />
              <Input
                className="mb-4 text-black"
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
        <ToastContainer />
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

        <Drawer
          open={isDrawerOpen}
          size={600}
          enableOverlay={false}
          direction="right"
        >
          <div className="flex flex-col h-full justify-between">
            <div className="flex items-center justify-between pr-4 text-black">
              <div className="p-4 cursor-pointer">
                <Cross1Icon onClick={() => setIsDrawerOpen(false)} />
              </div>
              <h3 className="text-lg fw-bold">AI对话</h3>
            </div>
            {/* @ts-ignore */}
            <div className="flex-1 overflow-y-auto px-4" ref={aiContentRef}>
              <div className="flex flex-col gap-4">
                {aiChatList.map((item, index) => {
                  return (
                    <div
                      key={index}
                      className={
                        item.type === "question"
                          ? "bg-blue-500 text-white p-4 rounded-lg flex flex-col flex-wrap"
                          : "bg-gray-200 p-4 rounded-lg flex flex-wrap flex-col"
                      }
                    >
                      <Avatar
                        style={{ width: 30, height: 30 }}
                        className="mb-4"
                      >
                        <AvatarFallback className="text-black bg-white">
                          {item.type === "question" ? "我" : "AI"}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`flex-1 ml-2 whitespace-pre-wrap overflow-auto w-[520px] ${
                          item.type === "question" ? "text-white" : "text-black"
                        }`}
                      >
                        {item.type === "question" ? (
                          item.content
                        ) : (
                          <Markdown
                            rehypePlugins={[
                              rehypeHighlight,
                              rehypeRaw,
                              rehypeSanitize,
                            ]}
                          >
                            {item.content}
                          </Markdown>
                        )}
                      </div>
                      {item.type === "answer" && (
                        <div className="flex items-center justify-end cursor-pointer">
                          <CopyIcon
                            onClick={() => copyToClipboard(item.content)}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="p-4">
              <Textarea
                className="w-full text-black"
                placeholder="请输入搜索关键词"
                onKeyDown={onKeyDownOfTextArea}
                value={aiChat}
                onChange={(e) => {
                  setAiChat(e.target.value);
                }}
              />
            </div>
          </div>
        </Drawer>
      </div>
    </ThemeProvider>
  );
}

export default App;
