"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Play,
  Square,
  Terminal,
  Bot,
  MessageSquare,
  Settings,
  Cpu,
  HardDrive,
  Network,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react"

interface ContainerInterface {
  id: string
  name: string
  status: "running" | "stopped" | "starting"
  aiAgent: "claude" | "gemini" | null
  resources: {
    cpu: string
    memory: string
    storage: string
  }
  terminal: {
    output: string[]
    input: string
  }
}

interface MCPMessage {
  id: string
  from: string
  to: string
  type: "context" | "code" | "request" | "response"
  content: string
  timestamp: Date
}

export default function AIDockerCodingEnvironment() {
  const [containers, setContainers] = useState<ContainerInterface[]>([
    {
      id: "container-1",
      name: "Claude Terminal",
      status: "stopped",
      aiAgent: "claude",
      resources: { cpu: "2 cores", memory: "4GB", storage: "20GB" },
      terminal: { output: [], input: "" },
    },
    {
      id: "container-2",
      name: "Gemini Terminal",
      status: "stopped",
      aiAgent: "gemini",
      resources: { cpu: "2 cores", memory: "4GB", storage: "20GB" },
      terminal: { output: [], input: "" },
    },
  ])

  const [mcpMessages, setMcpMessages] = useState<MCPMessage[]>([])
  const [selectedContainer, setSelectedContainer] = useState<string>("container-1")
  const [apiKeys, setApiKeys] = useState({
    claude: "",
    gemini: "",
  })

  // Simulate container startup
  const startContainer = async (containerId: string) => {
    setContainers((prev) => prev.map((c) => (c.id === containerId ? { ...c, status: "starting" } : c)))

    // Simulate startup delay
    setTimeout(() => {
      setContainers((prev) =>
        prev.map((c) =>
          c.id === containerId
            ? {
                ...c,
                status: "running",
                terminal: {
                  ...c.terminal,
                  output: [
                    ...c.terminal.output,
                    `[${new Date().toLocaleTimeString()}] Container ${c.name} started`,
                    `[${new Date().toLocaleTimeString()}] Ubuntu 22.04 LTS initialized`,
                    `[${new Date().toLocaleTimeString()}] ${c.aiAgent?.toUpperCase()} AI Agent loaded`,
                    `[${new Date().toLocaleTimeString()}] MCP Protocol enabled`,
                    `root@${containerId.slice(-8)}:~# `,
                  ],
                },
              }
            : c,
        ),
      )
    }, 2000)
  }

  const stopContainer = (containerId: string) => {
    setContainers((prev) =>
      prev.map((c) =>
        c.id === containerId
          ? {
              ...c,
              status: "stopped",
              terminal: {
                ...c.terminal,
                output: [...c.terminal.output, `[${new Date().toLocaleTimeString()}] Container stopped`],
              },
            }
          : c,
      ),
    )
  }

  const executeCommand = (containerId: string, command: string) => {
    const container = containers.find((c) => c.id === containerId)
    if (!container || container.status !== "running") return

    const timestamp = new Date().toLocaleTimeString()
    let response = ""

    // Simulate AI agent responses
    if (command.includes("ai help")) {
      response =
        container.aiAgent === "claude"
          ? 'Claude AI: I can help you with code generation, debugging, and analysis. Try "ai generate <description>" or "ai debug <code>"'
          : 'Gemini AI: Ready to assist with coding tasks, explanations, and problem-solving. Use "ai code <task>" or "ai explain <concept>"'
    } else if (command.includes("ai generate")) {
      response = `${container.aiAgent?.toUpperCase()} AI: Generating code for: ${command.replace("ai generate ", "")}`

      // Simulate MCP communication
      const otherContainer = containers.find((c) => c.id !== containerId && c.status === "running")
      if (otherContainer) {
        const mcpMessage: MCPMessage = {
          id: Date.now().toString(),
          from: container.name,
          to: otherContainer.name,
          type: "context",
          content: `Sharing code generation context: ${command.replace("ai generate ", "")}`,
          timestamp: new Date(),
        }
        setMcpMessages((prev) => [...prev, mcpMessage])
      }
    } else if (command.includes("ls")) {
      response = "app.py  requirements.txt  src/  tests/  README.md"
    } else if (command.includes("pwd")) {
      response = "/workspace"
    } else if (command === "clear") {
      setContainers((prev) =>
        prev.map((c) =>
          c.id === containerId
            ? {
                ...c,
                terminal: { ...c.terminal, output: [`root@${containerId.slice(-8)}:~# `] },
              }
            : c,
        ),
      )
      return
    } else {
      response = `bash: ${command}: command not found`
    }

    setContainers((prev) =>
      prev.map((c) =>
        c.id === containerId
          ? {
              ...c,
              terminal: {
                input: "",
                output: [
                  ...c.terminal.output,
                  `root@${containerId.slice(-8)}:~# ${command}`,
                  `[${timestamp}] ${response}`,
                  `root@${containerId.slice(-8)}:~# `,
                ],
              },
            }
          : c,
      ),
    )
  }

  const handleTerminalInput = (containerId: string, input: string) => {
    setContainers((prev) =>
      prev.map((c) =>
        c.id === containerId
          ? {
              ...c,
              terminal: { ...c.terminal, input },
            }
          : c,
      ),
    )
  }

  const handleTerminalSubmit = (containerId: string) => {
    const container = containers.find((c) => c.id === containerId)
    if (container?.terminal.input.trim()) {
      executeCommand(containerId, container.terminal.input.trim())
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-slate-800">AI-Powered Dockerized Coding Environment</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Isolated Docker containers with AI agents communicating via Model Context Protocol (MCP)
          </p>
        </div>

        {/* Main Dashboard */}
        <Tabs defaultValue="containers" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="containers">Containers</TabsTrigger>
            <TabsTrigger value="terminals">Terminals</TabsTrigger>
            <TabsTrigger value="mcp">MCP Communication</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Container Management */}
          <TabsContent value="containers" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {containers.map((container) => (
                <Card key={container.id} className="border-2 hover:border-blue-200 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Cpu className="h-5 w-5" />
                        {container.name}
                      </CardTitle>
                      <Badge
                        variant={container.status === "running" ? "default" : "secondary"}
                        className={container.status === "running" ? "bg-green-500" : ""}
                      >
                        {container.status === "starting" && <Clock className="h-3 w-3 mr-1" />}
                        {container.status === "running" && <CheckCircle className="h-3 w-3 mr-1" />}
                        {container.status === "stopped" && <AlertCircle className="h-3 w-3 mr-1" />}
                        {container.status}
                      </Badge>
                    </div>
                    <CardDescription>
                      AI Agent: {container.aiAgent?.toUpperCase() || "None"} | Ubuntu 22.04 LTS
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Cpu className="h-4 w-4 text-blue-500" />
                        <span>{container.resources.cpu}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <HardDrive className="h-4 w-4 text-green-500" />
                        <span>{container.resources.memory}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Network className="h-4 w-4 text-purple-500" />
                        <span>{container.resources.storage}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {container.status === "running" ? (
                        <Button onClick={() => stopContainer(container.id)} variant="destructive" size="sm">
                          <Square className="h-4 w-4 mr-2" />
                          Stop
                        </Button>
                      ) : (
                        <Button
                          onClick={() => startContainer(container.id)}
                          disabled={container.status === "starting"}
                          size="sm"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          {container.status === "starting" ? "Starting..." : "Start"}
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => setSelectedContainer(container.id)}>
                        <Terminal className="h-4 w-4 mr-2" />
                        Terminal
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Terminal Interface */}
          <TabsContent value="terminals" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {containers.map((container) => (
                <Card key={container.id} className="border-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <Terminal className="h-5 w-5" />
                      {container.name}
                      <Badge variant={container.status === "running" ? "default" : "secondary"}>
                        {container.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ScrollArea className="h-64 w-full border rounded-md p-3 bg-black text-green-400 font-mono text-sm">
                      {container.terminal.output.map((line, index) => (
                        <div key={index} className="whitespace-pre-wrap">
                          {line}
                        </div>
                      ))}
                    </ScrollArea>
                    {container.status === "running" && (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter command..."
                          value={container.terminal.input}
                          onChange={(e) => handleTerminalInput(container.id, e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && handleTerminalSubmit(container.id)}
                          className="font-mono"
                        />
                        <Button onClick={() => handleTerminalSubmit(container.id)}>Execute</Button>
                      </div>
                    )}
                    {container.status !== "running" && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>Container must be running to use terminal</AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* MCP Communication */}
          <TabsContent value="mcp" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Model Context Protocol (MCP) Communication
                </CardTitle>
                <CardDescription>Real-time communication between AI agents in different containers</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96 w-full border rounded-md p-4">
                  {mcpMessages.length === 0 ? (
                    <div className="text-center text-slate-500 py-8">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No MCP messages yet. Start both containers and use AI commands to see communication.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {mcpMessages.map((message) => (
                        <div key={message.id} className="border rounded-lg p-3 space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <Bot className="h-4 w-4" />
                              <span className="font-medium">{message.from}</span>
                              <span className="text-slate-500">→</span>
                              <span className="font-medium">{message.to}</span>
                            </div>
                            <Badge variant="outline">{message.type}</Badge>
                          </div>
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs text-slate-500">{message.timestamp.toLocaleTimeString()}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    AI API Configuration
                  </CardTitle>
                  <CardDescription>Configure API keys for Claude and Gemini AI agents</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="claude-key">Claude API Key</Label>
                    <Input
                      id="claude-key"
                      type="password"
                      placeholder="sk-ant-..."
                      value={apiKeys.claude}
                      onChange={(e) => setApiKeys((prev) => ({ ...prev, claude: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gemini-key">Gemini API Key</Label>
                    <Input
                      id="gemini-key"
                      type="password"
                      placeholder="AIza..."
                      value={apiKeys.gemini}
                      onChange={(e) => setApiKeys((prev) => ({ ...prev, gemini: e.target.value }))}
                    />
                  </div>
                  <Button className="w-full">Save Configuration</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Docker Configuration</CardTitle>
                  <CardDescription>WSL and Ubuntu environment settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Base Image</Label>
                    <Input value="ubuntu:22.04" readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>WSL Distribution</Label>
                    <Input value="Ubuntu-22.04" readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Docker Engine</Label>
                    <Input value="Docker Desktop with WSL2 backend" readOnly />
                  </div>
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>Environment configured for optimal AI agent performance</AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Start Guide */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">Quick Start Guide</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700 space-y-2">
            <p>
              <strong>1.</strong> Start both containers using the "Start" buttons
            </p>
            <p>
              <strong>2.</strong> Switch to the Terminals tab to interact with AI agents
            </p>
            <p>
              <strong>3.</strong> Try commands like "ai help", "ai generate a Python function", or "ls"
            </p>
            <p>
              <strong>4.</strong> Watch MCP communication between agents in the MCP tab
            </p>
            <p>
              <strong>5.</strong> Configure your API keys in Settings for full functionality
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
