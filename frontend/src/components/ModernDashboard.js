import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  UserGroupIcon, 
  BriefcaseIcon, 
  SparklesIcon,
  ChartBarIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import Navbar from './Navbar';

function ModernDashboard({ onLogout }) {
  const stats = [
    { label: 'Active Users', value: '1,234', icon: UserGroupIcon, color: 'from-blue-500 to-cyan-500' },
    { label: 'Projects', value: '89', icon: BriefcaseIcon, color: 'from-purple-500 to-pink-500' },
    { label: 'Matches Made', value: '456', icon: SparklesIcon, color: 'from-green-500 to-emerald-500' },
    { label: 'Success Rate', value: '94%', icon: ChartBarIcon, color: 'from-orange-500 to-red-500' },
  ];

  const quickActions = [
    {
      title: 'Edit Profile',
      description: 'Update your skills and experience',
      icon: UserGroupIcon,
      link: '/profile',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Browse Projects',
      description: 'Find exciting projects to join',
      icon: BriefcaseIcon,
      link: '/projects',
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'AI Team Builder',
      description: 'Let AI find your perfect team',
      icon: SparklesIcon,
      link: '/ai-builder',
      color: 'from-green-500 to-emerald-500'
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Welcome Back! 👋
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Ready to build amazing teams today?
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -5 }}
                className="card-glass p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  </div>
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link key={index} to={action.link}>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className="card-glass p-6 cursor-pointer group"
                  >
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {action.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {action.description}
                    </p>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="card-glass p-8"
        >
          <div className="flex items-center space-x-3 mb-6">
            <LightBulbIcon className="w-8 h-8 text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">How It Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Create Profile', desc: 'Add your skills and experience' },
              { step: '2', title: 'Browse Projects', desc: 'Find projects that match your interests' },
              { step: '3', title: 'Get Matched', desc: 'AI finds the best teammates for you' },
              { step: '4', title: 'Build Together', desc: 'Collaborate and create amazing things' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xl flex items-center justify-center mx-auto mb-3">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default ModernDashboard;
