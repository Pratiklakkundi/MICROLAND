import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SparklesIcon, 
  RocketLaunchIcon,
  UserGroupIcon,
  LightBulbIcon,
  CheckCircleIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import { buildTeamWithAI, getProjects } from '../api';
import toast from 'react-hot-toast';
import Navbar from './Navbar';

function AITeamBuilder({ onLogout }) {
  const [prompt, setPrompt] = useState('');
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await getProjects();
      setProjects(response.data);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast.error('Failed to load projects');
    }
  };

  const handleBuildTeam = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    
    try {
      const response = await buildTeamWithAI({
        prompt,
        project_id: selectedProject || null
      });
      setResult(response.data);
      toast.success('Team recommendations generated!');
    } catch (error) {
      console.error('Error building team:', error);
      toast.error('Failed to build team. Check your API configuration.');
    } finally {
      setLoading(false);
    }
  };

  const roleColors = [
    'from-blue-500 to-cyan-600',
    'from-purple-500 to-pink-600',
    'from-green-500 to-emerald-600',
    'from-orange-500 to-red-600',
    'from-indigo-500 to-purple-600'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
              <SparklesIcon className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              AI Team Builder
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Let AI find the perfect team members for your project
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="card-glass p-8">
              <div className="flex items-center space-x-3 mb-6">
                <RocketLaunchIcon className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Build Your Dream Team
                </h2>
              </div>

              <form onSubmit={handleBuildTeam} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Project (Optional)
                  </label>
                  <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="input"
                  >
                    <option value="">-- No specific project --</option>
                    {projects.map(project => (
                      <option key={project.project_id} value={project.project_id}>
                        {project.title}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Describe Your Team Needs
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Example: I need a team for a fintech hackathon. Looking for a React developer with UI/UX skills, a Python backend developer experienced with APIs, and someone great at pitching ideas."
                    rows="6"
                    className="input resize-none"
                    required
                  />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Be specific about skills, experience level, and project requirements
                  </p>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full py-4 text-lg font-semibold flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Building Your Team...</span>
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="w-6 h-6" />
                      <span>Generate Team Recommendations</span>
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="card-glass p-6">
              <div className="flex items-center space-x-2 mb-4">
                <LightBulbIcon className="w-6 h-6 text-yellow-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tips</h3>
              </div>
              <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start space-x-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <span>Be specific about required skills and experience</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <span>Mention project type and timeline</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <span>Include soft skills if important</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <span>Specify team size preferences</span>
                </li>
              </ul>
            </div>

            <div className="card-glass p-6">
              <div className="flex items-center space-x-2 mb-4">
                <UserGroupIcon className="w-6 h-6 text-blue-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">How It Works</h3>
              </div>
              <ol className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs flex items-center justify-center font-bold">1</span>
                  <span>Describe your needs</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs flex items-center justify-center font-bold">2</span>
                  <span>AI analyzes requirements</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs flex items-center justify-center font-bold">3</span>
                  <span>Get matched with talent</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs flex items-center justify-center font-bold">4</span>
                  <span>Send invitations</span>
                </li>
              </ol>
            </div>
          </motion.div>
        </div>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-8"
            >
              <div className="card-glass p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <CheckCircleIcon className="w-8 h-8 text-green-500" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    AI Recommendations
                  </h2>
                </div>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 mb-8 border border-blue-200 dark:border-blue-800"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
                    <LightBulbIcon className="w-5 h-5 text-yellow-500" />
                    <span>Analysis</span>
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {result.analysis}
                  </p>
                </motion.div>
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Recommended Team Members
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {result.recommendations.map((rec, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -5 }}
                      className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-transparent hover:border-purple-500 transition-all shadow-lg"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${roleColors[index % roleColors.length]} flex items-center justify-center`}>
                            <span className="text-white font-bold text-lg">
                              {rec.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 dark:text-white text-lg">
                              {rec.name}
                            </h4>
                            <p className={`text-sm font-medium bg-gradient-to-r ${roleColors[index % roleColors.length]} bg-clip-text text-transparent`}>
                              {rec.role}
                            </p>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                        {rec.reasoning}
                      </p>
                    </motion.div>
                  ))}
                </div>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
                    <PaperAirplaneIcon className="w-5 h-5 text-green-500" />
                    <span>Introduction Message</span>
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {result.introduction_message}
                  </p>
                </motion.div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn btn-primary w-full mt-6 py-4 text-lg font-semibold flex items-center justify-center space-x-2"
                  onClick={() => toast.success('Invitations sent!')}
                >
                  <CheckCircleIcon className="w-6 h-6" />
                  <span>Approve & Send Invitations</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default AITeamBuilder;
