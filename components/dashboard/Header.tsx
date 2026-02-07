import React from 'react';
import { Button } from '../UI';

interface HeaderProps {
  user: any;
  selectedKey: boolean;
  onSelectKey: () => void;
  onLogout: () => void;
  onOpenCampaigns: () => void;
  onLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, selectedKey, onSelectKey, onLogout, onOpenCampaigns, onLogin }) => {
  return (
    <header className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-dark-700 pb-6">
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-400 to-indigo-400">
          Creative Autopilot
        </h1>
        <p className="text-dark-700 text-sm mt-1 text-gray-400">Powered by Gemini 3 & Nano Banana</p>
      </div>
      <div className="flex items-center gap-3">
        {!selectedKey && (
          <Button onClick={onSelectKey} variant="outline" className="text-xs md:text-sm border-brand-500/50 text-brand-300 hover:bg-brand-900/20">
            ⚡ Connect API Key
          </Button>
        )}
        {user ? (
          <div className="flex items-center gap-2">
            <Button onClick={onOpenCampaigns} variant="secondary" className="text-xs py-2 px-4 border border-dark-600">
              My Campaigns
            </Button>
            <Button onClick={onLogout} variant="outline" className="text-xs py-2 px-4 border-dark-600">Logout</Button>
          </div>
        ) : (
          <Button onClick={onLogin} variant="secondary" className="text-xs py-2 px-6 bg-brand-600 hover:bg-brand-700 text-white border-none shadow-lg shadow-brand-900/20">
            Login / Sign Up
          </Button>
        )}
      </div>
    </header>
  );
};