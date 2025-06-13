"use client"
import React, { useState } from 'react';
import { Menu, X, Play, Clock, User, Calendar, ChevronLeft } from 'lucide-react';

const GraceAcademyApp = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeResourceTab, setActiveResourceTab] = useState('materials');

  const colors = {
    primary: '#0f172a',     // slate-900 - deep navy
    secondary: '#4f46e5',   // indigo-600 - vibrant indigo
    tertiary: '#1e293b',    // slate-800 - lighter navy
    accent: '#06b6d4',      // cyan-500 - bright cyan
    success: '#10b981',     // emerald-500 - green
    warning: '#f59e0b',     // amber-500 - orange
    danger: '#ef4444',      // red-500 - red
    white: '#ffffff',
    text: '#f1f5f9',        // slate-100 - light text
    textMuted: '#94a3b8'    // slate-400 - muted text
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'classes', label: 'Classes', icon: '📚' },
    { id: 'progress', label: 'Class Progress', icon: '📈' },
    { id: 'examinations', label: 'Examinations', icon: '📝' },
    { id: 'testimonials', label: 'Testimonials', icon: '💬' }
  ];

  const classes = [
    {
      id: 'biblical-studies',
      title: 'Old Testament Survey',
      category: 'Biblical Studies',
      instructor: 'Dr. Michael Thompson',
      progress: 75,
      color: 'from-blue-500 to-blue-700'
    },
    {
      id: 'systematic-theology',
      title: 'Systematic Theology',
      category: 'Theology',
      instructor: 'Prof. Sarah Davis',
      progress: 60,
      color: 'from-purple-500 to-purple-700'
    },
    {
      id: 'christian-leadership',
      title: 'Christian Leadership',
      category: 'Ministry',
      instructor: 'Pastor John Wilson',
      progress: 45,
      color: 'from-green-500 to-green-700'
    },
    {
      id: 'christian-ethics',
      title: 'Christian Ethics',
      category: 'Ethics',
      instructor: 'Dr. Rebecca Martinez',
      progress: 90,
      color: 'from-red-500 to-red-700'
    }
  ];

  const testimonials = [
    {
      text: "Grace Academy has transformed my understanding of faith and scripture. The online platform makes learning flexible while maintaining deep spiritual growth.",
      author: "Emily Richardson",
      role: "Theology Graduate, Class of 2024"
    },
    {
      text: "The biblical studies program here is exceptional. The professors are knowledgeable and truly care about each student's spiritual journey.",
      author: "David Chen",
      role: "Ministry Student, Class of 2025"
    },
    {
      text: "The Christian leadership courses prepared me for real ministry. I'm now serving as a youth pastor and applying everything I learned.",
      author: "Maria Santos",
      role: "Alumni, Youth Pastor"
    },
    {
      text: "The online format allowed me to continue my education while raising my family. The support from faculty and students is incredible.",
      author: "Rachel Johnson",
      role: "Biblical Studies Student"
    }
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleNavClick = (tabId:string) => {
    setActiveTab(tabId);
    setSidebarOpen(false);
  };

  const handleClassClick = (classId: string) => {
    setActiveTab(classId);
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: colors.text }}>
        <div className="w-1 h-8 rounded" style={{ backgroundColor: colors.accent }}></div>
        Dashboard Overview
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[
          { value: '12', label: 'Active Courses', color: colors.secondary },
          { value: '87%', label: 'Overall Progress', color: colors.success },
          { value: '24', label: 'Completed Lessons', color: colors.accent },
          { value: '3', label: 'Upcoming Exams', color: colors.warning }
        ].map((stat, index) => (
          <div key={index} className="p-6 rounded-xl border border-slate-700 backdrop-blur-sm" style={{ backgroundColor: colors.tertiary }}>
            <div className="text-3xl font-bold mb-2" style={{ color: stat.color }}>{stat.value}</div>
            <div className="text-sm" style={{ color: colors.textMuted }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="p-6 rounded-xl border border-slate-700 backdrop-blur-sm" style={{ backgroundColor: colors.tertiary }}>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: colors.text }}>
          <div className="w-1 h-6 rounded" style={{ backgroundColor: colors.accent }}></div>
          Recent Activity
        </h3>
        <div className="space-y-4">
          {[
            { action: 'Completed:', item: 'Biblical History - Lesson 5', time: '2 hours ago', color: colors.success },
            { action: 'Started:', item: 'Christian Ethics Discussion', time: 'Yesterday', color: colors.secondary },
            { action: 'Submitted:', item: 'Theology Assignment #3', time: '3 days ago', color: colors.accent }
          ].map((activity, index) => (
            <div key={index} className="flex items-center gap-4 py-3 border-b border-slate-600 last:border-b-0">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: activity.color }}></div>
              <div className="flex-1">
                <div style={{ color: colors.text }}>
                  <strong>{activity.action}</strong> {activity.item}
                </div>
                <div className="text-sm" style={{ color: colors.textMuted }}>{activity.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderClasses = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: colors.text }}>
        <div className="w-1 h-8 rounded" style={{ backgroundColor: colors.accent }}></div>
        My Classes
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((classItem) => (
          <div
            key={classItem.id}
            className="rounded-xl border border-slate-700 overflow-hidden cursor-pointer transform hover:-translate-y-1 transition-all duration-300 hover:border-cyan-400 backdrop-blur-sm"
            style={{ backgroundColor: colors.tertiary }}
            onClick={() => handleClassClick(classItem.id)}
          >
            <div className={`h-32 bg-gradient-to-r ${classItem.color} flex items-center justify-center text-white text-lg font-bold`}>
              {classItem.category}
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-2" style={{ color: colors.text }}>{classItem.title}</h3>
              <p className="text-sm mb-4" style={{ color: colors.textMuted }}>{classItem.instructor}</p>
              <div className="mb-2">
                <div className="bg-slate-600 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${classItem.progress}%`, backgroundColor: colors.success }}
                  ></div>
                </div>
              </div>
              <small style={{ color: colors.textMuted }}>{classItem.progress}% Complete</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderClassView = (classId:string) => {
    const classData = classes.find(c => c.id === classId);
    if (!classData) return null;

    return (
      <div className="space-y-6">
        <button
          onClick={() => setActiveTab('classes')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-colors hover:opacity-80"
          style={{ backgroundColor: colors.secondary }}
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Classes
        </button>

        <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: colors.text }}>
          <div className="w-1 h-8 rounded" style={{ backgroundColor: colors.accent }}></div>
          {classData.title}
        </h2>

        {/* Video Section */}
        <div className="rounded-xl border border-slate-700 overflow-hidden backdrop-blur-sm" style={{ backgroundColor: colors.tertiary }}>
          <div className="relative h-96 bg-black flex items-center justify-center">
            <div className="text-center" style={{ color: colors.textMuted }}>
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl mb-4 mx-auto cursor-pointer transition-colors hover:opacity-80"
                style={{ backgroundColor: colors.accent }}
              >
                <Play className="w-8 h-8 ml-1" />
              </div>
              <p className="text-lg">Lesson 16: The Books of Chronicles</p>
              <small>Duration: 45 minutes</small>
            </div>
          </div>
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4" style={{ color: colors.text }}>Lesson 16: Understanding the Historical Context</h3>
            <div className="flex flex-wrap gap-6 mb-4 text-sm" style={{ color: colors.textMuted }}>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{classData.instructor}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>45 minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Posted June 10, 2025</span>
              </div>
            </div>
            <p style={{ color: colors.textMuted }}>
              Explore the historical and theological themes in Chronicles, examining how the author presents Israel&apos;s history with a focus on David&apos;s lineage and temple worship.
            </p>
          </div>
        </div>

        {/* Resources Section */}
        <div className="rounded-xl border border-slate-700 p-6 backdrop-blur-sm" style={{ backgroundColor: colors.tertiary }}>
          <div className="flex space-x-6 mb-6 border-b border-slate-600">
            {[
              { id: 'materials', label: 'Course Materials' },
              { id: 'assessments', label: 'Assessments' },
              { id: 'discussions', label: 'Discussions' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveResourceTab(tab.id)}
                className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                  activeResourceTab === tab.id 
                    ? 'text-cyan-400 border-cyan-400' 
                    : 'hover:text-white border-transparent'
                }`}
                style={{ color: activeResourceTab === tab.id ? colors.accent : colors.textMuted }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeResourceTab === 'materials' && (
            <div className="space-y-4">
              {[
                { icon: '📄', title: 'Lesson 16 Study Guide', subtitle: 'PDF • 2.3 MB', action: 'Download' },
                { icon: '📚', title: 'Required Reading: 1 Chronicles 1-9', subtitle: 'Biblical Text with Commentary', action: 'View' },
                { icon: '🎵', title: 'Audio Lecture', subtitle: 'MP3 • 43 minutes', action: 'Listen' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-slate-600" style={{ backgroundColor: colors.primary }}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold" style={{ backgroundColor: colors.accent }}>
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-medium" style={{ color: colors.text }}>{item.title}</h4>
                      <p className="text-sm" style={{ color: colors.textMuted }}>{item.subtitle}</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 text-white rounded-lg transition-colors hover:opacity-80" style={{ backgroundColor: colors.success }}>
                    {item.action}
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeResourceTab === 'assessments' && (
            <div className="space-y-4">
              {[
                { title: 'Weekly Quiz: Chronicles Overview', status: 'Pending', statusColor: colors.warning, description: '10 questions • 30 minutes • Due June 20, 2025', action: 'Take Quiz' },
                { title: 'Essay: Theological Themes in Chronicles', status: 'Due Soon', statusColor: colors.danger, description: '1500 words • Due June 18, 2025', action: 'Start Essay' },
                { title: 'Previous Quiz: Historical Context', status: '94%', statusColor: colors.success, description: 'Completed June 12, 2025', action: 'View Results' }
              ].map((assessment, index) => (
                <div key={index} className="p-4 rounded-lg border border-slate-600" style={{ backgroundColor: colors.primary }}>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium" style={{ color: colors.text }}>{assessment.title}</h4>
                    <span className="px-3 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: assessment.statusColor }}>
                      {assessment.status}
                    </span>
                  </div>
                  <p className="text-sm mb-3" style={{ color: colors.textMuted }}>{assessment.description}</p>
                  <button className="px-4 py-2 text-white rounded-lg transition-colors hover:opacity-80" style={{ backgroundColor: colors.accent }}>
                    {assessment.action}
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeResourceTab === 'discussions' && (
            <div className="space-y-4">
              {[
                { icon: '💬', title: 'Discussion Forum: Temple Worship Today', subtitle: '12 posts • Last activity 2 hours ago', action: 'Join' },
                { icon: '🤝', title: 'Study Group: Chronicles Study Circle', subtitle: '8 members • Meets Tuesdays 7 PM', action: 'Join' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-slate-600" style={{ backgroundColor: colors.primary }}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold" style={{ backgroundColor: colors.accent }}>
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-medium" style={{ color: colors.text }}>{item.title}</h4>
                      <p className="text-sm" style={{ color: colors.textMuted }}>{item.subtitle}</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 text-white rounded-lg transition-colors hover:opacity-80" style={{ backgroundColor: colors.success }}>
                    {item.action}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderProgress = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: colors.text }}>
        <div className="w-1 h-8 rounded" style={{ backgroundColor: colors.accent }}></div>
        Class Progress
      </h2>
      
      <div className="p-6 rounded-xl border border-slate-700 backdrop-blur-sm" style={{ backgroundColor: colors.tertiary }}>
        <div className="space-y-6">
          {classes.map((classItem) => (
            <div key={classItem.id} className="border-b border-slate-600 pb-6 last:border-b-0 last:pb-0">
              <h3 className="text-lg font-semibold mb-3" style={{ color: colors.text }}>{classItem.category} - {classItem.title}</h3>
              <div className="mb-2">
                <div className="bg-slate-600 h-3 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${classItem.progress}%`, backgroundColor: colors.success }}
                  ></div>
                </div>
              </div>
              <p className="text-sm" style={{ color: colors.textMuted }}>
                {Math.floor(classItem.progress * 0.2)} of 20 lessons completed • 
                {classItem.progress < 50 ? ' Group project in progress' : 
                 classItem.progress < 75 ? ' 1 exam scheduled' : 
                 classItem.progress < 90 ? ' 3 assignments pending' : ' Final exam next week'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderExaminations = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: colors.text }}>
        <div className="w-1 h-8 rounded" style={{ backgroundColor: colors.accent }}></div>
        Examinations
      </h2>
      
      <div className="space-y-4">
        {[
          { title: 'Christian Ethics - Final Exam', date: 'Due: June 20, 2025', status: 'Upcoming', statusColor: colors.warning },
          { title: 'Systematic Theology - Midterm', date: 'Due: June 25, 2025', status: 'Scheduled', statusColor: colors.secondary },
          { title: 'Biblical Studies - Unit Test', date: 'Completed: June 10, 2025', status: 'Completed - 94%', statusColor: colors.success },
          { title: 'Christian Leadership - Essay', date: 'Completed: June 8, 2025', status: 'Completed - 88%', statusColor: colors.success }
        ].map((exam, index) => (
          <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-xl border border-slate-700 backdrop-blur-sm" style={{ backgroundColor: colors.tertiary }}>
            <div className="mb-4 sm:mb-0">
              <h3 className="font-semibold" style={{ color: colors.text }}>{exam.title}</h3>
              <p className="text-sm" style={{ color: colors.textMuted }}>{exam.date}</p>
            </div>
            <span className="px-4 py-2 rounded-lg text-white text-sm font-medium self-start sm:self-center" style={{ backgroundColor: exam.statusColor }}>
              {exam.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTestimonials = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: colors.text }}>
        <div className="w-1 h-8 rounded" style={{ backgroundColor: colors.accent }}></div>
        Student Testimonials
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="p-6 rounded-xl border border-slate-700 backdrop-blur-sm" style={{ backgroundColor: colors.tertiary }}>
            <p className="italic mb-6 leading-relaxed" style={{ color: colors.text }}>{testimonial.text}</p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: colors.accent }}>
                {testimonial.author.charAt(0)}
              </div>
              <div>
                <h4 className="font-semibold" style={{ color: colors.text }}>{testimonial.author}</h4>
                <p className="text-sm" style={{ color: colors.textMuted }}>{testimonial.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'classes':
        return renderClasses();
      case 'progress':
        return renderProgress();
      case 'examinations':
        return renderExaminations();
      case 'testimonials':
        return renderTestimonials();
      case 'biblical-studies':
      case 'systematic-theology':
      case 'christian-leadership':
      case 'christian-ethics':
        return renderClassView(activeTab);
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.primary }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`} style={{ backgroundColor: colors.tertiary }}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-slate-700">
            <h1 className="text-xl font-bold mb-2" style={{ color: colors.accent }}>
              ✟ Grace Academy
            </h1>
            <p className="text-sm" style={{ color: colors.textMuted }}>Excellence in Christian Education</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 border-l-4 ${
                    activeTab === item.id
                      ? 'border-cyan-400 text-cyan-400' 
                      : 'border-transparent hover:bg-slate-700'
                  }`}
                  style={activeTab === item.id ? { backgroundColor: colors.primary, color: colors.accent } : { color: colors.textMuted }}
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Header */}
        <header className="p-4 lg:p-6 border-b border-slate-700" style={{ backgroundColor: colors.tertiary }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleSidebar}
                className="lg:hidden p-2 rounded-lg text-white transition-colors hover:opacity-80"
                style={{ backgroundColor: colors.accent }}
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div>
                <h2 className="text-xl font-semibold" style={{ color: colors.text }}>Welcome back, Sarah!</h2>
                <p style={{ color: colors.textMuted }}>Continue your faith-based learning journey</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: colors.accent }}>
                SJ
              </div>
              <span className="hidden sm:inline" style={{ color: colors.text }}>Sarah Johnson</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 lg:p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default GraceAcademyApp;