import React, { useState } from 'react';
import {
  Link as LinkIcon,
  Search,
  RefreshCw,
  Sliders,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Lock,
  Unlock,
  Check,
  X,
  Sparkles,
  Calendar,
  Mail,
  HardDrive,
  Video,
  MessageSquare,
  FileText,
  CheckSquare,
  Code2,
  Cpu,
  Cloud,
  Zap,
  Globe,
  Radio,
  Share2,
  Key,
  Database,
  Layers,
  ArrowRight
} from 'lucide-react';
import { soundFx } from '../utils/soundEffects';

export type ConnectorCategory =
  | 'All'
  | 'Google Services'
  | 'Microsoft Services'
  | 'AI Providers'
  | 'Productivity'
  | 'Development'
  | 'Cloud Storage'
  | 'Communication'
  | 'Automation';

export interface ConnectorPermission {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  riskLevel?: 'low' | 'medium' | 'high';
}

export interface ConnectorItem {
  id: string;
  name: string;
  category: ConnectorCategory;
  description: string;
  iconName: string;
  status: 'connected' | 'disconnected' | 'syncing';
  connectedAccount?: string;
  lastSync?: string;
  brandBg: string;
  brandText: string;
  permissions: ConnectorPermission[];
}

const INITIAL_CONNECTORS: ConnectorItem[] = [
  // 1. Google Services
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    category: 'Google Services',
    description: 'Sync events, schedule reminders, and coordinate daily routines.',
    iconName: 'Calendar',
    status: 'connected',
    connectedAccount: 'lokeshgangavarapu1@gmail.com',
    lastSync: '5 mins ago',
    brandBg: 'bg-blue-50 border-blue-200',
    brandText: 'text-blue-600',
    permissions: [
      { id: 'gcal-read', label: 'View Calendar Events', description: 'Allows AI to view upcoming events and schedules.', enabled: true, riskLevel: 'low' },
      { id: 'gcal-write', label: 'Create & Edit Events', description: 'Allows AI to add new appointments when requested.', enabled: true, riskLevel: 'medium' },
      { id: 'gcal-notify', label: 'Send Reminders', description: 'Triggers gentle voice or chime reminders before meetings.', enabled: true, riskLevel: 'low' }
    ]
  },
  {
    id: 'google-drive',
    name: 'Google Drive',
    category: 'Google Services',
    description: 'Index documents and personal notes for context-aware conversations.',
    iconName: 'HardDrive',
    status: 'connected',
    connectedAccount: 'lokeshgangavarapu1@gmail.com',
    lastSync: '12 mins ago',
    brandBg: 'bg-emerald-50 border-emerald-200',
    brandText: 'text-emerald-600',
    permissions: [
      { id: 'gdrive-read', label: 'Read Selected Documents', description: 'Read-only access to files explicitly added to context.', enabled: true, riskLevel: 'medium' },
      { id: 'gdrive-search', label: 'Search Drive Index', description: 'Enables quick search for relevant meeting notes and PDFs.', enabled: true, riskLevel: 'low' }
    ]
  },
  {
    id: 'gmail',
    name: 'Gmail',
    category: 'Google Services',
    description: 'Summarize key emails and draft thoughtful replies on command.',
    iconName: 'Mail',
    status: 'disconnected',
    brandBg: 'bg-rose-50 border-rose-200',
    brandText: 'text-rose-600',
    permissions: [
      { id: 'gmail-read', label: 'Read Inbox Summaries', description: 'Generate AI summaries of incoming unread emails.', enabled: true, riskLevel: 'high' },
      { id: 'gmail-draft', label: 'Create Draft Emails', description: 'Draft email responses for manual user review.', enabled: false, riskLevel: 'medium' }
    ]
  },
  {
    id: 'google-meet',
    name: 'Google Meet',
    category: 'Google Services',
    description: 'Access meeting transcripts and auto-generate executive summaries.',
    iconName: 'Video',
    status: 'disconnected',
    brandBg: 'bg-teal-50 border-teal-200',
    brandText: 'text-teal-600',
    permissions: [
      { id: 'gmeet-transcript', label: 'Read Meeting Transcripts', description: 'Extract key action items from completed calls.', enabled: true, riskLevel: 'medium' }
    ]
  },

  // 2. Microsoft Services
  {
    id: 'ms-outlook',
    name: 'Microsoft Outlook',
    category: 'Microsoft Services',
    description: 'Sync Outlook calendar schedules and corporate mail alerts.',
    iconName: 'Mail',
    status: 'disconnected',
    brandBg: 'bg-sky-50 border-sky-200',
    brandText: 'text-sky-600',
    permissions: [
      { id: 'out-read', label: 'Read Outlook Schedule', description: 'Synchronize corporate calendar events with companion.', enabled: true, riskLevel: 'low' },
      { id: 'out-mail', label: 'Mail Summaries', description: 'Summarize critical work emails in morning brief.', enabled: false, riskLevel: 'medium' }
    ]
  },
  {
    id: 'ms-teams',
    name: 'Microsoft Teams',
    category: 'Microsoft Services',
    description: 'Receive channel notifications and present status updates.',
    iconName: 'MessageSquare',
    status: 'disconnected',
    brandBg: 'bg-indigo-50 border-indigo-200',
    brandText: 'text-indigo-600',
    permissions: [
      { id: 'teams-status', label: 'Sync Presence Status', description: 'Automatically adjust companion availability during calls.', enabled: true, riskLevel: 'low' }
    ]
  },
  {
    id: 'onedrive',
    name: 'Microsoft OneDrive',
    category: 'Microsoft Services',
    description: 'Access cloud document storage for workspace file referencing.',
    iconName: 'Cloud',
    status: 'disconnected',
    brandBg: 'bg-blue-50 border-blue-200',
    brandText: 'text-blue-600',
    permissions: [
      { id: 'od-read', label: 'Read File References', description: 'Read files shared in AI companion context.', enabled: true, riskLevel: 'medium' }
    ]
  },

  // 3. AI Providers
  {
    id: 'openai',
    name: 'OpenAI GPT-4o',
    category: 'AI Providers',
    description: 'Integrate custom API keys for multimodal vision and high-tier reasoning.',
    iconName: 'Cpu',
    status: 'connected',
    connectedAccount: 'api_key_sk-...9a4d',
    lastSync: 'Just now',
    brandBg: 'bg-purple-50 border-purple-200',
    brandText: 'text-purple-600',
    permissions: [
      { id: 'oai-vision', label: 'Multimodal Vision Processing', description: 'Send video camera frames for high-precision object detection.', enabled: true, riskLevel: 'medium' },
      { id: 'oai-reasoning', label: 'Complex Problem Solving', description: 'Route intricate queries to GPT-4o model.', enabled: true, riskLevel: 'low' }
    ]
  },
  {
    id: 'anthropic-claude',
    name: 'Anthropic Claude 3.5',
    category: 'AI Providers',
    description: 'Long-context document analysis and empathetic conversational depth.',
    iconName: 'Sparkles',
    status: 'connected',
    connectedAccount: 'claude_user_workspace',
    lastSync: '1 hour ago',
    brandBg: 'bg-amber-50 border-amber-200',
    brandText: 'text-amber-600',
    permissions: [
      { id: 'claude-context', label: '200k Token Context Search', description: 'Process long PDF books and research papers.', enabled: true, riskLevel: 'low' }
    ]
  },
  {
    id: 'replicate',
    name: 'Replicate AI',
    category: 'AI Providers',
    description: 'Generate custom visual artwork and audio background soundscapes.',
    iconName: 'Layers',
    status: 'disconnected',
    brandBg: 'bg-pink-50 border-pink-200',
    brandText: 'text-pink-600',
    permissions: [
      { id: 'rep-generate', label: 'Image & Audio Synthesis', description: 'Trigger open-source model generations.', enabled: true, riskLevel: 'low' }
    ]
  },

  // 4. Productivity
  {
    id: 'notion',
    name: 'Notion Workspace',
    category: 'Productivity',
    description: 'Read database pages, sync habit logs, and append journal entries.',
    iconName: 'FileText',
    status: 'connected',
    connectedAccount: 'Personal Workspace (Shizuka Vault)',
    lastSync: '18 mins ago',
    brandBg: 'bg-slate-100 border-slate-300',
    brandText: 'text-slate-800',
    permissions: [
      { id: 'notion-read', label: 'Read Journal & Notes', description: 'Access designated Notion databases for contextual memory.', enabled: true, riskLevel: 'medium' },
      { id: 'notion-append', label: 'Append Chat Reflections', description: 'Save summaries directly to Notion workspace.', enabled: true, riskLevel: 'low' }
    ]
  },
  {
    id: 'todoist',
    name: 'Todoist',
    category: 'Productivity',
    description: 'Real-time task synchronization, daily goal tracking, and reminders.',
    iconName: 'CheckSquare',
    status: 'connected',
    connectedAccount: 'Lokesh (Pro Plan)',
    lastSync: '2 mins ago',
    brandBg: 'bg-red-50 border-red-200',
    brandText: 'text-red-600',
    permissions: [
      { id: 'td-read', label: 'Read Daily Tasks', description: 'View current task list to prompt productivity check-ins.', enabled: true, riskLevel: 'low' },
      { id: 'td-add', label: 'Add New Tasks', description: 'Create tasks directly when speaking to companion.', enabled: true, riskLevel: 'low' }
    ]
  },
  {
    id: 'asana',
    name: 'Asana Projects',
    category: 'Productivity',
    description: 'Track project milestones, task assignments, and progress metrics.',
    iconName: 'Layers',
    status: 'disconnected',
    brandBg: 'bg-orange-50 border-orange-200',
    brandText: 'text-orange-600',
    permissions: [
      { id: 'asana-read', label: 'Read Project Tasks', description: 'Retrieve active sprint tickets.', enabled: true, riskLevel: 'low' }
    ]
  },

  // 5. Development
  {
    id: 'github',
    name: 'GitHub',
    category: 'Development',
    description: 'Inspect repositories, pull request reviews, and issue summaries.',
    iconName: 'Code2',
    status: 'connected',
    connectedAccount: '@lokesh-g (Verified)',
    lastSync: '30 mins ago',
    brandBg: 'bg-slate-100 border-slate-300',
    brandText: 'text-slate-900',
    permissions: [
      { id: 'gh-read', label: 'Read Repositories', description: 'Access public and selected private codebases.', enabled: true, riskLevel: 'medium' },
      { id: 'gh-issues', label: 'Read & Create Issues', description: 'Log bug reports or feature ideas directly.', enabled: true, riskLevel: 'medium' }
    ]
  },
  {
    id: 'jira',
    name: 'Atlassian Jira',
    category: 'Development',
    description: 'Sprint issue tracking, bug backlog queries, and team updates.',
    iconName: 'Layers',
    status: 'disconnected',
    brandBg: 'bg-blue-50 border-blue-200',
    brandText: 'text-blue-600',
    permissions: [
      { id: 'jira-read', label: 'Read Sprint Tickets', description: 'Summarize work assigned to user.', enabled: true, riskLevel: 'medium' }
    ]
  },

  // 6. Cloud Storage
  {
    id: 'dropbox',
    name: 'Dropbox Storage',
    category: 'Cloud Storage',
    description: 'Cloud document reference and media indexing for user memory.',
    iconName: 'Cloud',
    status: 'disconnected',
    brandBg: 'bg-blue-50 border-blue-200',
    brandText: 'text-blue-600',
    permissions: [
      { id: 'db-read', label: 'Read Shared Folders', description: 'Read file contents in Shizuka Companion folder.', enabled: true, riskLevel: 'medium' }
    ]
  },
  {
    id: 'aws-s3',
    name: 'AWS S3 Asset Bucket',
    category: 'Cloud Storage',
    description: 'Private secure asset cloud storage for custom avatar backgrounds.',
    iconName: 'Database',
    status: 'disconnected',
    brandBg: 'bg-amber-50 border-amber-200',
    brandText: 'text-amber-600',
    permissions: [
      { id: 's3-read', label: 'Read Custom Backgrounds', description: 'Fetch custom background textures.', enabled: true, riskLevel: 'low' }
    ]
  },

  // 7. Communication
  {
    id: 'slack',
    name: 'Slack Workspace',
    category: 'Communication',
    description: 'Receive channel digest highlights, direct mentions, and status sync.',
    iconName: 'MessageSquare',
    status: 'connected',
    connectedAccount: 'Acme HQ (#general)',
    lastSync: '4 mins ago',
    brandBg: 'bg-fuchsia-50 border-fuchsia-200',
    brandText: 'text-fuchsia-600',
    permissions: [
      { id: 'slack-read', label: 'Read Direct Mentions', description: 'Alert user when mentioned in urgent Slack messages.', enabled: true, riskLevel: 'high' },
      { id: 'slack-status', label: 'Set Slack Status', description: 'Set status to "In Zen Session with Shizuka" when active.', enabled: true, riskLevel: 'low' }
    ]
  },
  {
    id: 'discord',
    name: 'Discord Community',
    category: 'Communication',
    description: 'Server announcement highlights and voice channel activity updates.',
    iconName: 'Radio',
    status: 'disconnected',
    brandBg: 'bg-indigo-50 border-indigo-200',
    brandText: 'text-indigo-600',
    permissions: [
      { id: 'discord-read', label: 'Read Subscribed Channels', description: 'Highlight important server updates.', enabled: true, riskLevel: 'medium' }
    ]
  },

  // 8. Automation
  {
    id: 'zapier',
    name: 'Zapier Workflows',
    category: 'Automation',
    description: 'Trigger 5,000+ multi-app automated zaps based on companion interactions.',
    iconName: 'Zap',
    status: 'connected',
    connectedAccount: 'Zapier Pro Account',
    lastSync: '10 mins ago',
    brandBg: 'bg-orange-50 border-orange-200',
    brandText: 'text-orange-600',
    permissions: [
      { id: 'zap-trigger', label: 'Trigger Automated Webhooks', description: 'Send events when user completes goals or requests action.', enabled: true, riskLevel: 'medium' }
    ]
  },
  {
    id: 'make',
    name: 'Make (Integromat)',
    category: 'Automation',
    description: 'Execute complex scenarios, data transformations, and custom webhooks.',
    iconName: 'Globe',
    status: 'disconnected',
    brandBg: 'bg-purple-50 border-purple-200',
    brandText: 'text-purple-600',
    permissions: [
      { id: 'make-scenario', label: 'Run Automated Scenarios', description: 'Execute scenario hooks on command.', enabled: true, riskLevel: 'medium' }
    ]
  }
];

export const ConnectorsSection: React.FC = () => {
  const [connectors, setConnectors] = useState<ConnectorItem[]>(INITIAL_CONNECTORS);
  const [selectedCategory, setSelectedCategory] = useState<ConnectorCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'connected' | 'disconnected'>('all');

  // Modal State for Permissions
  const [activePermissionConnector, setActivePermissionConnector] = useState<ConnectorItem | null>(null);

  // Modal State for OAuth Simulation
  const [connectingConnector, setConnectingConnector] = useState<ConnectorItem | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Categories list
  const categories: ConnectorCategory[] = [
    'All',
    'Google Services',
    'Microsoft Services',
    'AI Providers',
    'Productivity',
    'Development',
    'Cloud Storage',
    'Communication',
    'Automation'
  ];

  // Helper to render icon
  const renderIcon = (iconName: string, className = 'w-5 h-5') => {
    switch (iconName) {
      case 'Calendar': return <Calendar className={className} />;
      case 'HardDrive': return <HardDrive className={className} />;
      case 'Mail': return <Mail className={className} />;
      case 'Video': return <Video className={className} />;
      case 'MessageSquare': return <MessageSquare className={className} />;
      case 'Cloud': return <Cloud className={className} />;
      case 'Cpu': return <Cpu className={className} />;
      case 'Sparkles': return <Sparkles className={className} />;
      case 'Layers': return <Layers className={className} />;
      case 'FileText': return <FileText className={className} />;
      case 'CheckSquare': return <CheckSquare className={className} />;
      case 'Code2': return <Code2 className={className} />;
      case 'Database': return <Database className={className} />;
      case 'Radio': return <Radio className={className} />;
      case 'Zap': return <Zap className={className} />;
      case 'Globe': return <Globe className={className} />;
      default: return <LinkIcon className={className} />;
    }
  };

  // Handle Connect / Disconnect
  const handleToggleConnect = (connector: ConnectorItem) => {
    soundFx.playClick();
    if (connector.status === 'connected') {
      // Disconnect
      setConnectors((prev) =>
        prev.map((item) =>
          item.id === connector.id
            ? { ...item, status: 'disconnected', connectedAccount: undefined, lastSync: undefined }
            : item
        )
      );
      showToast(`Disconnected ${connector.name}`);
    } else {
      // Open OAuth simulation
      setConnectingConnector(connector);
    }
  };

  // Simulate OAuth authorization step
  const confirmOAuthConnect = () => {
    if (!connectingConnector) return;
    soundFx.playClick();

    const targetId = connectingConnector.id;
    setConnectingConnector(null);

    // Set to syncing briefly then connected
    setConnectors((prev) =>
      prev.map((item) =>
        item.id === targetId
          ? { ...item, status: 'syncing' }
          : item
      )
    );

    setTimeout(() => {
      setConnectors((prev) =>
        prev.map((item) =>
          item.id === targetId
            ? {
                ...item,
                status: 'connected',
                connectedAccount: `${targetId.split('-')[0]}_user@account.com`,
                lastSync: 'Just now'
              }
            : item
        )
      );
      showToast(`Successfully connected to ${connectingConnector.name} via OAuth!`);
    }, 1200);
  };

  // Handle Sync Now
  const handleSyncNow = (id: string, name: string) => {
    soundFx.playClick();
    setConnectors((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'syncing' } : item
      )
    );

    setTimeout(() => {
      setConnectors((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: 'connected', lastSync: 'Just now' } : item
        )
      );
      showToast(`Finished syncing latest data with ${name}.`);
    }, 1500);
  };

  // Handle Permission Toggle inside Modal
  const handleTogglePermission = (permissionId: string) => {
    if (!activePermissionConnector) return;
    soundFx.playClick();

    const updatedPermissions = activePermissionConnector.permissions.map((p) =>
      p.id === permissionId ? { ...p, enabled: !p.enabled } : p
    );

    const updatedConnector = { ...activePermissionConnector, permissions: updatedPermissions };
    setActivePermissionConnector(updatedConnector);

    setConnectors((prev) =>
      prev.map((item) => (item.id === updatedConnector.id ? updatedConnector : item))
    );
  };

  // Filter logic
  const filteredConnectors = connectors.filter((c) => {
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'connected'
        ? c.status === 'connected'
        : c.status === 'disconnected';

    return matchesCategory && matchesSearch && matchesStatus;
  });

  // Count connected
  const connectedCount = connectors.filter((c) => c.status === 'connected').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 px-4 py-3 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-lg flex items-center gap-2.5 animate-in slide-in-from-top-2 duration-200">
          <Sparkles className="w-4 h-4 text-pink-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-pink-100/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center font-bold">
              <LinkIcon className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              Integrations & Connectors
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Authorize third-party OAuth providers to grant Shizuka companion safe, granular access to your schedule, notes, code repos, and communication apps.
          </p>
        </div>

        {/* Stats Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-pink-50 border border-pink-200/80 text-pink-700 text-xs font-semibold self-start sm:self-center">
          <ShieldCheck className="w-4 h-4 text-pink-500" />
          <span>{connectedCount} of {connectors.length} Connected</span>
        </div>
      </div>

      {/* Controls: Search Bar + Status Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white/70 backdrop-blur-md p-3 rounded-2xl border border-white/90 shadow-2xs">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Google, Notion, OpenAI, GitHub..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/80 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-pink-400 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {(['all', 'connected', 'disconnected'] as const).map((st) => (
            <button
              key={st}
              onClick={() => {
                soundFx.playClick();
                setStatusFilter(st);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-slate-800 text-white font-semibold shadow-2xs'
                  : 'bg-white/60 text-slate-600 hover:bg-white hover:text-slate-900 border border-slate-200/60'
              }`}
            >
              {st === 'all' ? 'All Status' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Category Navigation Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => {
                soundFx.playClick();
                setSelectedCategory(cat);
              }}
              className={`px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-pink-500 text-white shadow-xs scale-[1.02]'
                  : 'bg-white/80 text-slate-600 hover:bg-white hover:text-slate-900 border border-white/80'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Connector List Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredConnectors.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white/50 rounded-3xl border border-dashed border-slate-200 space-y-2">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-700">No connectors match your filter</h4>
            <p className="text-xs text-slate-500">Try clearing your search query or selecting another category.</p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="mt-2 px-4 py-2 rounded-xl bg-pink-100 text-pink-700 text-xs font-semibold hover:bg-pink-200 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredConnectors.map((connector) => {
            const isConnected = connector.status === 'connected';
            const isSyncing = connector.status === 'syncing';

            return (
              <div
                key={connector.id}
                className="group relative bg-white/80 hover:bg-white backdrop-blur-md rounded-3xl p-5 border border-white/90 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4"
              >
                {/* Top Row: Icon, Title, Status Badge */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center font-bold shadow-2xs ${connector.brandBg} ${connector.brandText}`}>
                        {renderIcon(connector.iconName, 'w-5 h-5')}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                          {connector.name}
                        </h4>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          {connector.category}
                        </span>
                      </div>
                    </div>

                    {/* Status Tag */}
                    <div>
                      {isSyncing ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-semibold animate-pulse">
                          <RefreshCw className="w-3 h-3 animate-spin text-amber-500" />
                          Syncing...
                        </span>
                      ) : isConnected ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          Connected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-500 text-[11px] font-medium">
                          <XCircle className="w-3.5 h-3.5 text-slate-400" />
                          Disconnected
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {connector.description}
                  </p>

                  {/* Account Info & Last Sync */}
                  {isConnected && (
                    <div className="p-2.5 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-1 text-[11px]">
                      <div className="flex justify-between items-center text-slate-700">
                        <span className="text-slate-400 font-medium">Account:</span>
                        <span className="font-semibold text-slate-800 truncate max-w-[190px]">
                          {connector.connectedAccount || 'User Authenticated'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-slate-500">
                        <span className="text-slate-400 font-medium">Last Synced:</span>
                        <span className="font-medium text-slate-600">{connector.lastSync || 'Recently'}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Action Bar */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {/* Manage Permissions Button */}
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        setActivePermissionConnector(connector);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Manage Data Permissions"
                    >
                      <Sliders className="w-3.5 h-3.5 text-slate-500" />
                      <span className="hidden sm:inline">Permissions</span>
                      <span className="sm:hidden font-normal text-[10px]">({connector.permissions.filter(p => p.enabled).length})</span>
                    </button>

                    {/* Sync Now Button (Only if Connected) */}
                    {isConnected && (
                      <button
                        disabled={isSyncing}
                        onClick={() => handleSyncNow(connector.id, connector.name)}
                        className="px-3 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                        title="Sync Latest Data"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 text-pink-500 ${isSyncing ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">Sync</span>
                      </button>
                    )}
                  </div>

                  {/* Connect / Disconnect Action Button */}
                  <button
                    onClick={() => handleToggleConnect(connector)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isConnected
                        ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80'
                        : 'bg-pink-500 hover:bg-pink-600 text-white shadow-2xs hover:shadow-xs'
                    }`}
                  >
                    {isConnected ? (
                      <>
                        <X className="w-3.5 h-3.5" />
                        <span>Disconnect</span>
                      </>
                    ) : (
                      <>
                        <Key className="w-3.5 h-3.5" />
                        <span>Connect OAuth</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ========================================================= */}
      {/* 1. PERMISSIONS MODAL SCREEN                                */}
      {/* ========================================================= */}
      {activePermissionConnector && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white/95 backdrop-blur-xl border border-white/90 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 relative animate-in zoom-in-95 duration-200">
            
            {/* Modal Close Icon */}
            <button
              onClick={() => setActivePermissionConnector(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center font-bold ${activePermissionConnector.brandBg} ${activePermissionConnector.brandText}`}>
                {renderIcon(activePermissionConnector.iconName, 'w-6 h-6')}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  {activePermissionConnector.name} Permissions
                </h3>
                <p className="text-xs text-slate-500">
                  Configure granular data access scopes for Shizuka companion
                </p>
              </div>
            </div>

            {/* Info Security Banner */}
            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-800 text-xs flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Shizuka only reads requested data on-demand during active chat or voice sessions. Your credentials and tokens are encrypted with AES-256.
              </p>
            </div>

            {/* Permissions Scope List */}
            <div className="space-y-3 max-h-[280px] overflow-y-auto no-scrollbar pr-1">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Granted Access Scopes
              </h4>

              {activePermissionConnector.permissions.map((perm) => (
                <div
                  key={perm.id}
                  onClick={() => handleTogglePermission(perm.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    perm.enabled
                      ? 'bg-pink-50/60 border-pink-200 text-slate-800'
                      : 'bg-slate-50/60 border-slate-200 text-slate-500 opacity-70'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">{perm.label}</span>
                      {perm.riskLevel === 'high' && (
                        <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-[9px] font-bold">
                          High Privacy Scope
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">{perm.description}</p>
                  </div>

                  {/* Toggle Switch */}
                  <div
                    className={`w-10 h-5 rounded-full transition-colors relative shrink-0 mt-0.5 ${
                      perm.enabled ? 'bg-pink-500' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.75 transition-transform ${
                        perm.enabled ? 'right-0.75' : 'left-0.75'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  soundFx.playClick();
                  // Reset all permissions to enabled
                  const resetPerms = activePermissionConnector.permissions.map((p) => ({
                    ...p,
                    enabled: true
                  }));
                  const updated = { ...activePermissionConnector, permissions: resetPerms };
                  setActivePermissionConnector(updated);
                  setConnectors((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
                }}
                className="text-xs text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
              >
                Reset Default Scopes
              </button>

              <button
                onClick={() => {
                  soundFx.playClick();
                  setActivePermissionConnector(null);
                  showToast(`Updated permissions for ${activePermissionConnector.name}`);
                }}
                className="px-6 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 text-pink-400" />
                <span>Save Scopes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. OAUTH AUTHORIZATION SIMULATION MODAL                    */}
      {/* ========================================================= */}
      {connectingConnector && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 relative animate-in zoom-in-95 duration-200 border border-slate-100">
            
            <div className="text-center space-y-3">
              <div className={`w-16 h-16 rounded-3xl border mx-auto flex items-center justify-center font-bold ${connectingConnector.brandBg} ${connectingConnector.brandText} shadow-md`}>
                {renderIcon(connectingConnector.iconName, 'w-8 h-8')}
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                Authorize {connectingConnector.name}
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Shizuka AI Companion is requesting permission to securely link your account using OAuth 2.0.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
              <div className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-500" />
                <span>Requested Access Permissions:</span>
              </div>
              <ul className="space-y-1 text-[11px] text-slate-600 pl-5 list-disc">
                {connectingConnector.permissions.map((p) => (
                  <li key={p.id}>{p.label}</li>
                ))}
              </ul>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setConnectingConnector(null)}
                className="flex-1 py-2.5 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmOAuthConnect}
                className="flex-1 py-2.5 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Authorize OAuth</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
