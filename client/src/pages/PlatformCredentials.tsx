import React from 'react';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';

interface PlatformConfig {
  enabled: boolean;
  apiKey: string;
  apiSecret?: string;
  accessToken?: string;
}

export function PlatformCredentials() {
  const [platforms, setPlatforms] = React.useState<Record<string, PlatformConfig>>({
    twitter: { enabled: false, apiKey: '', apiSecret: '', accessToken: '' },
    discord: { enabled: false, apiKey: '' },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement credentials saving logic
    console.log('Platform credentials:', platforms);
  };

  const handlePlatformChange = (platform: string, field: string, value: string | boolean) => {
    setPlatforms((prev) => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [field]: value,
      },
    }));
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Platform Credentials</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Twitter Configuration */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Twitter</h2>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={platforms.twitter.enabled}
                onChange={(e) => handlePlatformChange('twitter', 'enabled', e.target.checked)}
                className="form-checkbox"
              />
              <span>Enable</span>
            </label>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">API Key</label>
              <Input
                type="password"
                value={platforms.twitter.apiKey}
                onChange={(e) => handlePlatformChange('twitter', 'apiKey', e.target.value)}
                placeholder="Enter Twitter API Key"
                disabled={!platforms.twitter.enabled}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">API Secret</label>
              <Input
                type="password"
                value={platforms.twitter.apiSecret}
                onChange={(e) => handlePlatformChange('twitter', 'apiSecret', e.target.value)}
                placeholder="Enter Twitter API Secret"
                disabled={!platforms.twitter.enabled}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Access Token</label>
              <Input
                type="password"
                value={platforms.twitter.accessToken}
                onChange={(e) => handlePlatformChange('twitter', 'accessToken', e.target.value)}
                placeholder="Enter Twitter Access Token"
                disabled={!platforms.twitter.enabled}
              />
            </div>
          </div>
        </Card>

        <Separator />

        {/* Discord Configuration */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Discord</h2>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={platforms.discord.enabled}
                onChange={(e) => handlePlatformChange('discord', 'enabled', e.target.checked)}
                className="form-checkbox"
              />
              <span>Enable</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Bot Token</label>
            <Input
              type="password"
              value={platforms.discord.apiKey}
              onChange={(e) => handlePlatformChange('discord', 'apiKey', e.target.value)}
              placeholder="Enter Discord Bot Token"
              disabled={!platforms.discord.enabled}
            />
          </div>
        </Card>

        <Button type="submit" className="w-full">
          Save Platform Credentials
        </Button>
      </form>
    </div>
  );
}