import React from 'react';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';

export function CharacterProfile() {
  const [character, setCharacter] = React.useState({
    name: '',
    description: '',
    personality: '',
    knowledge: '',
    goals: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement character creation/update logic
    console.log('Character data:', character);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Character Profile</h1>
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <Input
              value={character.name}
              onChange={(e) => setCharacter({ ...character, name: e.target.value })}
              placeholder="Enter character name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              className="w-full p-2 border rounded-md"
              value={character.description}
              onChange={(e) => setCharacter({ ...character, description: e.target.value })}
              placeholder="Describe your character"
              rows={4}
            />
          </div>

          <Separator />

          <div>
            <label className="block text-sm font-medium mb-2">Personality Traits</label>
            <textarea
              className="w-full p-2 border rounded-md"
              value={character.personality}
              onChange={(e) => setCharacter({ ...character, personality: e.target.value })}
              placeholder="Define personality traits"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Knowledge Base</label>
            <textarea
              className="w-full p-2 border rounded-md"
              value={character.knowledge}
              onChange={(e) => setCharacter({ ...character, knowledge: e.target.value })}
              placeholder="Define character's knowledge and expertise"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Goals</label>
            <textarea
              className="w-full p-2 border rounded-md"
              value={character.goals}
              onChange={(e) => setCharacter({ ...character, goals: e.target.value })}
              placeholder="Define character's goals and objectives"
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full">
            Save Character Profile
          </Button>
        </form>
      </Card>
    </div>
  );
}