import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import ScrollToTop from './components/layout/ScrollToTop.js';
import NotFound from './components/layout/NotFound.js';
import { PROVINCE_BY_LEGACY_ROUTE } from './data/provinces.js';

import Home from './components/Homepage/Home.js';
import Contact from './components/Contact/Contact.js';
import Elearning from './components/Elearning/Elearning.js';
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
import Inbox from './components/Signpage/inbox.js';

import Pratice from './components/Pratice/Pratice.js';
import BotAnswer from './components/botAnswer.js';

import Course from './components/Elearning/Course.js';
import Course1 from './components/Elearning/Course1.js';
import Course2 from './components/Elearning/Course2.js';
import Course3 from './components/Elearning/Course3.js';
import Course4 from './components/Elearning/Course4.js';
import Course5 from './components/Elearning/Course5.js';

import StudyBot from './components/StudyBot.js';
import ChatBot from './components/chatBot.js';

const ProvincesAtlasPage = lazy(() => import('./pages/ProvincesAtlasPage.js'));
const ProvinceDetailPage = lazy(() => import('./pages/ProvinceDetailPage.js'));

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
          <Route path="/elearning" element={<Elearning />} />

          {/* Unified 63 Provinces Atlas & Detail */}
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
          <Route path="/inbox" element={<Inbox />} />
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
          <Route path="/pratice" element={<Pratice />} />
          <Route path="/bot" element={<BotAnswer />} />
          <Route path="/chatbot" element={<ChatBot />} />
          <Route path="/studybot" element={<StudyBot />} />

          {/* Courses */}
          <Route path="/course" element={<Course />} />
          <Route path="/course1" element={<Course1 />} />
          <Route path="/course2" element={<Course2 />} />
          <Route path="/course3" element={<Course3 />} />
          <Route path="/course4" element={<Course4 />} />
          <Route path="/course5" element={<Course5 />} />

          {/* Legacy Province Routes & Fallback */}
          <Route path="/:legacyKey" element={<LegacyProvinceRedirect />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
