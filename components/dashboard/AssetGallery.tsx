import React from 'react';
import { GeneratedAsset, AssetType } from '../../types/index';
import { Card, Badge, Spinner } from '../UI';

export const AssetGallery: React.FC<{ assets: GeneratedAsset[] }> = ({ assets }) => {
    if (assets.length === 0) {
        return (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-gray-600 border-2 border-dashed border-dark-700 rounded-2xl bg-dark-800/20">
                <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                <p>Enter a prompt to begin generation</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assets.map((asset) => (
                <Card key={asset.id} className="flex flex-col h-full bg-dark-800 transition-all hover:border-dark-600 border border-dark-700">
                    <div className="p-4 border-b border-dark-700 flex justify-between items-start">
                        <div>
                            <Badge color={
                                asset.type === AssetType.LOGO ? 'bg-purple-900 text-purple-200' :
                                asset.type === AssetType.STORYBOARD_FRAME ? 'bg-blue-900 text-blue-200' :
                                asset.type === AssetType.COPYWRITING ? 'bg-green-900 text-green-200' :
                                'bg-pink-900 text-pink-200'
                            }>
                                {asset.type.replace('_', ' ')}
                            </Badge>
                            <h4 className="mt-2 text-sm font-medium text-gray-300">{asset.description}</h4>
                        </div>
                        {asset.status === 'FAILED' && (
                            <span className="text-red-500 font-bold text-xs bg-red-900/20 px-2 py-1 rounded">FAILED</span>
                        )}
                    </div>

                    <div className="flex-1 min-h-[200px] relative bg-black/20 flex flex-col items-center justify-center overflow-hidden">
                        {asset.status === 'PENDING' && (
                            <span className="text-xs text-gray-500 uppercase tracking-widest">Pending Approval</span>
                        )}
                        
                        {asset.status === 'GENERATING' && (
                            <div className="flex flex-col items-center gap-2">
                                <Spinner size="lg" />
                                <span className="text-xs text-brand-400 animate-pulse">Creating...</span>
                            </div>
                        )}

                        {asset.status === 'COMPLETED' && (
                            <>
                                {asset.imageUrl && (
                                    <div className="w-full h-full relative group">
                                        <img src={asset.imageUrl} alt={asset.description} className="w-full h-auto object-cover max-h-[400px]" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <a 
                                                href={asset.imageUrl} 
                                                download={`asset-${asset.id}.png`}
                                                className="bg-white text-black px-4 py-2 rounded-full font-bold text-xs hover:bg-gray-200 transition-colors"
                                            >
                                                Download
                                            </a>
                                        </div>
                                    </div>
                                )}
                                {asset.textContent && (
                                    <div className="w-full h-full p-6 bg-dark-800/50 flex flex-col justify-center">
                                        <div className="text-xl font-serif italic text-white leading-relaxed text-center">
                                            "{asset.textContent.replace(/"/g, '')}"
                                        </div>
                                        <div className="mt-4 flex justify-center">
                                            <button 
                                                onClick={() => navigator.clipboard.writeText(asset.textContent || "")}
                                                className="text-xs text-gray-500 hover:text-brand-400 transition-colors flex items-center gap-1"
                                            >
                                                Copy Text
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                        
                        {asset.status === 'FAILED' && (
                            <div className="p-4 text-center">
                                <svg className="w-10 h-10 text-red-500/50 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                <span className="text-red-400 text-sm block">Generation Failed</span>
                                <p className="text-xs text-gray-500 mt-1">Please try again later.</p>
                            </div>
                        )}
                    </div>

                    <div className="p-3 bg-dark-900/30 text-xs text-gray-500 border-t border-dark-700">
                            <span className="font-semibold text-gray-400">AI Rationale:</span> {asset.rationale}
                    </div>
                </Card>
            ))}
        </div>
    );
};