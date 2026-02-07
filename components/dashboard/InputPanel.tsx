import React from 'react';
import { AgentState, BrandAnalysis, GeneratedAsset } from '../../types/index';
import { Button, Card, Spinner } from '../UI';

interface InputPanelProps {
    prompt: string;
    setPrompt: (val: string) => void;
    state: AgentState;
    analysis: BrandAnalysis | null;
    assets: GeneratedAsset[];
    selectedKey: boolean;
    campaignName: string;
    setCampaignName: (val: string) => void;
    isSaving: boolean;
    user: any;
    onAnalyze: () => void;
    onGenerate: () => void;
    onSave: () => void;
}

export const InputPanel: React.FC<InputPanelProps> = ({
    prompt, setPrompt, state, analysis, assets, selectedKey,
    campaignName, setCampaignName, isSaving, user,
    onAnalyze, onGenerate, onSave
}) => {
    return (
        <Card className="p-6 bg-dark-800/50 backdrop-blur-md">
            <label className="block text-sm font-medium text-gray-400 mb-2">Brand Vision / Prompt</label>
            <textarea
                className="w-full bg-dark-900 border border-dark-600 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all resize-none h-32"
                placeholder="e.g. A futuristic coffee shop called 'Nebula Brew' that serves caffeinated vapor. Target audience is tech workers and cyberpunk fans. Colors: Neon purple and black."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={state !== AgentState.IDLE && state !== AgentState.COMPLETED && state !== AgentState.ERROR}
            />
            <div className="mt-4 flex flex-col gap-3">
                {state === AgentState.IDLE || state === AgentState.COMPLETED || state === AgentState.ERROR ? (
                    <Button 
                        onClick={onAnalyze} 
                        disabled={!prompt || !selectedKey} 
                        className="w-full"
                    >
                       {state === AgentState.COMPLETED ? 'Start New Campaign' : 'Initialize Agent'}
                    </Button>
                ) : null}
                
                {state === AgentState.REVIEW_PLAN && (
                     <Button onClick={onGenerate} className="w-full animate-pulse">
                        Approve & Generate Assets
                     </Button>
                )}

                {/* Save Button */}
                {(state === AgentState.COMPLETED || assets.some(a => a.status === 'COMPLETED')) && (
                    <div className="pt-4 border-t border-dark-700 space-y-3">
                         <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Save Campaign</label>
                            <input 
                                type="text"
                                className="w-full bg-dark-900 border border-dark-600 rounded-lg p-2 text-sm text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none placeholder-gray-600 transition-all"
                                placeholder={analysis?.brandName ? `e.g. ${analysis.brandName} v1` : "Campaign Name"}
                                value={campaignName}
                                onChange={(e) => setCampaignName(e.target.value)}
                            />
                         </div>
                        <Button 
                            onClick={onSave} 
                            variant="secondary" 
                            className="w-full border border-dark-600"
                            disabled={isSaving}
                        >
                            {isSaving ? <Spinner size="sm" /> : (user ? 'Save to Cloud' : 'Login to Save')}
                        </Button>
                    </div>
                )}
            </div>
            {!selectedKey && (
                 <p className="text-xs text-center text-red-400 mt-2">API Key required to start.</p>
            )}
        </Card>
    );
};