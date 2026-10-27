import { useState } from 'react';
import type { AutomationRule } from '../../types';
import { useDataService } from '../../hooks/useDataService';
import { ToggleRight, Zap, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export function AutomationRules() {
  const dataService = useDataService();
  const rules = dataService.getAutomationRules();

  const handleToggle = async (ruleId: string, enabled: boolean) => {
    await dataService.toggleAutomationRule(ruleId, enabled);
  };

  const getRuleIcon = (ruleName: string) => {
    if (ruleName.toLowerCase().includes('temp') || ruleName.toLowerCase().includes('ac')) {
      return Zap;
    }
    return Clock;
  };

  const enabledCount = rules.filter(r => r.enabled).length;
  const triggeredCount = rules.filter(r => r.lastTriggered).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Automation Rules</h2>
        <p className="text-gray-400 text-sm">Manage smart office automation</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface rounded-lg border border-gray-800 p-4">
          <div className="text-sm text-gray-400 mb-1">Total Rules</div>
          <div className="text-2xl font-bold text-white">{rules.length}</div>
        </div>
        <div className="bg-surface rounded-lg border border-gray-800 p-4">
          <div className="text-sm text-gray-400 mb-1">Enabled</div>
          <div className="text-2xl font-bold text-green-400">{enabledCount}</div>
        </div>
        <div className="bg-surface rounded-lg border border-gray-800 p-4">
          <div className="text-sm text-gray-400 mb-1">Triggered Today</div>
          <div className="text-2xl font-bold text-blue-400">{triggeredCount}</div>
        </div>
      </div>

      {/* Rules List */}
      <div className="space-y-4">
        {rules.map((rule) => {
          const Icon = getRuleIcon(rule.name);
          const isRecentlyTriggered = rule.lastTriggered &&
            (Date.now() - new Date(rule.lastTriggered).getTime()) < 3600000; // Within last hour

          return (
            <div
              key={rule.id}
              className={`bg-surface rounded-lg border ${
                rule.enabled ? 'border-gray-700' : 'border-gray-800 opacity-60'
              } p-6 transition-all`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start flex-1">
                  <div className={`p-3 rounded-lg mr-4 ${
                    rule.enabled ? 'bg-primary/20' : 'bg-surfaceLight'
                  }`}>
                    <Icon size={24} className={rule.enabled ? 'text-primary' : 'text-gray-400'} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-white">{rule.name}</h3>
                      {isRecentlyTriggered && (
                        <span className="flex items-center text-xs text-green-400 bg-green-900/30 px-2 py-0.5 rounded">
                          <Clock size={12} className="mr-1" />
                          Recently triggered
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-surfaceLight rounded-lg p-3">
                        <div className="text-xs text-gray-400 mb-1">Condition</div>
                        <div className="text-sm text-white">{rule.condition}</div>
                      </div>
                      <div className="bg-surfaceLight rounded-lg p-3">
                        <div className="text-xs text-gray-400 mb-1">Action</div>
                        <div className="text-sm text-white">{rule.action}</div>
                      </div>
                    </div>

                    {rule.lastTriggered && (
                      <div className="flex items-center text-sm text-gray-400">
                        <Clock size={14} className="mr-2" />
                        Last triggered: {new Date(rule.lastTriggered).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="ml-4">
                  <button
                    onClick={() => handleToggle(rule.id, !rule.enabled)}
                    className={`relative inline-flex h-12 w-24 items-center rounded-full transition-colors ${
                      rule.enabled ? 'bg-primary' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-10 w-10 transform rounded-full bg-white transition-transform ${
                        rule.enabled ? 'translate-x-12' : 'translate-x-2'
                      }`}
                    />
                  </button>
                  <div className="text-center mt-2 text-xs text-gray-400">
                    {rule.enabled ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Box */}
      <div className="bg-surface rounded-lg border border-gray-800 p-4 flex items-start gap-3">
        <AlertCircle size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-gray-300">
          <span className="font-medium text-white">Note:</span> Automation rules are evaluated continuously based on sensor data and device states. Toggle rules on/off to enable or disable automated responses.
        </div>
      </div>
    </div>
  );
}
