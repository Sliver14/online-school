export const colors = {
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

export interface ClassItem {
  id: string;
  title: string;
  category: string;
  instructor: string;
  progress: number;
  color: string;
  status: 'completed' | 'countdown' | 'locked';
}

export interface NavItem {
  id: string;
  label: string;
  icon: string;
}

export interface Assessment {
  title: string;
  status: string;
  statusColor: string;
  description: string;
  action: string;
  id: string;
}

export interface VideoWatched {
  [key: string]: boolean;
}

export interface AssessmentCompleted {
  [assessmentId: string]: boolean;
}

export interface CountdownTimers {
  [key: string]: number | null;
}

// export interface Testimonial {
//   text: string;
//   author: string;
//   role: string;
// }

// export const testimonials: Testimonial[] = [
//   {
//     text: "Grace Academy has transformed my understanding of faith and scripture. The online platform makes learning flexible while maintaining deep spiritual growth.",
//     author: "Emily Richardson",
//     role: "Theology Graduate, Class of 2024"
//   },
//   {
//     text: "The biblical studies program here is exceptional. The professors are knowledgeable and truly care about each student's spiritual journey.",
//     author: "David Chen",
//     role: "Ministry Student, Class of 2025"
//   },
//   {
//     text: "The Christian leadership courses prepared me for real ministry. I'm now serving as a youth pastor and applying everything I learned.",
//     author: "Maria Santos",
//     role: "Alumni, Youth Pastor"
//   },
//   {
//     text: "The online format allowed me to continue my education while raising my family. The support from faculty and students is incredible.",
//     author: "Rachel Johnson",
//     role: "Biblical Studies Student"
//   }
// ];