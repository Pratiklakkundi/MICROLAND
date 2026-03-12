import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon, 
  XMarkIcon, 
  SparklesIcon,
  UserGroupIcon,
  CheckCircleIcon,
  BriefcaseIcon,
  FireIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import { getProjects, createProject, getMatches } from '../api';
import toast from 'react-hot-toast';
import Navbar from './Navbar';
import EmptyState from './EmptyState';

function ModernProjects({ onLogout }) {
  const [projects, setProjects] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [matches, setMatches] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    required_skills: '',
    team_size: 3
  });

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

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createProject({
        ...formData,
        required_skills: formData.required_skills.split(',').map(s => s.trim())
      });
      toast.success('Project created successfully!');
      setShowCreate(false);
      setFormData({ title: '', description: '', required_skills: '', team_size: 3 });
      loadProjects();
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    }
  };

  const handleFindMatches = async (projectId) => {
    try {
      const response = await getMatches(projectId);
      setMatches(response.data.matches);
      setSelectedProject(projectId);
      toast.success(`Found ${response.data.matches.length} matches!`);
    } catch (error) {
      console.error('Error finding matches:', error);
      toast.error('Failed to find matches');
    }
  };

  const getMatchColor = (score) => {
    if (score >= 80) return 'from-green-500 to-emerald-600';
    if (score >= 60) return 'from-blue-500 to-cyan-600';
    if (score >= 40) return 'from-yellow-500 to-orange-600';
    return 'from-gray-500 to-gray-600';
  };

  const getMatchIcon = (score) => {
    if (score >= 80) return '🔥';
    if (score >= 60) return '⭐';
    if (score >= 40) return '✨';
    return '💫';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Projects
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Discover exciting projects and find your perfect team
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreate(!showCreate)}
            className="btn btn-primary flex items-center space-x-2"
          >
            {showCreate ? (
              <>
                <XMarkIcon className="w-5 h-5" />
                <span>Cancel</span>
              </>
            ) : (
              <>
                <PlusIcon className="w-5 h-5" />
                <span>Create Project</span>
              </>
            )}
          </motion.button>
        </motion.div>

        <AnimatePresence>
          {showCreate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8"
            >
              <div className="card-glass p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Create New Project
                </h2>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Project Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="input"
                      placeholder="Enter project title"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="input resize-none"
                      rows="4"
                      placeholder="Describe your project..."
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Required Skills (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.required_skills}
                      onChange={(e) => setFormData({ ...formData, required_skills: e.target.value })}
                      className="input"
                      placeholder="React, Python, UI/UX"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Team Size
                    </label>
                    <input
                      type="number"
                      value={formData.team_size}
                      onChange={(e) => setFormData({ ...formData, team_size: parseInt(e.target.value) })}
                      className="input"
                      min="1"
                      max="20"
                      required
                    />
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="btn btn-primary w-full py-3 flex items-center justify-center space-x-2"
                  >
                    <CheckCircleIcon className="w-5 h-5" />
                    <span>Create Project</span>
                  </motion.button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {projects.length === 0 && !showCreate ? (
          <EmptyState
            icon={BriefcaseIcon}
            title="No Projects Yet"
            description="Start building amazing teams by creating your first project. Define your requirements and let AI help you find the perfect team members."
            action={() => setShowCreate(true)}
            actionLabel="Create Your First Project"
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {projects.map((project, index) => (
            <motion.div
              key={project.project_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -5 }}
              className="card-glass p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                    <BriefcaseIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {project.title}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <UsersIcon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Team size: {project.team_size}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
                {project.description}
              </p>

              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Required Skills:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {project.required_skills.map((skill, idx) => (
                    <span key={idx} className="skill-tag text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleFindMatches(project.project_id)}
                className="btn btn-primary w-full flex items-center justify-center space-x-2"
              >
                <SparklesIcon className="w-5 h-5" />
                <span>Find Matches</span>
              </motion.button>
            </motion.div>
          ))}
          </div>
        )}

        <AnimatePresence>
          {selectedProject && matches.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="card-glass p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <FireIcon className="w-8 h-8 text-orange-500" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Top Matches
                  </h2>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedProject(null);
                    setMatches([]);
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="w-6 h-6" />
                </motion.button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {matches.map((match, index) => (
                  <motion.div
                    key={match.user_id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-transparent hover:border-purple-500 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {match.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white">
                            {match.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                            {match.experience_level}
                          </p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${getMatchColor(match.match_score)} text-white font-bold text-sm flex items-center space-x-1`}>
                        <span>{getMatchIcon(match.match_score)}</span>
                        <span>{match.match_score}%</span>
                      </div>
                    </div>

                    <div className="mb-3">
                      <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                        Matching Skills:
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {match.matching_skills.map((skill, idx) => (
                          <span key={idx} className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 font-medium">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {match.bio || 'No bio available.'}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default ModernProjects;
