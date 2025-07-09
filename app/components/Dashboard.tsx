'use client';

import React from 'react';
import { colors } from '@/lib/constants';

const Dashboard: React.FC = () => {
  const stats = [
    { value: '12', label: 'Active Courses', color: colors.secondary },
    { value: '87%', label: 'Overall Progress', color: colors.success },
    { value: '24', label: 'Completed Lessons', color: colors.accent },
    { value: '3', label: 'Upcoming Exams', color: colors.warning }
  ];

  const activities = [
    { action: 'Completed:', item: 'Biblical History - Lesson 5', time: '2 hours ago', color: colors.success },
    { action: 'Started:', item: 'Christian Ethics Discussion', time: 'Yesterday', color: colors.secondary },
    { action: 'Submitted:', item: 'Theology Assignment #3', time: '3 days ago', color: colors.accent }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: colors.text }}>
        <div className="w-1 h-8 rounded" style={{ backgroundColor: colors.accent }}></div>
        Dashboard Overview
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="p-6 rounded-xl border border-slate-700 backdrop-blur-sm" 
            style={{ backgroundColor: colors.tertiary }}
          >
            <div className="text-3xl font-bold mb-2" style={{ color: stat.color }}>
              {stat.value}
            </div>
            <div className="text-sm" style={{ color: colors.textMuted }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <div 
        className="p-6 rounded-xl border border-slate-700 backdrop-blur-sm" 
        style={{ backgroundColor: colors.tertiary }}
      >
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: colors.text }}>
          <div className="w-1 h-6 rounded" style={{ backgroundColor: colors.accent }}></div>
          Recent Activity
        </h3>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-center gap-4 py-3 border-b border-slate-600 last:border-b-0">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: activity.color }}></div>
              <div className="flex-1">
                <div style={{ color: colors.text }}>
                  <strong>{activity.action}</strong> {activity.item}
                </div>
                <div className="text-sm" style={{ color: colors.textMuted }}>
                  {activity.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;