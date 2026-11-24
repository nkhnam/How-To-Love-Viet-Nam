import React, { useMemo, useState, useRef } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Download, Copy, Check, GitFork, List } from 'lucide-react';
import { toast } from 'react-toastify';

const BRANCH_COLORS = [
  '#B91C1C', // Vermilion
  '#0F766E', // Jade
  '#C88A1E', // Bronze Gold
  '#1D4ED8', // Cobalt
  '#7C2D12', // Terracotta
  '#6D28D9', // Violet
];

/**
 * Parses indented bullets / markdown headings from /mindmap/upload into a hierarchical tree.
 */
export function parseOutlineToTree(markdownText) {
  const lines = (markdownText || '')
    .split(/\r?\n/)
    .map((raw) => raw.replace(/\t/g, '  '))
    .filter((line) => line.trim().length > 0);

  if (lines.length === 0) return null;

  const cleanLabel = (str) =>
    str
      .replace(/^#+\s*/, '')
      .replace(/^[-*•+]\s*/, '')
      .replace(/^\d+[.)]\s*/, '')
      .replace(/\*\*/g, '')
      .replace(/`/g, '')
      .trim();

  const rootTitle = cleanLabel(lines[0]) || 'Sơ đồ tư duy';
  const root = { id: 'node-0', label: rootTitle, depth: 0, children: [] };

  const stack = [{ indent: -1, node: root }];
  let counter = 1;

  for (let i = 1; i < lines.length; i += 1) {
    const raw = lines[i];
    const label = cleanLabel(raw);
    if (!label) continue;

    // Infer indent depth from headings or leading spaces
    let indent = raw.search(/\S/);
    const headingMatch = raw.trim().match(/^(#+)\s+/);
    if (headingMatch) {
      indent = Math.max(0, (headingMatch[1].length - 1) * 2);
    } else if (/^\*\s+/.test(raw.trim()) && indent === 0) {
      indent = 0;
    }

    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
      stack.pop();
    }

    const parent = stack[stack.length - 1].node;
    const node = {
      id: `node-${counter++}`,
      label,
      depth: parent.depth + 1,
      children: [],
    };
    parent.children.push(node);
    stack.push({ indent, node });
  }

  return root;
}

function wrapLines(text, maxChars = 28) {
  const words = (text || '').split(/\s+/);
  const lines = [];
  let current = '';
  for (const w of words) {
    if (!current) {
      current = w;
    } else if ((current + ' ' + w).length <= maxChars) {
      current += ' ' + w;
    } else {
      lines.push(current);
      current = w;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 4);
}

function computeTreeLayout(node, collapsedIds) {
  const COL_X = [36, 290, 560, 830, 1080];
  const BOX_WIDTH = 225;
  const GAP_Y = 16;

  function measure(n, branchIndex) {
    const lines = wrapLines(n.label, n.depth === 0 ? 22 : 27);
    const height = Math.max(42, lines.length * 18 + 18);
    const isCollapsed = collapsedIds.has(n.id);
    const visibleChildren = isCollapsed ? [] : n.children;

    if (visibleChildren.length === 0) {
      return {
        node: n,
        lines,
        width: n.depth === 0 ? 210 : BOX_WIDTH,
        height,
        subtreeHeight: height,
        branchIndex,
        children: [],
      };
    }

    const childLayouts = visibleChildren.map((child, idx) =>
      measure(child, n.depth === 0 ? idx : branchIndex),
    );
    const childrenTotal =
      childLayouts.reduce((s, c) => s + c.subtreeHeight, 0) +
      Math.max(0, childLayouts.length - 1) * GAP_Y;

    return {
      node: n,
      lines,
      width: n.depth === 0 ? 210 : BOX_WIDTH,
      height,
      subtreeHeight: Math.max(height, childrenTotal),
      branchIndex,
      children: childLayouts,
    };
  }

  const rootMeasured = measure(node, 0);
  const positionedNodes = [];
  const edges = [];

  function assignPositions(item, topY) {
    const x = COL_X[Math.min(item.node.depth, COL_X.length - 1)] || 36 + item.node.depth * 260;
    const centerY = topY + item.subtreeHeight / 2;
    const y = centerY - item.height / 2;

    positionedNodes.push({
      ...item,
      x,
      y,
      centerY,
      color: item.node.depth === 0 ? '#B91C1C' : BRANCH_COLORS[item.branchIndex % BRANCH_COLORS.length],
    });

    if (item.children.length > 0) {
      let curY = topY;
      const childrenTotal =
        item.children.reduce((s, c) => s + c.subtreeHeight, 0) +
        Math.max(0, item.children.length - 1) * GAP_Y;
      if (childrenTotal < item.subtreeHeight) {
        curY += (item.subtreeHeight - childrenTotal) / 2;
      }

      for (const child of item.children) {
        const childCenterY = curY + child.subtreeHeight / 2;
        const childX = COL_X[Math.min(child.node.depth, COL_X.length - 1)] || 36 + child.node.depth * 260;
        edges.push({
          id: `${item.node.id}->${child.node.id}`,
          x1: x + item.width,
          y1: centerY,
          x2: childX,
          y2: childCenterY,
          color: BRANCH_COLORS[child.branchIndex % BRANCH_COLORS.length],
        });
        assignPositions(child, curY);
        curY += child.subtreeHeight + GAP_Y;
      }
    }
  }

  assignPositions(rootMeasured, 32);

  const maxX = positionedNodes.reduce((m, n) => Math.max(m, n.x + n.width), 800) + 60;
  const maxY = Math.max(380, rootMeasured.subtreeHeight + 64);

  return { nodes: positionedNodes, edges, width: maxX, height: maxY };
}

/**
 * Interactive collapsible SVG Mindmap canvas with zoom, pan, outline switch, and PNG export.
 */
function MindmapCanvas({ summaryText }) {
  const [viewMode, setViewMode] = useState('canvas'); // 'canvas' | 'outline'
  const [collapsedIds, setCollapsedIds] = useState(new Set());
  const [zoom, setZoom] = useState(0.95);
  const [copied, setCopied] = useState(false);
  const svgRef = useRef(null);

  const tree = useMemo(() => parseOutlineToTree(summaryText), [summaryText]);
  const layout = useMemo(() => (tree ? computeTreeLayout(tree, collapsedIds) : null), [tree, collapsedIds]);

  const toggleCollapse = (nodeId) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  };

  const handleCopyOutline = async () => {
    try {
      await navigator.clipboard.writeText(summaryText || '');
      setCopied(true);
      toast.success('Đã sao chép dàn ý sơ đồ tư duy');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Không thể sao chép dàn ý');
    }
  };

  const handleExportPng = () => {
    if (!svgRef.current || !layout) return;
    const svgEl = svgRef.current;
    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(svgEl);
    if (!svgString.includes('xmlns="http://www.w3.org/2000/svg"')) {
      svgString = svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const scaleFactor = 2;
      const canvas = document.createElement('canvas');
      canvas.width = layout.width * scaleFactor;
      canvas.height = layout.height * scaleFactor;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#FAF7F2';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);

      const pngUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = 'htlvn-so-do-tu-duy.png';
      a.click();
      toast.success('Đã xuất ảnh Sơ đồ tư duy (.png)!');
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      toast.error('Không thể xuất ảnh PNG từ sơ đồ này.');
    };
    img.src = url;
  };

  if (!tree || !layout) return null;

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-heritage-paper rounded-xl p-2.5 border border-heritage-border">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setViewMode('canvas')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              viewMode === 'canvas' ? 'bg-white text-heritage-vermilion shadow-sm' : 'text-heritage-muted'
            }`}
          >
            <GitFork className="w-3.5 h-3.5" />
            Sơ đồ nhánh
          </button>
          <button
            type="button"
            onClick={() => setViewMode('outline')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              viewMode === 'outline' ? 'bg-white text-heritage-vermilion shadow-sm' : 'text-heritage-muted'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            Dàn ý văn bản
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {viewMode === 'canvas' && (
            <>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(0.5, Number((z - 0.15).toFixed(2))))}
                aria-label="Thu nhỏ"
                className="p-1.5 rounded-lg bg-white border border-heritage-border text-heritage-ink hover:bg-heritage-cream cursor-pointer"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-heritage-muted px-1.5">{Math.round(zoom * 100)}%</span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(1.6, Number((z + 0.15).toFixed(2))))}
                aria-label="Phóng to"
                className="p-1.5 rounded-lg bg-white border border-heritage-border text-heritage-ink hover:bg-heritage-cream cursor-pointer"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setZoom(0.95);
                  setCollapsedIds(new Set());
                }}
                aria-label="Đặt lại góc nhìn"
                className="p-1.5 rounded-lg bg-white border border-heritage-border text-heritage-ink hover:bg-heritage-cream cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleExportPng}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-heritage-jade text-white text-xs font-semibold hover:bg-teal-800 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Tải PNG
              </button>
            </>
          )}

          <button
            type="button"
            onClick={handleCopyOutline}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-heritage-border text-xs font-semibold text-heritage-ink hover:bg-heritage-cream cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-heritage-jade" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Đã chép' : 'Sao chép dàn ý'}
          </button>
        </div>
      </div>

      {viewMode === 'canvas' ? (
        <div className="rounded-2xl border border-heritage-border bg-heritage-cream overflow-auto max-h-[540px] p-3">
          <svg
            ref={svgRef}
            width={Math.round(layout.width * zoom)}
            height={Math.round(layout.height * zoom)}
            viewBox={`0 0 ${layout.width} ${layout.height}`}
            className="block"
            style={{ fontFamily: '"Be Vietnam Pro", system-ui, sans-serif' }}
          >
            {/* Edges */}
            {layout.edges.map((e) => {
              const cx = (e.x1 + e.x2) / 2;
              const d = `M ${e.x1} ${e.y1} C ${cx} ${e.y1}, ${cx} ${e.y2}, ${e.x2} ${e.y2}`;
              return (
                <path key={e.id} d={d} fill="none" stroke={e.color} strokeOpacity="0.45" strokeWidth="2.2" />
              );
            })}

            {/* Nodes */}
            {layout.nodes.map((n) => {
              const isRoot = n.node.depth === 0;
              const isLevel1 = n.node.depth === 1;
              const hasChildren = n.node.children.length > 0;
              const isCollapsed = collapsedIds.has(n.node.id);

              return (
                <g key={n.node.id}>
                  <rect
                    x={n.x}
                    y={n.y}
                    width={n.width}
                    height={n.height}
                    rx={isRoot ? 16 : 12}
                    fill={isRoot ? '#B91C1C' : isLevel1 ? '#FFFFFF' : '#FAF7F2'}
                    stroke={isRoot ? '#991B1B' : n.color}
                    strokeWidth={isRoot ? 2 : isLevel1 ? 2 : 1.25}
                  />

                  <text
                    x={n.x + 14}
                    y={n.y + (n.lines.length === 1 ? n.height / 2 + 5 : 22)}
                    fill={isRoot ? '#FFFFFF' : '#1C1917'}
                    fontSize={isRoot ? 14 : isLevel1 ? 13 : 12}
                    fontWeight={isRoot || isLevel1 ? '700' : '500'}
                  >
                    {n.lines.map((line, i) => (
                      <tspan key={i} x={n.x + 14} dy={i === 0 ? 0 : 17}>
                        {line}
                      </tspan>
                    ))}
                  </text>

                  {hasChildren && (
                    <g
                      onClick={() => toggleCollapse(n.node.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <circle
                        cx={n.x + n.width}
                        cy={n.centerY}
                        r={10}
                        fill={isCollapsed ? n.color : '#FFFFFF'}
                        stroke={n.color}
                        strokeWidth={1.6}
                      />
                      <text
                        x={n.x + n.width}
                        y={n.centerY + 4}
                        textAnchor="middle"
                        fontSize="12"
                        fontWeight="700"
                        fill={isCollapsed ? '#FFFFFF' : n.color}
                      >
                        {isCollapsed ? `+` : `-`}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      ) : (
        <div className="rounded-2xl border border-heritage-border bg-white p-5 max-h-[520px] overflow-y-auto">
          <pre className="whitespace-pre-wrap text-sm text-heritage-ink font-sans leading-relaxed">
            {summaryText}
          </pre>
        </div>
      )}
    </div>
  );
}

export default MindmapCanvas;
