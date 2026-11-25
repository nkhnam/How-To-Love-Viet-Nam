import React, { useState, useEffect } from 'react';
import { FileUp, Network, Loader2, Sparkles, Upload } from 'lucide-react';
import { toast } from 'react-toastify';
import { uploadMindmapPdf, fetchLastMindmap } from '../utils/aiApi';
import Button from './ui/Button';
import Card from './ui/Card';
import Badge from './ui/Badge';
import MindmapCanvas from './ai/MindmapCanvas';

const SAMPLE_MINDMAPS = [
  {
    id: 'cmt8',
    label: 'Cách mạng tháng Tám 1945',
    summary: `# Cách mạng tháng Tám năm 1945
- Bối cảnh lịch sử
  - Thế giới: Phát xít Nhật đầu hàng Đồng minh (15/8/1945)
  - Trong nước: Phong trào Việt Minh phát triển mạnh mẽ
  - Thời cơ "ngàn năm có một" xuất hiện từ 15/8 đến trước 5/9/1945
- Diễn biến Tổng khởi nghĩa
  - 14-15/8/1945: Phát động Tổng khởi nghĩa tại Tân Trào
  - 19/8/1945: Giành chính quyền tại Hà Nội
  - 23/8/1945: Giành chính quyền tại Huế
  - 25/8/1945: Giành chính quyền tại Sài Gòn
  - 2/9/1945: Chủ tịch Hồ Chí Minh đọc Tuyên ngôn Độc lập
- Ý nghĩa & Bài học kinh nghiệm
  - Mở ra kỷ nguyên độc lập, tự do cho dân tộc Việt Nam
  - Khẳng định nghệ thuật chớp thời cơ và đại đoàn kết toàn dân`,
  },
  {
    id: 'dbp1954',
    label: 'Chiến thắng Điện Biên Phủ 1954',
    summary: `# Chiến dịch Điện Biên Phủ (1954)
- Âm mưu của Pháp – Mỹ
  - Kế hoạch Na-va nhằm xoay chuyển cục diện chiến tranh
  - Xây dựng tập đoàn cứ điểm mạnh nhất Đông Dương tại Điện Biên Phủ
- Chủ trương & Chuẩn bị của ta
  - Chuyển phương châm từ "Đánh nhanh, thắng nhanh" sang "Đánh chắc, tiến chắc"
  - Huy động sức người, sức của với hàng vạn dân công hỏa tuyến
- Ba đợt tiến công lịch sử (13/3 – 7/5/1954)
  - Đợt 1: Tiêu diệt cụm cứ điểm Him Lam và Độc Lập
  - Đợt 2: Tiến công các cứ điểm phía Đông khu trung tâm
  - Đợt 3: Tổng công kích, bắt sống tướng Đờ Cát-tơ-ri
- Ý nghĩa quốc tế & dân tộc
  - Buộc thực dân Pháp ký Hiệp định Giơ-ne-vơ (7/1954)
  - Cổ vũ mạnh mẽ phong trào giải phóng dân tộc trên toàn thế giới`,
  },
];

/**
 * Tab 3: PDF-to-Mindmap Studio integrated directly inside React
 * replacing standalone tools/mindmap-viewer HTML page.
 */
function MindMapUploader() {
  const [pdfFile, setPdfFile] = useState(null);
  const [summary, setSummary] = useState(SAMPLE_MINDMAPS[0].summary);
  const [sourceLabel, setSourceLabel] = useState('Mẫu minh họa: Cách mạng tháng Tám 1945');
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let active = true;
    fetchLastMindmap()
      .then((serverSummary) => {
        if (active && serverSummary && serverSummary.trim().length > 10) {
          setSummary(serverSummary);
          setSourceLabel('Sơ đồ gần nhất từ máy chủ AI');
        }
      })
      .catch(() => {
        // Keep clean sample mindmap if API offline
      });
    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pdfFile) {
      toast.warning('Vui lòng chọn tệp PDF bài học hoặc đề cương.');
      return;
    }

    setUploading(true);
    setErrorMsg('');
    try {
      const nextSummary = await uploadMindmapPdf(pdfFile);
      if (!nextSummary) {
        throw new Error('Không trích xuất được nội dung từ PDF.');
      }
      setSummary(nextSummary);
      setSourceLabel(`PDF: ${pdfFile.name}`);
      toast.success('Đã tạo sơ đồ tư duy từ PDF thành công!');
    } catch (err) {
      setErrorMsg(err.message || 'Không thể tải PDF lên máy chủ AI.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <Card className="lg:col-span-5 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-heritage-vermilion-soft text-heritage-vermilion flex items-center justify-center">
              <FileUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-heritage-ink">Tạo Sơ đồ tư duy từ PDF</h2>
              <p className="text-xs text-heritage-muted">AI tự đọc tài liệu PDF, tóm tắt phân cấp và vẽ sơ đồ nhánh</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="flex flex-col items-center justify-center p-5 rounded-xl border-2 border-dashed border-heritage-border bg-heritage-cream/50 hover:border-heritage-vermilion transition-colors cursor-pointer text-center">
              <Upload className="w-6 h-6 text-heritage-vermilion mb-2" />
              <span className="text-sm font-semibold text-heritage-ink">
                {pdfFile ? pdfFile.name : 'Chọn tệp PDF bài học / tài liệu'}
              </span>
              <span className="text-xs text-heritage-muted mt-0.5">Định dạng .pdf · Có thể chứa chữ tiếng Việt</span>
              <input
                type="file"
                accept="application/pdf,.pdf"
                onChange={(e) => {
                  setPdfFile(e.target.files?.[0] || null);
                  setErrorMsg('');
                }}
                className="hidden"
              />
            </label>

            <Button type="submit" variant="primary" size="md" disabled={!pdfFile || uploading} className="w-full">
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  AI đang đọc PDF &amp; dựng sơ đồ...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Tạo Sơ đồ tư duy từ PDF
                </>
              )}
            </Button>
          </form>

          {errorMsg && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700 font-medium">
              {errorMsg}
            </div>
          )}

          <div className="pt-2 border-t border-heritage-border space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-heritage-muted">Xem mẫu có sẵn:</p>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_MINDMAPS.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => {
                    setSummary(sample.summary);
                    setSourceLabel(`Mẫu minh họa: ${sample.label}`);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-heritage-paper hover:bg-heritage-gold-soft text-heritage-ink transition-colors cursor-pointer"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-7 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Network className="w-5 h-5 text-heritage-jade" />
              <h3 className="font-serif text-lg font-bold text-heritage-ink">Sơ đồ tương tác</h3>
            </div>
            <Badge variant="gold">{sourceLabel}</Badge>
          </div>

          <MindmapCanvas summaryText={summary} />
        </Card>
      </div>
    </div>
  );
}

export default MindMapUploader;
