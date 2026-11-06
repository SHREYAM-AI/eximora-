import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  MessageSquare,
  Sparkles,
  Search,
  Filter,
  Wheat,
  Cpu,
  ShieldCheck,
  Send,
  ThumbsUp,
  FileText,
  ArrowRight,
  Plus,
  BookOpen,
  HelpCircle,
  Clock,
  MapPin,
  Building,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  X,
  Share2,
} from 'lucide-react';
import { CommunityPost, CommunityReply, IndustryInsight, CommunityChannel, PostType, UserRole } from '../types/community';
import { TradeCorridor } from '../types/order';

interface TradeCommunityHubProps {
  onOpenOrderModal: (corridor: TradeCorridor, presetPrompt?: string) => void;
}

export function TradeCommunityHub({ onOpenOrderModal }: TradeCommunityHubProps) {
  const [activeTab, setActiveTab] = useState<'exchange' | 'insights' | 'ai_advisor'>('exchange');
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [insights, setInsights] = useState<IndustryInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<CommunityChannel>('all');
  const [selectedPostType, setSelectedPostType] = useState<'all' | PostType>('all');

  // Expanded replies state
  const [expandedPostIds, setExpandedPostIds] = useState<Record<string, boolean>>({
    'post-exm-001': true,
    'post-exm-002': true,
  });

  // Reply input state per post
  const [replyInputs, setReplyInputs] = useState<Record<string, { authorName: string; authorCompany: string; authorRole: UserRole; content: string }>>({});
  const [submittingReplyPostId, setSubmittingReplyPostId] = useState<string | null>(null);

  // New Post Modal
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const [newPostForm, setNewPostForm] = useState<{
    title: string;
    channel: 'export_agro' | 'import_electronics' | 'regulations_logistics';
    postType: PostType;
    authorName: string;
    authorCompany: string;
    authorRole: UserRole;
    authorLocation: string;
    commodityOrTopic: string;
    content: string;
    tags: string;
    suggestedQty: string;
    suggestedUnit: string;
    incoterm: 'FOB' | 'CIF' | 'CFR' | 'DDP' | 'EXW';
    destination: string;
  }>({
    title: '',
    channel: 'export_agro',
    postType: 'buy_inquiry',
    authorName: '',
    authorCompany: '',
    authorRole: 'Overseas Buyer',
    authorLocation: '',
    commodityOrTopic: '',
    content: '',
    tags: '',
    suggestedQty: '',
    suggestedUnit: 'Metric Tons',
    incoterm: 'CIF',
    destination: '',
  });

  // AI Advisor State
  const [advisorTopic, setAdvisorTopic] = useState('');
  const [advisorLoading, setAdvisorLoading] = useState(false);
  const [advisorBrief, setAdvisorBrief] = useState<{
    title: string;
    summary: string;
    keyTakeaways: string[];
    operationalImpact: string;
    relevantStandards: string[];
  } | null>(null);

  // Expanded Insight Modal
  const [selectedInsight, setSelectedInsight] = useState<IndustryInsight | null>(null);

  // Fetch posts and insights on mount
  useEffect(() => {
    fetchCommunityData();
  }, []);

  const fetchCommunityData = async () => {
    setIsLoading(true);
    try {
      const [postsRes, insightsRes] = await Promise.all([
        fetch('/api/community/posts'),
        fetch('/api/community/insights'),
      ]);

      if (postsRes.ok) {
        const postsData = await postsRes.json();
        if (Array.isArray(postsData.posts)) {
          setPosts(postsData.posts);
        }
      }

      if (insightsRes.ok) {
        const insightsData = await insightsRes.json();
        if (Array.isArray(insightsData.insights)) {
          setInsights(insightsData.insights);
        }
      }
    } catch (err) {
      console.warn('Could not load community data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleExpandReplies = (postId: string) => {
    setExpandedPostIds((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const handleUpvote = async (postId: string) => {
    // Optimistic UI update
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, upvotes: p.upvotes + 1 } : p))
    );

    try {
      await fetch(`/api/community/posts/${postId}/upvote`, { method: 'POST' });
    } catch (err) {
      console.warn('Failed to register upvote:', err);
    }
  };

  const handleReplyChange = (postId: string, field: string, value: string) => {
    setReplyInputs((prev) => ({
      ...prev,
      [postId]: {
        authorName: prev[postId]?.authorName || '',
        authorCompany: prev[postId]?.authorCompany || '',
        authorRole: (prev[postId]?.authorRole as UserRole) || 'Indian Wholesaler',
        content: prev[postId]?.content || '',
        [field]: value,
      },
    }));
  };

  const handleSubmitReply = async (postId: string) => {
    const input = replyInputs[postId];
    if (!input || !input.content.trim() || !input.authorName.trim()) {
      alert('Please enter your name and message content before submitting.');
      return;
    }

    setSubmittingReplyPostId(postId);
    try {
      const res = await fetch(`/api/community/posts/${postId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorName: input.authorName,
          authorCompany: input.authorCompany || 'Commercial Trader',
          authorRole: input.authorRole,
          authorLocation: 'India',
          content: input.content,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.reply) {
          setPosts((prev) =>
            prev.map((p) =>
              p.id === postId ? { ...p, replies: [...p.replies, data.reply] } : p
            )
          );
          // Clear input
          setReplyInputs((prev) => ({
            ...prev,
            [postId]: {
              authorName: input.authorName,
              authorCompany: input.authorCompany,
              authorRole: input.authorRole,
              content: '',
            },
          }));
        }
      }
    } catch (err) {
      console.error('Failed to submit reply:', err);
    } finally {
      setSubmittingReplyPostId(null);
    }
  };

  const handleCreateNewPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostForm.title.trim() || !newPostForm.content.trim() || !newPostForm.authorName.trim()) {
      alert('Please fill out the title, content, and your author name.');
      return;
    }

    try {
      const parsedTags = newPostForm.tags
        ? newPostForm.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [newPostForm.commodityOrTopic || 'Trade Inquiry'];

      const payload = {
        title: newPostForm.title,
        channel: newPostForm.channel,
        postType: newPostForm.postType,
        authorName: newPostForm.authorName,
        authorCompany: newPostForm.authorCompany || 'Commercial Trade Entity',
        authorRole: newPostForm.authorRole,
        authorLocation: newPostForm.authorLocation || 'India',
        commodityOrTopic: newPostForm.commodityOrTopic || newPostForm.title,
        corridor: newPostForm.channel === 'import_electronics' ? 'import_electronics' : newPostForm.channel === 'export_agro' ? 'export_agro' : 'bilateral',
        tags: parsedTags,
        content: newPostForm.content,
        formalTradeSpecs:
          newPostForm.suggestedQty
            ? {
                suggestedProduct: newPostForm.commodityOrTopic || newPostForm.title,
                quantity: newPostForm.suggestedQty,
                unit: newPostForm.suggestedUnit,
                origin: newPostForm.channel === 'export_agro' ? 'India' : 'Global Hub',
                destination: newPostForm.destination || 'Destination Port',
                incoterm: newPostForm.incoterm,
              }
            : undefined,
      };

      const res = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.post) {
          setPosts((prev) => [data.post, ...prev]);
          setIsNewPostModalOpen(false);
          // Reset form
          setNewPostForm({
            title: '',
            channel: 'export_agro',
            postType: 'buy_inquiry',
            authorName: '',
            authorCompany: '',
            authorRole: 'Overseas Buyer',
            authorLocation: '',
            commodityOrTopic: '',
            content: '',
            tags: '',
            suggestedQty: '',
            suggestedUnit: 'Metric Tons',
            incoterm: 'CIF',
            destination: '',
          });
        }
      }
    } catch (err) {
      console.error('Failed to create post:', err);
    }
  };

  const handleGenerateAdvisorBrief = async (topicToQuery?: string) => {
    const q = topicToQuery || advisorTopic;
    if (!q.trim()) return;

    setAdvisorLoading(true);
    setAdvisorBrief(null);
    try {
      const res = await fetch('/api/community/generate-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: q,
          corridor: q.toLowerCase().includes('charger') || q.toLowerCase().includes('electronic') ? 'import_electronics' : 'export_agro',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.brief) {
          setAdvisorBrief(data.brief);
        }
      }
    } catch (err) {
      console.warn('Failed to generate brief:', err);
    } finally {
      setAdvisorLoading(false);
    }
  };

  const handleFormalizeOrderFromPost = (post: CommunityPost) => {
    const corridor: TradeCorridor = post.channel === 'import_electronics' ? 'import_electronics' : 'export_agro';
    const preset = `${post.title}: We want to execute this trade inquiry under Eximora's asset-light sourcing and quality certification standard. Specifications: ${post.content}`;
    onOpenOrderModal(corridor, preset);
  };

  // Filtered posts
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      if (selectedChannel !== 'all' && p.channel !== selectedChannel) return false;
      if (selectedPostType !== 'all' && p.postType !== selectedPostType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = p.title.toLowerCase().includes(q);
        const inContent = p.content.toLowerCase().includes(q);
        const inAuthor = p.authorCompany.toLowerCase().includes(q) || p.authorName.toLowerCase().includes(q);
        const inTags = p.tags.some((t) => t.toLowerCase().includes(q));
        if (!inTitle && !inContent && !inAuthor && !inTags) return false;
      }
      return true;
    });
  }, [posts, selectedChannel, selectedPostType, searchQuery]);

  return (
    <div id="trade-community" className="w-full max-w-5xl mx-auto scroll-mt-20 text-left">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-amber-800 dark:text-amber-300/80 mb-2 font-semibold">
            <Users className="w-3.5 h-3.5 text-amber-700 dark:text-amber-300" />
            <span>Two-Way Import-Export Community</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 dark:text-white tracking-tight">
            Bilateral Trade Exchange & Industry Insights
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-xl font-light">
            An open forum connecting overseas buyers, Indian agricultural farmer cooperatives, electronics manufacturing partners, and wholesale distributors. Exchange commercial inquiries, discuss harvest allocations, and gain compliance insights.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setIsNewPostModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-black bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300 hover:from-amber-200 hover:to-amber-300 active:scale-[0.98] rounded-xl transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Post Trade Inquiry</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="rounded-2xl bg-white dark:bg-[#090A0F] border border-slate-200 dark:border-white/15 p-5 sm:p-7 shadow-xl dark:shadow-2xl transition-colors">
        {/* Navigation Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-white/[0.03] rounded-lg border border-slate-200 dark:border-white/10 text-xs font-mono">
            <button
              type="button"
              onClick={() => setActiveTab('exchange')}
              className={`px-3 py-1.5 rounded transition-colors flex items-center gap-2 ${
                activeTab === 'exchange' ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-white font-medium shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-600 dark:text-amber-300" />
              <span>Community Exchange ({posts.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('insights')}
              className={`px-3 py-1.5 rounded transition-colors flex items-center gap-2 ${
                activeTab === 'insights' ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-white font-medium shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Industry Insights ({insights.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ai_advisor')}
              className={`px-3 py-1.5 rounded transition-colors flex items-center gap-2 ${
                activeTab === 'ai_advisor' ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-white font-medium shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-300" />
              <span>AI Trade Regulatory Advisor</span>
            </button>
          </div>

          <div className="text-xs font-mono text-slate-500">
            <span>Direct Buyer & Seller Network</span>
          </div>
        </div>

        {/* TAB 1: COMMUNITY EXCHANGE */}
        {activeTab === 'exchange' && (
          <div className="mt-6 space-y-6">
            {/* Search and Channel Filters */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search inquiries, commodities, ports, certifications..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              {/* Channels & Intent Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-white/[0.03] rounded-lg border border-slate-200 dark:border-white/10 text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => setSelectedChannel('all')}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      selectedChannel === 'all' ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    All Channels
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedChannel('export_agro')}
                    className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                      selectedChannel === 'export_agro' ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Wheat className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>Food Exports</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedChannel('import_electronics')}
                    className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                      selectedChannel === 'import_electronics' ? 'bg-amber-50 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Cpu className="w-3 h-3 text-amber-600 dark:text-amber-300" />
                    <span>Electronics Imports</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedChannel('regulations_logistics')}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      selectedChannel === 'regulations_logistics' ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Logistics & Regs
                  </button>
                </div>

                <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-white/[0.03] rounded-lg border border-slate-200 dark:border-white/10 text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => setSelectedPostType('all')}
                    className={`px-2 py-1 rounded transition-colors ${
                      selectedPostType === 'all' ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    All Types
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPostType('buy_inquiry')}
                    className={`px-2 py-1 rounded transition-colors ${
                      selectedPostType === 'buy_inquiry' ? 'bg-blue-50 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Buy Inquiries
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPostType('supply_offer')}
                    className={`px-2 py-1 rounded transition-colors ${
                      selectedPostType === 'supply_offer' ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Supply Offers
                  </button>
                </div>
              </div>
            </div>

            {/* Posts Stream */}
            {filteredPosts.length === 0 ? (
              <div className="py-14 text-center border border-dashed border-slate-300 dark:border-white/10 rounded-xl bg-white dark:bg-white/[0.01]">
                <MessageSquare className="w-8 h-8 mx-auto text-slate-400 dark:text-slate-500 mb-2" />
                <h4 className="text-sm font-medium text-slate-900 dark:text-white">No Discussions in This Channel</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                  Be the first to post a buy inquiry, supply offer, or regulatory question.
                </p>
                <button
                  type="button"
                  onClick={() => setIsNewPostModalOpen(true)}
                  className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-black bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300 hover:from-amber-200 hover:to-amber-300 rounded-lg transition-all cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Start a Discussion</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPosts.map((post) => {
                  const isExpanded = expandedPostIds[post.id] ?? false;
                  const currentReplyInput = replyInputs[post.id] || {
                    authorName: '',
                    authorCompany: '',
                    authorRole: 'Indian Wholesaler' as UserRole,
                    content: '',
                  };

                  return (
                    <div
                      key={post.id}
                      className="p-5 rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all text-left shadow-xs"
                    >
                      {/* Top Author & Metadata Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-white/5 text-xs">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-white/[0.06] border border-slate-300 dark:border-white/15 flex items-center justify-center font-serif text-xs font-semibold text-amber-700 dark:text-amber-200">
                            {post.authorName.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-slate-900 dark:text-white">{post.authorName}</span>
                              {post.isVerifiedPartner && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-700 dark:text-amber-300 font-mono font-medium">
                                  <ShieldCheck className="w-3 h-3 text-amber-600 dark:text-amber-300" />
                                  <span>Verified Partner</span>
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                              <span>{post.authorCompany}</span>
                              <span className="mx-1">·</span>
                              <span className="text-amber-800 dark:text-amber-200/90 font-medium">{post.authorRole}</span>
                              <span className="mx-1">·</span>
                              <span>{post.authorLocation}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
                          {post.postType === 'buy_inquiry' && (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-blue-50 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/30 text-blue-800 dark:text-blue-300 font-medium">
                              Buy Inquiry
                            </span>
                          )}
                          {post.postType === 'supply_offer' && (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 font-medium">
                              Supply Offer
                            </span>
                          )}
                          {post.postType === 'market_insight' && (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-amber-50 dark:bg-amber-400/15 border border-amber-200 dark:border-amber-400/30 text-amber-800 dark:text-amber-300 font-medium">
                              Market Advisory
                            </span>
                          )}
                          <span>{post.timestamp}</span>
                        </div>
                      </div>

                      {/* Post Content */}
                      <div className="my-3 space-y-2">
                        <h3 className="text-base font-serif font-semibold text-slate-900 dark:text-white hover:text-amber-700 dark:hover:text-amber-200 transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-light">
                          {post.content}
                        </p>
                      </div>

                      {/* Formal Trade Specs Box (if present) */}
                      {post.formalTradeSpecs && (
                        <div className="my-3 p-3 rounded-lg bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono shadow-xs">
                          <div>
                            <span className="text-[10px] uppercase text-slate-500 block">Commodity</span>
                            <span className="text-slate-900 dark:text-white font-medium">{post.formalTradeSpecs.suggestedProduct}</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase text-slate-500 block">Volume</span>
                            <span className="text-amber-800 dark:text-amber-200 font-semibold">{post.formalTradeSpecs.quantity} {post.formalTradeSpecs.unit}</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase text-slate-500 block">Corridor Route</span>
                            <span className="text-slate-700 dark:text-slate-300">{post.formalTradeSpecs.incoterm} → {post.formalTradeSpecs.destination}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleFormalizeOrderFromPost(post)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-[11px] font-semibold uppercase tracking-wider text-black bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300 hover:from-amber-200 hover:to-amber-300 transition-all cursor-pointer shadow-xs"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>Formalize as AI Order</span>
                          </button>
                        </div>
                      )}

                      {/* Tags */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        {post.tags.map((t, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>

                      {/* Action Bar (Upvote & Reply Count Toggle) */}
                      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center gap-4">
                          <button
                            type="button"
                            onClick={() => handleUpvote(post.id)}
                            className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors cursor-pointer"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>Endorse ({post.upvotes})</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleExpandReplies(post.id)}
                            className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Replies ({post.replies.length})</span>
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        </div>

                        <span className="text-[11px] text-slate-500">Asset-Light Community Node</span>
                      </div>

                      {/* Expanded Replies & Direct Counter-Offers */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/5 space-y-3 bg-slate-100/70 dark:bg-black/20 p-3.5 rounded-lg">
                          <h4 className="text-xs font-mono uppercase text-slate-500 dark:text-slate-400 tracking-wider font-semibold">
                            Direct Counterparty Responses ({post.replies.length})
                          </h4>

                          {post.replies.length === 0 ? (
                            <p className="text-xs text-slate-500 italic py-2">
                              No responses yet. Be the first partner to respond or offer allocation.
                            </p>
                          ) : (
                            <div className="space-y-2.5">
                              {post.replies.map((reply) => (
                                <div
                                  key={reply.id}
                                  className="p-3 rounded-lg bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 text-xs text-left shadow-xs"
                                >
                                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono mb-1">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-semibold text-slate-900 dark:text-white font-sans">{reply.authorName}</span>
                                      <span>·</span>
                                      <span className="text-amber-800 dark:text-amber-200 font-medium">{reply.authorCompany}</span>
                                      <span>·</span>
                                      <span className="text-slate-600 dark:text-slate-400">{reply.authorRole}</span>
                                    </div>
                                    <span>{reply.timestamp}</span>
                                  </div>
                                  <p className="text-slate-700 dark:text-slate-300 font-light leading-relaxed">{reply.content}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Quick Reply Form */}
                          <div className="pt-3 border-t border-slate-200 dark:border-white/5 space-y-2">
                            <span className="text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400 block font-medium">
                              Reply to {post.authorName} ({post.authorCompany})
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                              <input
                                type="text"
                                placeholder="Your Name"
                                value={currentReplyInput.authorName}
                                onChange={(e) => handleReplyChange(post.id, 'authorName', e.target.value)}
                                className="px-3 py-1.5 rounded bg-white dark:bg-white/[0.04] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500"
                              />
                              <input
                                type="text"
                                placeholder="Your Company / Co-op"
                                value={currentReplyInput.authorCompany}
                                onChange={(e) => handleReplyChange(post.id, 'authorCompany', e.target.value)}
                                className="px-3 py-1.5 rounded bg-white dark:bg-white/[0.04] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500"
                              />
                              <select
                                value={currentReplyInput.authorRole}
                                onChange={(e) => handleReplyChange(post.id, 'authorRole', e.target.value)}
                                className="px-3 py-1.5 rounded bg-white dark:bg-[#111218] border border-slate-300 dark:border-white/10 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                              >
                                <option value="Indian Farmer Cooperative">Indian Farmer Co-op</option>
                                <option value="Indian Processor">Indian Processor</option>
                                <option value="Overseas Buyer">Overseas Buyer</option>
                                <option value="Indian Wholesaler">Indian Wholesaler</option>
                                <option value="Retail & Online Seller">Retail / E-commerce Seller</option>
                                <option value="Trade Compliance Specialist">Compliance Specialist</option>
                              </select>
                            </div>
                            <div className="flex gap-2">
                              <textarea
                                rows={2}
                                placeholder="Offer allocation, state delivery timeline, or ask technical specifications..."
                                value={currentReplyInput.content}
                                onChange={(e) => handleReplyChange(post.id, 'content', e.target.value)}
                                className="flex-1 px-3 py-2 rounded bg-white dark:bg-white/[0.04] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500 resize-none font-light"
                              />
                              <button
                                type="button"
                                disabled={submittingReplyPostId === post.id}
                                onClick={() => handleSubmitReply(post.id)}
                                className="px-4 py-2 rounded-lg text-xs font-semibold text-black bg-amber-400 hover:bg-amber-300 active:scale-95 transition-all self-end cursor-pointer disabled:opacity-50 shadow-xs"
                              >
                                {submittingReplyPostId === post.id ? 'Sending...' : 'Send'}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        {/* TAB 2: INDUSTRY INSIGHTS & REGULATORY BRIEFS */}
        {activeTab === 'insights' && (
          <div className="mt-6 space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/5">
              <div>
                <h3 className="text-base font-serif font-semibold text-slate-900 dark:text-white">
                  Bilateral Trade Briefings & Regulatory Intelligence
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Authoritative operational guides on APEDA phytosanitary testing, BIS Compulsory Registration Schemes, and customs logistics.
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-medium">Peer-Reviewed Quality Standards</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.map((insight) => (
                <div
                  key={insight.id}
                  className="p-5 rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 hover:border-amber-500/50 dark:hover:border-amber-400/40 transition-all flex flex-col justify-between text-left shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-200 dark:border-white/5">
                      <span className="text-amber-800 dark:text-amber-300 font-semibold uppercase">
                        {insight.corridor === 'export_agro' ? 'Food Export Intelligence' : 'Electronics Import Intelligence'}
                      </span>
                      <span>{insight.readTime}</span>
                    </div>

                    <h4 className="text-base font-serif font-semibold text-slate-900 dark:text-white mt-3">
                      {insight.title}
                    </h4>

                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-3 font-light leading-relaxed">
                      {insight.summary}
                    </p>

                    <div className="mt-4 space-y-1.5 pt-3 border-t border-slate-200 dark:border-white/5">
                      <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 block font-semibold">
                        Key Operational Takeaways:
                      </span>
                      {insight.keyTakeaways.slice(0, 3).map((takeaway, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <span className="text-[11px] leading-snug">{takeaway}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-500 dark:text-slate-400 text-[11px] truncate max-w-[200px]">{insight.author}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedInsight(insight)}
                      className="text-amber-800 hover:text-amber-900 dark:text-amber-300 dark:hover:text-amber-200 font-medium transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Read Brief</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: AI TRADE REGULATORY ADVISOR */}
        {activeTab === 'ai_advisor' && (
          <div className="mt-6 space-y-6 text-left">
            <div className="p-5 rounded-xl bg-slate-50/80 dark:bg-gradient-to-b dark:from-white/[0.04] dark:to-transparent border border-slate-200 dark:border-white/10 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-mono text-amber-800 dark:text-amber-300 uppercase mb-2 font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Instant Regulatory & Supply Chain Advisory</span>
              </div>
              <h3 className="text-lg font-serif font-semibold text-slate-900 dark:text-white">
                Ask Eximora Trade Intelligence
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-2xl font-light leading-relaxed">
                Enter any trade query regarding agricultural phytosanitary norms, APEDA requirements, BIS CRS certification timelines for electronics, tariff codes, or ocean freight parameters.
              </p>

              {/* Input Form */}
              <div className="mt-4 flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={advisorTopic}
                  onChange={(e) => setAdvisorTopic(e.target.value)}
                  placeholder="e.g. Mandatory lab testing for exporting organic turmeric to Germany under FOB..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-black/60 border border-slate-300 dark:border-white/15 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono shadow-xs"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleGenerateAdvisorBrief();
                  }}
                />
                <button
                  type="button"
                  disabled={advisorLoading || !advisorTopic.trim()}
                  onClick={() => handleGenerateAdvisorBrief()}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-black bg-gradient-to-r from-amber-300 to-amber-400 hover:from-amber-200 hover:to-amber-300 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{advisorLoading ? 'Analyzing...' : 'Generate Brief'}</span>
                </button>
              </div>

              {/* Sample Prompts */}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-600 dark:text-slate-400">
                <span className="text-slate-500">Sample Inquiries:</span>
                <button
                  type="button"
                  onClick={() => {
                    setAdvisorTopic('EU pesticide residue limits & APEDA TraceNet for Basmati rice export');
                    handleGenerateAdvisorBrief('EU pesticide residue limits & APEDA TraceNet for Basmati rice export');
                  }}
                  className="hover:text-amber-700 dark:hover:text-amber-300 transition-colors underline underline-offset-4 cursor-pointer"
                >
                  Basmati to EU Residue Limits
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => {
                    setAdvisorTopic('BIS CRS IS 13252 test requirements for GaN 65W chargers into Nhava Sheva');
                    handleGenerateAdvisorBrief('BIS CRS IS 13252 test requirements for GaN 65W chargers into Nhava Sheva');
                  }}
                  className="hover:text-amber-700 dark:hover:text-amber-300 transition-colors underline underline-offset-4 cursor-pointer"
                >
                  GaN Chargers BIS CRS Testing
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => {
                    setAdvisorTopic('Deep sea container moisture desiccant protocols for whole spice shipping');
                    handleGenerateAdvisorBrief('Deep sea container moisture desiccant protocols for whole spice shipping');
                  }}
                  className="hover:text-amber-700 dark:hover:text-amber-300 transition-colors underline underline-offset-4 cursor-pointer"
                >
                  Spice Container Moisture Protocols
                </button>
              </div>
            </div>

            {/* Generated Advisor Brief Result */}
            {advisorBrief && (
              <div className="p-6 rounded-xl bg-white dark:bg-white/[0.03] border border-amber-500/40 dark:border-amber-400/40 space-y-4 animate-fade-in text-left shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-mono uppercase text-amber-800 dark:text-amber-300 font-semibold tracking-wider">
                      Intelligence Advisory Brief
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenOrderModal('export_agro', `Formal trade order initiated from Trade Brief: ${advisorBrief.title}`)}
                    className="text-xs font-mono text-amber-800 dark:text-amber-300 hover:text-amber-900 dark:hover:text-white font-medium inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Execute as Order</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <h3 className="text-lg font-serif font-semibold text-slate-900 dark:text-white">
                  {advisorBrief.title}
                </h3>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-light">
                  {advisorBrief.summary}
                </p>

                <div className="p-4 rounded-lg bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 space-y-2">
                  <span className="text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400 block font-semibold">
                    Strategic Compliance Checklist:
                  </span>
                  {advisorBrief.keyTakeaways.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-800 dark:text-slate-200">
                      <span className="font-mono text-amber-700 dark:text-amber-300 font-bold">{idx + 1}.</span>
                      <span>{point}</span>
                    </div>
                  ))}
                </div>

                <div className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-xs">
                  <span className="font-mono text-[10px] uppercase text-amber-800 dark:text-amber-300 font-bold block">
                    Eximora Asset-Light Execution Protocol:
                  </span>
                  <p className="text-slate-800 dark:text-slate-200 mt-1 font-light leading-relaxed">
                    {advisorBrief.operationalImpact}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-slate-600 dark:text-slate-400 pt-1">
                  <span className="text-slate-500">Standards Verified:</span>
                  {advisorBrief.relevantStandards?.map((std, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-white/5 border border-emerald-200 dark:border-white/10 text-emerald-800 dark:text-emerald-300 font-medium">
                      {std}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* NEW POST MODAL */}
      {isNewPostModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 dark:bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-[#090A0F] border border-slate-200 dark:border-white/15 p-6 shadow-2xl text-left text-slate-900 dark:text-slate-100">
            <button
              type="button"
              onClick={() => setIsNewPostModalOpen(false)}
              className="absolute top-5 right-5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-mono text-amber-800 dark:text-amber-300 uppercase mb-1 font-medium">
              <Plus className="w-3.5 h-3.5" />
              <span>Publish Trade Inquiry or Offer</span>
            </div>
            <h3 className="text-lg font-serif font-semibold text-slate-900 dark:text-white">
              Connect with Eximora's Two-Way Trade Network
            </h3>

            <form onSubmit={handleCreateNewPost} className="mt-5 space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400 block mb-1">Channel</label>
                  <select
                    value={newPostForm.channel}
                    onChange={(e) => setNewPostForm({ ...newPostForm, channel: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#111218] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="export_agro">Food Products Export (Indian Farmers → Overseas)</option>
                    <option value="import_electronics">Electronic Accessories Import (Global → Indian Retail)</option>
                    <option value="regulations_logistics">Logistics, Freight & Compliance</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400 block mb-1">Post Intent</label>
                  <select
                    value={newPostForm.postType}
                    onChange={(e) => setNewPostForm({ ...newPostForm, postType: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#111218] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="buy_inquiry">Buy Inquiry (Looking to Source / Import)</option>
                    <option value="supply_offer">Supply Offer (Producer Allocation / Wholesale)</option>
                    <option value="market_insight">Market Advisory / Industry Insight</option>
                    <option value="regulatory_qa">Regulatory & Compliance Q&A</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400 block mb-1">Post Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Looking for 30 MT Organic Cumin Seeds CIF Rotterdam or 5,000 GaN Chargers"
                  value={newPostForm.title}
                  onChange={(e) => setNewPostForm({ ...newPostForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400 block mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Authorized Representative"
                    value={newPostForm.authorName}
                    onChange={(e) => setNewPostForm({ ...newPostForm, authorName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400 block mb-1">Company / Organization</label>
                  <input
                    type="text"
                    placeholder="e.g. Apex Global Trading"
                    value={newPostForm.authorCompany}
                    onChange={(e) => setNewPostForm({ ...newPostForm, authorCompany: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400 block mb-1">Trade Role</label>
                  <select
                    value={newPostForm.authorRole}
                    onChange={(e) => setNewPostForm({ ...newPostForm, authorRole: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#111218] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Overseas Buyer">Overseas Buyer</option>
                    <option value="Indian Farmer Cooperative">Indian Farmer Cooperative</option>
                    <option value="Indian Processor">Indian Processor</option>
                    <option value="Indian Wholesaler">Indian Wholesaler</option>
                    <option value="Retail & Online Seller">Retail & Online Seller</option>
                    <option value="Trade Compliance Specialist">Compliance Specialist</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400 block mb-1">Trade Specifications & Description</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Detail exact commodity specs, volume requirements, target certifications (APEDA, FSSAI, BIS CRS), packaging requirements, and timeline..."
                  value={newPostForm.content}
                  onChange={(e) => setNewPostForm({ ...newPostForm, content: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 resize-none font-light"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-lg bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/5">
                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 block">Quantity</label>
                  <input
                    type="text"
                    placeholder="e.g. 50"
                    value={newPostForm.suggestedQty}
                    onChange={(e) => setNewPostForm({ ...newPostForm, suggestedQty: e.target.value })}
                    className="w-full px-2 py-1 rounded bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs mt-0.5"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 block">Unit</label>
                  <input
                    type="text"
                    placeholder="e.g. Metric Tons"
                    value={newPostForm.suggestedUnit}
                    onChange={(e) => setNewPostForm({ ...newPostForm, suggestedUnit: e.target.value })}
                    className="w-full px-2 py-1 rounded bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs mt-0.5"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 block">Incoterm</label>
                  <select
                    value={newPostForm.incoterm}
                    onChange={(e) => setNewPostForm({ ...newPostForm, incoterm: e.target.value as any })}
                    className="w-full px-2 py-1 rounded bg-white dark:bg-[#111218] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs mt-0.5"
                  >
                    <option value="CIF">CIF</option>
                    <option value="FOB">FOB</option>
                    <option value="DDP">DDP</option>
                    <option value="CFR">CFR</option>
                    <option value="EXW">EXW</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 block">Destination</label>
                  <input
                    type="text"
                    placeholder="e.g. Jebel Ali / Nhava Sheva"
                    value={newPostForm.destination}
                    onChange={(e) => setNewPostForm({ ...newPostForm, destination: e.target.value })}
                    className="w-full px-2 py-1 rounded bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs mt-0.5"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsNewPostModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-black bg-gradient-to-r from-amber-300 to-amber-400 hover:from-amber-200 hover:to-amber-300 transition-all cursor-pointer shadow-xs"
                >
                  Publish Inquiry to Network
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL INSIGHT VIEW MODAL */}
      {selectedInsight && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 dark:bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-[#090A0F] border border-slate-200 dark:border-white/15 p-6 sm:p-8 shadow-2xl text-left space-y-4 text-slate-900 dark:text-slate-100">
            <button
              type="button"
              onClick={() => setSelectedInsight(null)}
              className="absolute top-5 right-5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-mono text-amber-800 dark:text-amber-300 uppercase font-medium">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{selectedInsight.corridor === 'export_agro' ? 'Food & Agro Export Intelligence' : 'Electronics Import Intelligence'} · {selectedInsight.readTime}</span>
            </div>

            <h3 className="text-xl font-serif font-semibold text-slate-900 dark:text-white">
              {selectedInsight.title}
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Published by {selectedInsight.author} · {selectedInsight.publishedDate}
            </p>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-light">
              <p>{selectedInsight.summary}</p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-mono uppercase text-slate-500 dark:text-slate-400 tracking-wider font-semibold">
                Regulatory Takeaways & Port Protocols
              </h4>
              <div className="space-y-1.5">
                {selectedInsight.keyTakeaways.map((k, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>{k}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-xs">
              <span className="font-mono text-[11px] uppercase text-amber-800 dark:text-amber-300 font-semibold block">
                Eximora Asset-Light Sourcing Standard:
              </span>
              <p className="text-slate-700 dark:text-slate-300 mt-1 font-light leading-relaxed">
                {selectedInsight.operationalImpact}
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-1.5 text-xs font-mono">
              <span className="text-slate-500">Applicable Standards:</span>
              {selectedInsight.relevantStandards.map((std, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-white/5 border border-emerald-200 dark:border-white/10 text-emerald-800 dark:text-emerald-300 font-medium">
                  {std}
                </span>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedInsight(null)}
                className="px-4 py-2 rounded-lg text-xs font-mono text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                Close Briefing
              </button>

              <button
                type="button"
                onClick={() => {
                  const corridor: TradeCorridor = selectedInsight.corridor === 'import_electronics' ? 'import_electronics' : 'export_agro';
                  setSelectedInsight(null);
                  onOpenOrderModal(corridor, `Trade Order aligned with Intelligence Briefing: ${selectedInsight.title}`);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-black bg-gradient-to-r from-amber-300 to-amber-400 hover:from-amber-200 hover:to-amber-300 rounded-lg transition-all cursor-pointer shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Execute as Trade Order</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
