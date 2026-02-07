import React, { useEffect, useState } from 'react';
import { getCampaigns, deleteCampaign } from '../services/supabase';
import { Button, Card, Spinner } from './UI';

interface CampaignListModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    onLoad: (campaign: any) => void;
}

export const CampaignListModal: React.FC<CampaignListModalProps> = ({ isOpen, onClose, userId, onLoad }) => {
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && userId) {
            fetchCampaigns();
        }
    }, [isOpen, userId]);

    const fetchCampaigns = async () => {
        setLoading(true);
        try {
            const data = await getCampaigns(userId);
            setCampaigns(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this campaign? This action cannot be undone.")) return;
        
        setDeletingId(id);
        try {
            await deleteCampaign(id);
            setCampaigns(prev => prev.filter(c => c.id !== id));
        } catch (error) {
            console.error("Failed to delete", error);
        } finally {
            setDeletingId(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <Card className="w-full max-w-2xl bg-dark-800 shadow-2xl shadow-black flex flex-col max-h-[80vh]">
                <div className="p-6 border-b border-dark-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <svg className="w-6 h-6 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
                        My Campaigns
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto flex-1 scrollbar-hide">
                    {loading ? (
                        <div className="flex justify-center py-8"><Spinner size="lg" /></div>
                    ) : campaigns.length === 0 ? (
                        <div className="text-center text-gray-500 py-12 border-2 border-dashed border-dark-700 rounded-xl">
                            <p className="mb-2">No saved campaigns found.</p>
                            <p className="text-sm">Create a new campaign to see it here.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {campaigns.map(campaign => (
                                <div key={campaign.id} className="bg-dark-900/50 border border-dark-700 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-brand-500/30 transition-colors group">
                                    <div>
                                        <h3 className="font-bold text-white group-hover:text-brand-300 transition-colors">{campaign.name || "Untitled Campaign"}</h3>
                                        <div className="text-xs text-gray-500 mt-2 flex flex-wrap gap-2 items-center">
                                            <span className="bg-dark-800 px-2 py-1 rounded text-gray-400">{campaign.brand_name}</span>
                                            <span className="text-dark-600">•</span>
                                            <span>{new Date(campaign.created_at).toLocaleDateString()}</span>
                                            <span className="text-dark-600">•</span>
                                            <span>{campaign.assets_data?.length || 0} Assets</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 w-full sm:w-auto">
                                        <Button 
                                            variant="secondary" 
                                            className="text-xs py-2 px-3 flex-1 sm:flex-none"
                                            onClick={() => onLoad(campaign)}
                                        >
                                            Load
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            className="text-xs py-2 px-3 border-red-900/50 text-red-400 hover:bg-red-900/20 hover:border-red-800 hover:text-red-300 flex-1 sm:flex-none"
                                            onClick={(e) => handleDelete(e, campaign.id)}
                                            disabled={deletingId === campaign.id}
                                        >
                                            {deletingId === campaign.id ? <Spinner size="sm"/> : 'Delete'}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};
