import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MessageSquareText, ImagePlus, Network, Sparkles, Activity } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import Breadcrumb from '../components/ui/Breadcrumb';
import Badge from '../components/ui/Badge';
import Tabs from '../components/ui/Tabs';
import AiRagChat from '../components/ai/AiRagChat';
import AiHomeworkSolver from '../components/ai/AiHomeworkSolver';
import MindMapUploader from '../components/MindMapUploader';
import { checkAiHealth } from '../utils/aiApi';

const VALID_TABS = ['chat', 'solver', 'mindmap'];

/**
 * Unified 3-in-1 AI Study Studio (/ai):
 * Tab 1: RAG Chat Sử & GDĐP · Tab 2: Image Homework Solver · Tab 3: PDF Mindmap
 */
function AiStudioPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const paramTab = searchParams.get('tab');
  const activeTab = VALID_TABS.includes(paramTab) ? paramTab : 'chat';
  const urlQuestion = searchParams.get('q') || '';

  const [prefilledQuestion, setPrefilledQuestion] = useState(urlQuestion);
  const [health, setHealth] = useState({ status: 'checking', model: '', knowledgeFiles: 0 });

  useEffect(() => {
    if (urlQuestion) {
      setPrefilledQuestion(urlQuestion);
    }
  }, [urlQuestion]);

  useEffect(() => {
    let active = true;
    checkAiHealth()
      .then((data) => {
        if (!active) return;
        setHealth({
          status: data.gemini_configured ? 'online' : 'degraded',
          model: data.model || 'Gemini',
          knowledgeFiles: data.knowledge_files || 0,
        });
      })
      .catch(() => {
        if (active) setHealth({ status: 'offline', model: '', knowledgeFiles: 0 });
      });
    return () => {
      active = false;
    };
  }, []);

  const handleTabChange = (nextTab) => {
    const next = new URLSearchParams(searchParams);
    next.set('tab', nextTab);
    if (nextTab !== 'chat') next.delete('q');
    setSearchParams(next, { replace: true });
  };

  const handleClearQuery = () => {
    if (searchParams.has('q')) {
      const next = new URLSearchParams(searchParams);
      next.delete('q');
      setSearchParams(next, { replace: true });
    }
  };

  const handleAskFollowUp = (questionText) => {
    setPrefilledQuestion(questionText);
    handleTabChange('chat');
  };

  const tabItems = [
    { key: 'chat', label: 'Hỏi đáp Sử & GDĐP', icon: MessageSquareText },
    { key: 'solver', label: 'Giải bài tập từ ảnh', icon: ImagePlus },
    { key: 'mindmap', label: 'Sơ đồ tư duy PDF', icon: Network },
  ];

  return (
    <MainLayout>
      {/* COMPACT STUDIO HEADER */}
      <section className="bg-heritage-paper border-b border-heritage-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-7 sm:py-8">
          <Breadcrumb className="mb-3" items={[{ label: 'Trang chủ', to: '/' }, { label: 'Trợ lý AI' }]} />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="jade">
                  <Sparkles className="w-3.5 h-3.5" />
                  HTLVN AI Studio 3-trong-1
                </Badge>
                {health.status === 'online' && (
                  <Badge variant="neutral">
                    <Activity className="w-3.5 h-3.5 text-heritage-jade" />
                    AI sẵn sàng · {health.model} ({health.knowledgeFiles} tài liệu RAG)
                  </Badge>
                )}
                {health.status === 'offline' && (
                  <Badge variant="gold">
                    <Activity className="w-3.5 h-3.5" />
                    AI API cục bộ chưa bật (vẫn xem được Sơ đồ mẫu)
                  </Badge>
                )}
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-heritage-ink">
                Trợ lý Học tập AI Thông minh
              </h1>
              <p className="text-sm sm:text-base text-heritage-muted">
                Hỏi đáp kiến thức theo chuẩn SGK, giải thích bài tập qua ảnh chụp và chuyển tài liệu PDF thành sơ đồ
                tư duy trực quan.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <Tabs items={tabItems} activeKey={activeTab} onChange={handleTabChange} />
          </div>
        </div>
      </section>

      {/* ACTIVE TAB WORKSPACE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-7 sm:py-9">
        {activeTab === 'chat' && (
          <AiRagChat initialQuestion={prefilledQuestion} onClearInitialQuestion={handleClearQuery} />
        )}
        {activeTab === 'solver' && <AiHomeworkSolver onAskFollowUp={handleAskFollowUp} />}
        {activeTab === 'mindmap' && <MindMapUploader />}
      </section>
    </MainLayout>
  );
}

export default AiStudioPage;
