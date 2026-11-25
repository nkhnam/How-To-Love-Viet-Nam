import React, { useState, useEffect, useCallback } from 'react';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import {
  CalendarClock,
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  Loader2,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { db, auth } from './firebase';
import Button from './ui/Button';
import Badge from './ui/Badge';

const SUBJECT_OPTIONS = ['Lịch Sử', 'Giáo dục địa phương'];

const ACTIVITIES_BY_SUBJECT = {
  'Lịch Sử': ['Học Flashcard', 'Học bài giảng', 'Làm Quiz', 'Luyện tập', 'Viết Blog'],
  'Giáo dục địa phương': [
    'Khám phá 34 tỉnh thành',
    'Học Flashcard',
    'Học bài giảng',
    'Làm Quiz',
    'Viết Blog',
  ],
};

function formatScheduleDate(val) {
  if (!val) return '';
  const d = typeof val.toDate === 'function' ? val.toDate() : val.seconds ? new Date(val.seconds * 1000) : new Date(val);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Interactive Study Planner persisted to Firestore `tasks` scoped by userId.
 */
function StudyBot({ userId, onTaskScheduled }) {
  const [subject, setSubject] = useState('Lịch Sử');
  const [activity, setActivity] = useState('Làm Quiz');
  const [dateTime, setDateTime] = useState('');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const effectiveUid = userId || auth.currentUser?.uid;

  const loadTasks = useCallback(async () => {
    if (!effectiveUid) {
      setTasks([]);
      setLoading(false);
      return;
    }
    try {
      const q = query(collection(db, 'tasks'), where('userId', '==', effectiveUid));
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => {
        const ta = a.dateTime?.seconds || 0;
        const tb = b.dateTime?.seconds || 0;
        return ta - tb;
      });
      setTasks(list);
    } catch (err) {
      console.error('Error loading study tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [effectiveUid]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleSubjectChange = (nextSubject) => {
    setSubject(nextSubject);
    const list = ACTIVITIES_BY_SUBJECT[nextSubject] || [];
    if (!list.includes(activity)) {
      setActivity(list[0] || '');
    }
  };

  const handleSchedule = async (e) => {
    e.preventDefault();
    if (!effectiveUid) {
      toast.info('Vui lòng đăng nhập để lưu kế hoạch học tập.');
      return;
    }
    if (!dateTime) {
      toast.warning('Vui lòng chọn ngày và giờ học dự kiến.');
      return;
    }

    setSaving(true);
    try {
      const newTask = {
        userId: effectiveUid,
        subject,
        activity,
        dateTime: Timestamp.fromDate(new Date(dateTime)),
        reminderSent: false,
        completed: false,
      };
      const created = await addDoc(collection(db, 'tasks'), newTask);
      setTasks((prev) => [...prev, { id: created.id, ...newTask }]);
      setDateTime('');
      toast.success('Đã thêm lịch học vào Kế hoạch!');
      if (onTaskScheduled) onTaskScheduled();
    } catch (err) {
      console.error('Error scheduling study task:', err);
      toast.error('Không thể lưu lịch học lúc này.');
    } finally {
      setSaving(false);
    }
  };

  const toggleTaskDone = async (task) => {
    const nextDone = !task.completed;
    try {
      await updateDoc(doc(db, 'tasks', task.id), { completed: nextDone });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, completed: nextDone } : t)));
    } catch (err) {
      console.error('Error updating task status:', err);
      toast.error('Không thể cập nhật trạng thái nhiệm vụ.');
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      toast.success('Đã xóa nhiệm vụ');
    } catch (err) {
      console.error('Error deleting task:', err);
      toast.error('Không thể xóa nhiệm vụ.');
    }
  };

  const activities = ACTIVITIES_BY_SUBJECT[subject] || [];

  return (
    <div className="space-y-5">
      <form onSubmit={handleSchedule} className="space-y-4 bg-heritage-paper/70 rounded-xl p-4 border border-heritage-border">
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-heritage-muted">1. Chọn môn học</p>
          <div className="flex flex-wrap gap-2">
            {SUBJECT_OPTIONS.map((subj) => (
              <button
                key={subj}
                type="button"
                onClick={() => handleSubjectChange(subj)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  subject === subj
                    ? 'bg-heritage-vermilion text-white'
                    : 'bg-white text-heritage-muted border border-heritage-border hover:text-heritage-ink'
                }`}
              >
                {subj}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-heritage-muted">2. Hoạt động mục tiêu</p>
          <div className="flex flex-wrap gap-2">
            {activities.map((act) => (
              <button
                key={act}
                type="button"
                onClick={() => setActivity(act)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activity === act
                    ? 'bg-heritage-jade text-white'
                    : 'bg-white text-heritage-muted border border-heritage-border hover:text-heritage-ink'
                }`}
              >
                {act}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="flex-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-heritage-muted mb-1.5">
              3. Thời gian dự kiến
            </label>
            <input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-heritage-border bg-white text-sm text-heritage-ink focus:outline-none focus:ring-2 focus:ring-heritage-vermilion/25"
            />
          </div>
          <Button type="submit" variant="primary" size="sm" disabled={saving || !dateTime}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Lưu nhiệm vụ
          </Button>
        </div>
      </form>

      {/* Task List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-heritage-ink flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-heritage-gold" />
            Danh sách lịch học ({tasks.length})
          </h4>
        </div>

        {loading ? (
          <p className="text-xs text-heritage-muted">Đang tải kế hoạch...</p>
        ) : tasks.length === 0 ? (
          <p className="text-sm text-heritage-muted py-3">
            Chưa có lịch ôn tập nào. Lên kế hoạch ngay ở trên để duy trì thói quen học mỗi ngày!
          </p>
        ) : (
          <div className="space-y-2">
            {tasks.map((t) => (
              <div
                key={t.id}
                className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-colors ${
                  t.completed ? 'bg-teal-50/40 border-teal-200' : 'bg-white border-heritage-border'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleTaskDone(t)}
                  className="flex items-start gap-2.5 text-left flex-1 min-w-0 cursor-pointer"
                >
                  {t.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-heritage-jade shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-5 h-5 text-heritage-muted shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0">
                    <p
                      className={`text-sm font-semibold truncate ${
                        t.completed ? 'line-through text-heritage-muted' : 'text-heritage-ink'
                      }`}
                    >
                      {t.activity}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-0.5">
                      <Badge variant={t.subject === 'Lịch Sử' ? 'vermilion' : 'jade'}>{t.subject}</Badge>
                      <span className="text-xs text-heritage-muted">{formatScheduleDate(t.dateTime)}</span>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => deleteTask(t.id)}
                  aria-label="Xóa nhiệm vụ"
                  className="p-1.5 rounded-lg text-heritage-muted hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default StudyBot;
