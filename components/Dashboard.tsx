import React, { useState, useEffect } from 'react';
import { AgentState, BrandAnalysis, GeneratedAsset, AssetType, CreativePlan } from '../types/index';
import { analyzeBrandAndPlan, generateImageAsset, generateTextAsset, promptSelectKey } from '../services/geminiService';
import { supabase, saveCampaign } from '../services/supabase';
import { Toast } from './UI';
import { AuthModal } from './AuthModal';
import { CampaignListModal } from './CampaignListModal';
import { Header } from './dashboard/Header';
import { InputPanel } from './dashboard/InputPanel';
import { AnalysisPanel } from './dashboard/AnalysisPanel';
import { LogSection } from './dashboard/LogSection';
import { AssetGallery } from './dashboard/AssetGallery';

export const Dashboard: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [state, setState] = useState<AgentState>(AgentState.IDLE);
  const [logs, setLogs] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<BrandAnalysis | null>(null);
  const [assets, setAssets] = useState<GeneratedAsset[]>([]);
  const [selectedKey, setSelectedKey] = useState(false);
  const [campaignName, setCampaignName] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auth & Saving State
  const [user, setUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCampaignListOpen, setIsCampaignListOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingSave, setPendingSave] = useState(false);

  // Auto-check API key status on mount
  useEffect(() => {
    const checkKey = async () => {
      if (typeof window !== 'undefined' && (window as any).aistudio) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        setSelectedKey(hasKey);
      } else {
        // Assume env var usage if not in AI Studio context
        setSelectedKey(true);
      }
    };
    checkKey();
  }, []);

  // Check Supabase session
  useEffect(() => {
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }: any) => {
        setUser(session?.user ?? null);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
        setUser(session?.user ?? null);
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  // Effect to trigger save after successful login if save was pending
  useEffect(() => {
    if (user && pendingSave && analysis && assets.length > 0) {
      handleSaveCampaign();
      setPendingSave(false);
    }
  }, [user, pendingSave, analysis, assets]);

  const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

  const handleSelectKey = async () => {
    try {
      await promptSelectKey();
      // Re-check key status immediately after modal interaction
      if (typeof window !== 'undefined' && (window as any).aistudio) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        setSelectedKey(hasKey);
        if (hasKey) addLog("Secure API Key selected successfully.");
        else addLog("Key selection cancelled or failed.");
      }
    } catch (e) {
      addLog("Error accessing key selection dialog.");
    }
  };

  const handleAnalyze = async () => {
    if (!prompt.trim()) return;
    setState(AgentState.ANALYZING);
    setAssets([]);
    setCampaignName('');
    setLogs(["Initializing Creative Autopilot...", `Received prompt: "${prompt}"`]);

    try {
      addLog("Analyzing brand identity and target audience...");
      const plan: CreativePlan = await analyzeBrandAndPlan(prompt);

      setAnalysis(plan.analysis);

      // Initialize assets with PENDING state
      const initialAssets: GeneratedAsset[] = plan.assets.map(a => ({
        ...a,
        status: 'PENDING'
      }));
      setAssets(initialAssets);

      addLog("Brand analysis complete.");
      addLog(`Identified Personality: ${plan.analysis.personality}`);
      addLog(`Assets planned: ${plan.assets.length}`);

      setState(AgentState.REVIEW_PLAN);
    } catch (error) {
      console.error(error);
      addLog("Error during analysis. Please try again.");
      setState(AgentState.ERROR);
    }
  };

  const handleGenerate = async () => {
    if (!analysis) return;
    setState(AgentState.GENERATING);
    addLog("Starting asset generation sequence...");

    // Parallel generation
    const generatePromises = assets.map(async (asset) => {
      // Update status to generating
      setAssets(prev => prev.map(p => p.id === asset.id ? { ...p, status: 'GENERATING' } : p));
      addLog(`Generating ${asset.type}: ${asset.description.substring(0, 30)}...`);

      try {
        let updatedAsset = { ...asset };

        if (asset.type === AssetType.COPYWRITING) {
          const text = await generateTextAsset(asset, analysis);
          updatedAsset = { ...updatedAsset, textContent: text, status: 'COMPLETED' };
        } else if (asset.type === AssetType.SOCIAL_POST) {
          // Generate both
          const [img, txt] = await Promise.all([
            generateImageAsset(asset),
            generateTextAsset(asset, analysis)
          ]);
          updatedAsset = { ...updatedAsset, imageUrl: img, textContent: txt, status: 'COMPLETED' };
        } else {
          // Images
          const img = await generateImageAsset(asset);
          updatedAsset = { ...updatedAsset, imageUrl: img, status: 'COMPLETED' };
        }

        setAssets(prev => prev.map(p => p.id === asset.id ? updatedAsset : p));
        addLog(`Completed ${asset.type}.`);

      } catch (e) {
        console.error(e);
        addLog(`Failed to generate ${asset.type}.`);
        setAssets(prev => prev.map(p => p.id === asset.id ? { ...p, status: 'FAILED' } : p));
      }
    });

    await Promise.all(generatePromises);
    addLog("All tasks finished.");
    setState(AgentState.COMPLETED);
  };

  const handleSaveClick = () => {
    if (!user) {
      setPendingSave(true);
      setIsAuthModalOpen(true);
    } else {
      handleSaveCampaign();
    }
  };

  const handleSaveCampaign = async () => {
    if (!user || !analysis) return;
    setIsSaving(true);
    addLog("Saving campaign to database...");
    try {
      await saveCampaign(user.id, { analysis, assets }, assets, campaignName);
      addLog("Campaign saved successfully!");
      setToastMessage("Campaign saved successfully!");
    } catch (e: any) {
      console.error(e);
      addLog(`Save failed: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadCampaign = (campaign: any) => {
    setAnalysis(campaign.plan_data.analysis);
    setAssets(campaign.assets_data);
    setCampaignName(campaign.name);
    setPrompt(`Loaded Campaign: ${campaign.name}`);
    setState(AgentState.COMPLETED);
    setLogs([`Loaded saved campaign: ${campaign.name}`, `Restored ${campaign.assets_data.length} assets.`]);
    setIsCampaignListOpen(false);
    setToastMessage("Campaign loaded.");
  };

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    addLog("User logged out.");
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-dark-900 text-gray-100 p-4 md:p-8 max-w-7xl mx-auto">
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => { setIsAuthModalOpen(false); setPendingSave(false); }}
        onSuccess={() => { /* Effect will handle the pending save */ }}
      />

      <CampaignListModal
        isOpen={isCampaignListOpen}
        onClose={() => setIsCampaignListOpen(false)}
        userId={user?.id}
        onLoad={handleLoadCampaign}
      />

      <Header
        user={user}
        selectedKey={selectedKey}
        onSelectKey={handleSelectKey}
        onLogout={handleLogout}
        onOpenCampaigns={() => setIsCampaignListOpen(true)}
      />

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Column: Input & Controls */}
        <div className="lg:col-span-4 space-y-6">

          <InputPanel
            prompt={prompt}
            setPrompt={setPrompt}
            state={state}
            analysis={analysis}
            assets={assets}
            selectedKey={selectedKey}
            campaignName={campaignName}
            setCampaignName={setCampaignName}
            isSaving={isSaving}
            user={user}
            onAnalyze={handleAnalyze}
            onGenerate={handleGenerate}
            onSave={handleSaveClick}
          />

          <LogSection logs={logs} state={state} />

          <AnalysisPanel analysis={analysis} />
        </div>

        {/* Right Column: Results Gallery */}
        <div className="lg:col-span-8">
          <AssetGallery assets={assets} />
        </div>
      </div>
    </div>
  );
};