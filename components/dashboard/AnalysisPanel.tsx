import React from 'react';
import { BrandAnalysis } from '../../types/index';
import { Card } from '../UI';

export const AnalysisPanel: React.FC<{ analysis: BrandAnalysis | null }> = ({ analysis }) => {
    if (!analysis) return null;
    return (
        <Card className="p-5 border-l-4 border-l-brand-500">
            <h3 className="text-lg font-bold text-white mb-4">Brand Strategy</h3>
            <div className="space-y-3 text-sm">
                <div>
                    <span className="text-gray-500 block text-xs uppercase">Brand Name</span>
                    <span className="text-brand-300 font-medium">{analysis.brandName}</span>
                </div>
                <div>
                    <span className="text-gray-500 block text-xs uppercase">Personality</span>
                    <span className="text-gray-300">{analysis.personality}</span>
                </div>
                <div>
                    <span className="text-gray-500 block text-xs uppercase">Target Audience</span>
                    <span className="text-gray-300">{analysis.targetAudience}</span>
                </div>
                <div>
                    <span className="text-gray-500 block text-xs uppercase mb-1">Color Palette</span>
                    <div className="flex gap-2">
                        {analysis.colorPalette.map((color, i) => (
                            <div key={i} className="w-6 h-6 rounded-full ring-1 ring-white/10" style={{ backgroundColor: color }} title={color} />
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    );
};