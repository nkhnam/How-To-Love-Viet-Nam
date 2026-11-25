import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import ScrollToTop from './components/layout/ScrollToTop.js';
import NotFound from './components/layout/NotFound.js';
import { PROVINCE_BY_LEGACY_ROUTE } from './data/provinces.js';

import Home from './components/Homepage/Home.js';
import Contact from './components/Contact/Contact.js';
import Register from './components/Signpage/register.js';
import Login from './components/Signpage/login.js';
import Profile from './components/Signpage/profile.js';
import ForgotPasswordModal from './components/Signpage/forgotPasswordModal.js';
import MyPosts from './components/Blogs/mypost.js';

import CreateBlog from './components/Blogs/create.js';
import Bloglist from './components/Blogs/bloglist.js';
import BlogView from './components/Blogs/show.js';
import BlogEdit from './components/Blogs/edit.js';

import CreateQuiz from './components/Quizzes/createquiz.js';
import QuizzesList from './components/Quizzes/listquiz.js';
import ShowQuiz from './components/Quizzes/showquizzes.js';
import MyQuiz from './components/Quizzes/myquiz.js';
import EditQuiz from './components/Quizzes/editquiz.js';

import UserProfile from './components/Signpage/userProfile.js';
import Messages from './components/Signpage/messages.js';

const ProvincesAtlasPage = lazy(() => import('./pages/ProvincesAtlasPage.js'));
const ProvinceDetailPage = lazy(() => import('./pages/ProvinceDetailPage.js'));
const LearningHubPage = lazy(() => import('./pages/LearningHubPage.js'));
const CourseDetailPage = lazy(() => import('./pages/CourseDetailPage.js'));
const AiStudioPage = lazy(() => import('./pages/AiStudioPage.js'));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-heritage-cream text-heritage-muted text-sm font-medium">
      Đang tải nội dung...
    </div>
  );
}

/**
 * Resolves legacy province routes (e.g. /HaNoi, /HaNoi-DLTC, /HaNoi-DTLS, /DacNong)
 * to the unified /provinces/:slug routes, falling back to NotFound.
 */
function LegacyProvinceRedirect() {
  const { legacyKey = '' } = useParams();
  const lower = legacyKey.toLowerCase();

  let base = lower;
  let flashcardType = null;
  if (lower.endsWith('-dltc')) {
    base = lower.slice(0, -5);
    flashcardType = 'dltc';
  } else if (lower.endsWith('-dtls')) {
    base = lower.slice(0, -5);
    flashcardType = 'dtls';
  }

  const province = PROVINCE_BY_LEGACY_ROUTE[base];
  if (!province) {
    return <NotFound />;
  }

  const target = flashcardType
    ? `/provinces/${province.slug}?tab=flashcards&type=${flashcardType}`
    : `/provinces/${province.slug}`;

  return <Navigate to={target} replace />;
}

function App() {
  return (
    <div className="App">
      <ScrollToTop />
      <ToastContainer position="bottom-right" autoClose={3500} theme="light" />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/learn" element={<LearningHubPage />} />
          <Route path="/learn/:courseId" element={<CourseDetailPage />} />
          <Route path="/elearning" element={<Navigate to="/learn" replace />} />

          {/* Unified 34 Provinces Atlas & Detail */}
          <Route path="/provinces" element={<ProvincesAtlasPage />} />
          <Route path="/provinces/:slug" element={<ProvinceDetailPage />} />

          {/* Legacy Region Redirects */}
          <Route path="/provinceMainPage" element={<Navigate to="/provinces" replace />} />
          <Route path="/bac" element={<Navigate to="/provinces?region=bac" replace />} />
          <Route path="/trung" element={<Navigate to="/provinces?region=trung" replace />} />
          <Route path="/nam" element={<Navigate to="/provinces?region=nam" replace />} />

          {/* Auth & Profile */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:userId" element={<UserProfile />} />
          <Route path="/messages/:userId" element={<Messages />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/inbox" element={<Navigate to="/messages" replace />} />
          <Route path="/forgotpass" element={<ForgotPasswordModal />} />

          {/* Blog */}
          <Route path="/blogcreate" element={<CreateBlog />} />
          <Route path="/blog" element={<Bloglist />} />
          <Route path="/blog/:id" element={<BlogView />} />
          <Route path="/blog/edit/:id" element={<BlogEdit />} />
          <Route path="/mypost" element={<MyPosts />} />

          {/* Quizzes */}
          <Route path="/createquiz" element={<CreateQuiz />} />
          <Route path="/listquiz" element={<QuizzesList />} />
          <Route path="/listquiz/:id" element={<ShowQuiz />} />
          <Route path="/myquiz" element={<MyQuiz />} />
          <Route path="/editquiz/:id" element={<EditQuiz />} />

          {/* Practice & AI */}
          <Route path="/pratice" element={<Navigate to="/learn?mode=practice" replace />} />
          <Route path="/ai" element={<AiStudioPage />} />
          <Route path="/bot" element={<Navigate to="/ai?tab=solver" replace />} />
          <Route path="/chatbot" element={<Navigate to="/ai?tab=chat" replace />} />
          <Route path="/mindmap" element={<Navigate to="/ai?tab=mindmap" replace />} />
          <Route path="/studybot" element={<Navigate to="/profile?tab=overview" replace />} />

          {/* Courses */}
          <Route path="/course" element={<Navigate to="/learn/dp10" replace />} />
          <Route path="/course1" element={<Navigate to="/learn/dp11" replace />} />
          <Route path="/course2" element={<Navigate to="/learn/dp12" replace />} />
          <Route path="/course3" element={<Navigate to="/learn/ls10" replace />} />
          <Route path="/course4" element={<Navigate to="/learn/ls11" replace />} />
          <Route path="/course5" element={<Navigate to="/learn/ls12" replace />} />

          {/* Legacy Province Routes & Fallback */}
          <Route path="/:legacyKey" element={<LegacyProvinceRedirect />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
