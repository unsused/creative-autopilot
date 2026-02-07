import React from 'react';
import { AgentState } from '../../types/index';
import { Spinner, TerminalLog } from '../UI';

export const LogSection: React.FC<{ logs: string[]; state: AgentState }> = ({ logs, state }) => {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-500 uppercase tracking-wider font-semibold">
                <span>Agent Process Log</span>
                {(state === AgentState.ANALYZING || state === AgentState.GENERATING) && <Spinner size="sm" />}
            </div>
            <TerminalLog logs={logs} />
        </div>
    );
};