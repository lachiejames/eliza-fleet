import React from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';

interface AgentStatus {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'error';
  lastActive: string;
  platform: string;
  messageCount: number;
}

export function AgentDashboard() {
  const [agents, setAgents] = React.useState<AgentStatus[]>([
    {
      id: '1',
      name: 'Support Bot',
      status: 'online',
      lastActive: new Date().toISOString(),
      platform: 'Discord',
      messageCount: 150,
    },
    // Add more mock data as needed
  ]);

  const getStatusColor = (status: AgentStatus['status']) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'offline':
        return 'bg-gray-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Agent Dashboard</h1>
        <Button>Create New Agent</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Stats Overview */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Overview</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Total Agents</span>
              <span className="font-semibold">{agents.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Active Agents</span>
              <span className="font-semibold">
                {agents.filter((a) => a.status === 'online').length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Total Messages</span>
              <span className="font-semibold">
                {agents.reduce((sum, agent) => sum + agent.messageCount, 0)}
              </span>
            </div>
          </div>
        </Card>

        {/* Agent Status Cards */}
        {agents.map((agent) => (
          <Card key={agent.id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{agent.name}</h3>
                <p className="text-sm text-gray-500">{agent.platform}</p>
              </div>
              <div className={`w-3 h-3 rounded-full ${getStatusColor(agent.status)}`} />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Last Active</span>
                <span>{formatDate(agent.lastActive)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Messages</span>
                <span>{agent.messageCount}</span>
              </div>
            </div>

            <div className="mt-4 space-x-2">
              <Button variant="outline" size="sm">
                View Details
              </Button>
              <Button variant="outline" size="sm" className="text-red-500">
                Stop Agent
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}