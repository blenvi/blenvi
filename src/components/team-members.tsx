"use client";

import { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconChevronLeft,
  IconChevronRight,
  IconMail,
  IconMapPin,
  IconPhone,
  IconPlus,
  IconUserPlus,
} from "@tabler/icons-react";

const teamMembers = [
  {
    id: 1,
    name: "Eddie Lake",
    role: "Project Manager",
    department: "Operations",
    email: "eddie.lake@company.com",
    phone: "+1 (555) 123-4567",
    location: "New York, NY",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "online",
    tasksAssigned: 12,
    tasksCompleted: 8,
  },
  {
    id: 2,
    name: "Jamik Tashpulatov",
    role: "Senior Developer",
    department: "Engineering",
    email: "jamik.t@company.com",
    phone: "+1 (555) 234-5678",
    location: "San Francisco, CA",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "online",
    tasksAssigned: 15,
    tasksCompleted: 12,
  },
  {
    id: 3,
    name: "Maya Johnson",
    role: "UX Designer",
    department: "Design",
    email: "maya.johnson@company.com",
    phone: "+1 (555) 345-6789",
    location: "Austin, TX",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "away",
    tasksAssigned: 8,
    tasksCompleted: 6,
  },
  {
    id: 4,
    name: "Carlos Rodriguez",
    role: "QA Engineer",
    department: "Quality Assurance",
    email: "carlos.r@company.com",
    phone: "+1 (555) 456-7890",
    location: "Miami, FL",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "offline",
    tasksAssigned: 10,
    tasksCompleted: 9,
  },
  {
    id: 5,
    name: "Sarah Chen",
    role: "Legal Counsel",
    department: "Legal",
    email: "sarah.chen@company.com",
    phone: "+1 (555) 567-8901",
    location: "Seattle, WA",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "online",
    tasksAssigned: 5,
    tasksCompleted: 4,
  },
  {
    id: 6,
    name: "Alex Thompson",
    role: "Frontend Developer",
    department: "Engineering",
    email: "alex.t@company.com",
    phone: "+1 (555) 678-9012",
    location: "Chicago, IL",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "online",
    tasksAssigned: 7,
    tasksCompleted: 5,
  },
  {
    id: 7,
    name: "Priya Singh",
    role: "Data Analyst",
    department: "Analytics",
    email: "priya.s@company.com",
    phone: "+1 (555) 789-0123",
    location: "Boston, MA",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "away",
    tasksAssigned: 9,
    tasksCompleted: 7,
  },
  {
    id: 8,
    name: "David Ortiz",
    role: "DevOps Engineer",
    department: "Engineering",
    email: "david.o@company.com",
    phone: "+1 (555) 890-1234",
    location: "Portland, OR",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "online",
    tasksAssigned: 11,
    tasksCompleted: 10,
  },
  {
    id: 9,
    name: "Aisha Rahman",
    role: "Product Manager",
    department: "Product",
    email: "aisha.r@company.com",
    phone: "+1 (555) 901-2345",
    location: "Denver, CO",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "offline",
    tasksAssigned: 14,
    tasksCompleted: 11,
  },
  {
    id: 10,
    name: "Luis Fernandez",
    role: "Backend Developer",
    department: "Engineering",
    email: "luis.f@company.com",
    phone: "+1 (555) 012-3456",
    location: "Atlanta, GA",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "away",
    tasksAssigned: 13,
    tasksCompleted: 9,
  },
  {
    id: 11,
    name: "Nadia Kim",
    role: "Marketing Specialist",
    department: "Marketing",
    email: "nadia.k@company.com",
    phone: "+1 (555) 123-4567",
    location: "Los Angeles, CA",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "online",
    tasksAssigned: 8,
    tasksCompleted: 7,
  },
  {
    id: 12,
    name: "Marcus Johnson",
    role: "Security Analyst",
    department: "IT Security",
    email: "marcus.j@company.com",
    phone: "+1 (555) 234-5678",
    location: "Washington, DC",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "online",
    tasksAssigned: 6,
    tasksCompleted: 6,
  },
];

export function TeamMembers() {
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: "smooth" });
      setTimeout(checkScrollButtons, 300);
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: "smooth" });
      setTimeout(checkScrollButtons, 300);
    }
  };

  const getStatusRing = (status: string) => {
    switch (status) {
      case "online":
        return "border-green-500";
      case "away":
        return "border-yellow-500";
      case "offline":
        return "border-gray-300";
      default:
        return "border-gray-300";
    }
  };

  return (
    <div className="px-4 lg:px-6">
      <Card className="overflow-hidden">
        <CardContent>
          <div className="relative flex items-center">
            <Button
              size="icon"
              variant="outline"
              className={`absolute left-0 z-10 h-8 w-8 rounded-full backdrop-blur-sm shadow-xl ${
                canScrollLeft ? "opacity-100" : "opacity-0 pointer-events-none"
              } transition-opacity duration-200`}
              onClick={scrollLeft}
            >
              <IconChevronLeft className="h-4 w-4" />
            </Button>
            <div
              ref={scrollContainerRef}
              className="flex space-x-4 overflow-x-hidden scroll-smooth py-4"
              onScroll={checkScrollButtons}
            >
              <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
                <DialogTrigger asChild>
                  <div className="flex flex-col items-center space-y-1 cursor-pointer flex-shrink-0">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted ring-2 ring-muted-foreground/20">
                      <IconPlus className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <span className="text-xs font-medium">Add New</span>
                  </div>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Team Member</DialogTitle>
                    <DialogDescription>
                      Invite a new member to join your team.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" placeholder="John" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" placeholder="Doe" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john.doe@company.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="developer">Developer</SelectItem>
                          <SelectItem value="designer">Designer</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="qa">QA Engineer</SelectItem>
                          <SelectItem value="legal">Legal Counsel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="engineering">
                            Engineering
                          </SelectItem>
                          <SelectItem value="design">Design</SelectItem>
                          <SelectItem value="operations">Operations</SelectItem>
                          <SelectItem value="qa">Quality Assurance</SelectItem>
                          <SelectItem value="legal">Legal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="w-full">
                      <IconUserPlus className="h-4 w-4 mr-2" />
                      Send Invitation
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              {teamMembers.map((member) => (
                <HoverCard key={member.id} openDelay={200} closeDelay={100}>
                  <HoverCardTrigger asChild>
                    <div className="flex flex-col items-center space-y-1 cursor-pointer flex-shrink-0">
                      <Avatar
                        className={`size-16 border-2 ${getStatusRing(member.status)}`}
                      >
                        <AvatarImage
                          src={member.avatar || "/placeholder.svg"}
                          alt={member.name}
                        />
                        <AvatarFallback>
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium">
                        {member.name.split(" ")[0]}
                      </span>
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80" align="center">
                    <div className="flex justify-between space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={member.avatar || "/placeholder.svg"}
                        />
                        <AvatarFallback>
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1 flex-1">
                        <h4 className="text-sm font-semibold">{member.name}</h4>
                        <div className="flex items-center">
                          <Badge variant="secondary" className="mr-2 text-xs">
                            {member.role}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {member.department}
                          </span>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <IconMapPin className="mr-1 h-3 w-3" />
                          {member.location}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center text-sm">
                        <IconMail className="mr-2 h-4 w-4 opacity-70" />
                        <span>{member.email}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <IconPhone className="mr-2 h-4 w-4 opacity-70" />
                        <span>{member.phone}</span>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              ))}
            </div>

            {/* Right Chevron */}
            <Button
              size="icon"
              variant="outline"
              className={`absolute right-0 z-10 h-8 w-8 rounded-full backdrop-blur-sm shadow-xl ${
                canScrollRight ? "opacity-100" : "opacity-0 pointer-events-none"
              } transition-opacity duration-200`}
              onClick={scrollRight}
            >
              <IconChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
