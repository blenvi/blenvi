"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  IconDotsVertical,
  IconHeart,
  IconMessageCircle,
  IconMoodSmile,
  IconPaperclip,
  IconSend,
  IconThumbUp,
} from "@tabler/icons-react";

const discussions = [
  {
    id: 1,
    author: "Eddie Lake",
    avatar: "/placeholder.svg?height=32&width=32",
    message:
      "Hey team! Just wanted to update everyone on the project timeline. We're making great progress on the dashboard implementation.",
    timestamp: "2 hours ago",
    reactions: [
      { id: 1, emoji: "👍", count: 3 },
      { id: 2, emoji: "❤️", count: 1 },
    ],
    replies: [
      {
        id: 11,
        author: "Jamik Tashpulatov",
        avatar: "/placeholder.svg?height=24&width=24",
        message: "Thanks for the update! The new components are looking great.",
        timestamp: "1 hour ago",
      },
    ],
  },
  {
    id: 2,
    author: "Maya Johnson",
    avatar: "/placeholder.svg?height=32&width=32",
    message:
      "I've finished the wireframes for the team page. Would love to get everyone's feedback before we move to development.",
    timestamp: "4 hours ago",
    reactions: [
      { id: 3, emoji: "🎨", count: 2 },
      { id: 4, emoji: "👍", count: 4 },
    ],
    replies: [],
  },
  {
    id: 3,
    author: "Carlos Rodriguez",
    avatar: "/placeholder.svg?height=32&width=32",
    message:
      "Found a small bug in the data table sorting. I'll create a ticket and fix it by EOD.",
    timestamp: "6 hours ago",
    reactions: [
      { id: 5, emoji: "🐛", count: 1 },
      { id: 6, emoji: "👍", count: 2 },
    ],
    replies: [
      {
        id: 31,
        author: "Eddie Lake",
        avatar: "/placeholder.svg?height=24&width=24",
        message: "Thanks Carlos! Let me know if you need any help with that.",
        timestamp: "5 hours ago",
      },
    ],
  },
];

export function TeamDiscussion() {
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Handle sending message
      setNewMessage("");
    }
  };

  return (
    <div className="px-4 lg:px-6">
      <Card>
        <CardHeader>
          <CardTitle>Team Discussion</CardTitle>
          <CardDescription>
            Stay connected with your team members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96 pr-4">
            <div className="space-y-4">
              {discussions.map((discussion) => (
                <div key={discussion.id} className="space-y-3">
                  <div className="flex space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={discussion.avatar || "/placeholder.svg"}
                        alt={discussion.author}
                      />
                      <AvatarFallback>
                        {discussion.author
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">
                            {discussion.author}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {discussion.timestamp}
                          </span>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <IconDotsVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <IconMessageCircle className="h-4 w-4 mr-2" />
                              Reply
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <IconHeart className="h-4 w-4 mr-2" />
                              React
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <p className="text-sm text-foreground">
                        {discussion.message}
                      </p>

                      {discussion.reactions.length > 0 && (
                        <div className="flex items-center space-x-2">
                          {discussion.reactions.map((reaction) => (
                            <Button
                              key={reaction.id}
                              variant="outline"
                              size="sm"
                              className="h-6 px-2 text-xs"
                            >
                              {reaction.emoji} {reaction.count}
                            </Button>
                          ))}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2"
                          >
                            <IconThumbUp className="h-3 w-3" />
                          </Button>
                        </div>
                      )}

                      {discussion.replies.length > 0 && (
                        <div className="ml-4 space-y-2 border-l-2 border-muted pl-4">
                          {discussion.replies.map((reply) => (
                            <div key={reply.id} className="flex space-x-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage
                                  src={reply.avatar || "/placeholder.svg"}
                                  alt={reply.author}
                                />
                                <AvatarFallback className="text-xs">
                                  {reply.author
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs font-medium">
                                    {reply.author}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {reply.timestamp}
                                  </span>
                                </div>
                                <p className="text-xs text-foreground">
                                  {reply.message}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="mt-4 flex space-x-2">
            <div className="flex-1 flex space-x-2">
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <Button variant="outline" size="icon">
                <IconPaperclip className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <IconMoodSmile className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={handleSendMessage}>
              <IconSend className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
