"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  dueDate: string;
}

export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const savedTodos = localStorage.getItem("todos");
    return savedTodos ? JSON.parse(savedTodos) : [];
  });
  const [newTodo, setNewTodo] = useState("");
  const [date, setDate] = useState<Date>();

  useEffect(() => {
    const savedTodos = localStorage.getItem("todos");
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (newTodo.trim() && date) {
      setTodos([
        ...todos,
        {
          id: crypto.randomUUID(),
          text: newTodo.trim(),
          completed: false,
          dueDate: date.toISOString(),
        },
      ]);
      setNewTodo("");
      setDate(undefined);
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addTodo();
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <Card className="w-full">
      <CardContent>
        <div className="flex space-x-2 my-4">
          <Input
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="添加新的代办事项..."
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[300px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "MM-dd HH:mm") : <span>选择时间</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
              <div className="p-2 border-t">
                <Input
                  type="time"
                  onChange={(e) => {
                    if (date) {
                      const [hours, minutes] = e.target.value.split(":");
                      const newDate = new Date(date);
                      newDate.setHours(parseInt(hours), parseInt(minutes));
                      setDate(newDate);
                    }
                  }}
                />
              </div>
            </PopoverContent>
          </Popover>
          <Button onClick={addTodo}>添加</Button>
        </div>
        <div className="space-y-2">
          {todos.map((todo) => (
            <div
              key={todo.id}
              className={cn(
                "flex items-center justify-between space-x-2 border rounded-lg p-2",
                isOverdue(todo.dueDate) && !todo.completed && "bg-red-50"
              )}
            >
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={todo.completed}
                  onCheckedChange={() => toggleTodo(todo.id)}
                />
                <div className="flex flex-col">
                  <span
                    className={cn(
                      todo.completed && "line-through text-gray-500",
                      isOverdue(todo.dueDate) &&
                        !todo.completed &&
                        "text-red-500"
                    )}
                  >
                    {todo.text}
                  </span>
                  <span className="text-sm text-gray-500">
                    {format(new Date(todo.dueDate), "MM-dd HH:mm")}
                    {isOverdue(todo.dueDate) && !todo.completed && " (已超时)"}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteTodo(todo.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
