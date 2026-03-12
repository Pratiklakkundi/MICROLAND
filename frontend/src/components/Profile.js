import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserCircleIcon, 
  PencilIcon, 
  CheckIcon,
  XMarkIcon,
  SparklesIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';
import { getUsers, updateUser } from '../api';
import toast from 'react-hot-toast';
import Navbar from './Navbar';

function Profile({ onLogout }) {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    skills: '',
    experience_level: 'beginner',
    availability: 'available',
    bio: ''
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => 
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      ).join(''));
      const decoded = JSON.parse(jsonPayload);
      const userId = decoded.sub;
      
      const response = await getUsers();
      setUsers(response.data);
      
      const user = response.data.find(u => u.user_id === userId);
      if (user) {
        setCurrentUser(user);
        setFormData({
          name: user.name,
          skills: user.skills.join(', '),
          experience_level: user.experience_level,
          availability: user.availability,
          bio: user.bio
        });
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load profile');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateUser(currentUser.user_id, {
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim())
      });
      setEditing(false);
      loadUsers();
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const getExperienceBadge = (level) => {
    const badges = {
      beginner: { color: 'from-green-500 to-emerald-600', icon: '🌱' },
      intermediate: { color: 'from-blue-500 to-cyan-600', icon: '⚡' },
      advanced: { color: 'from-purple-500 to-pink-600', icon: '🚀' }
    };
    return badges[level] || badges.beginner;
  };

  const getAvailabilityColor = (status) => {
    return status === 'available' 
      ? 'bg-green-500' 
      : 'bg-orange-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your profile and connect with talented people
          </p>
        </motion.div>

        {currentUser && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card-glass p-8 mb-8"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                  <UserCircleIcon className="w-12 h-12 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{currentUser.name}</h2>
                  <p className="text-gray-600 dark:text-gray-400">{currentUser.email}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={`w-3 h-3 rounded-full ${getAvailabilityColor(currentUser.availability)} animate-pulse`}></span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {currentUser.availability}
                    </span>
                  </div>
                </div>
              </div>
              
              {!editing && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setEditing(true)}
                  className="btn btn-primary flex items-center space-x-2"
                >
                  <PencilIcon className="w-5 h-5" />
                  <span>Edit Profile</span>
                </motion.button>
              )}
            </div>

            <AnimatePresence mode="wait">
              {!editing ? (
                <motion.div
                  key="view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <BriefcaseIcon className="w-5 h-5 text-gray-500" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Experience Level</h3>
                    </div>
                    <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r ${getExperienceBadge(currentUser.experience_level).color} text-white font-medium`}>
                      <span>{getExperienceBadge(currentUser.experience_level).icon}</span>
                      <span className="capitalize">{currentUser.experience_level}</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <SparklesIcon className="w-5 h-5 text-gray-500" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Skills</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {currentUser.skills.map((skill, index) => (
                        <motion.span
                          key={skill}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="skill-tag"
                        >
                          {skill}
                        </motion.span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Bio</h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {currentUser.bio || 'No bio added yet.'}
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  key="edit"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleUpdate}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Skills (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.skills}
                      onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                      className="input"
                      placeholder="React, Python, UI/UX"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Experience Level
                      </label>
                      <select
                        value={formData.experience_level}
                        onChange={(e) => setFormData({ ...formData, experience_level: e.target.value })}
                        className="input"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Availability
                      </label>
                      <select
                        value={formData.availability}
                        onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                        className="input"
                      >
                        <option value="available">Available</option>
                        <option value="busy">Busy</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bio</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      rows="4"
                      className="input"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div className="flex space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="btn btn-primary flex items-center space-x-2"
                    >
                      <CheckIcon className="w-5 h-5" />
                      <span>Save Changes</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => setEditing(false)}
                      className="btn btn-secondary flex items-center space-x-2"
                    >
                      <XMarkIcon className="w-5 h-5" />
                      <span>Cancel</span>
                    </motion.button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Community Members</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.filter(u => u.user_id !== currentUser?.user_id).map((user, index) => (
              <motion.div
                key={user.user_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="card-glass p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{user.name}</h3>
                      <div className="flex items-center space-x-1 mt-1">
                        <span className={`w-2 h-2 rounded-full ${getAvailabilityColor(user.availability)}`}></span>
                        <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                          {user.availability}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-lg bg-gradient-to-r ${getExperienceBadge(user.experience_level).color} text-white text-xs font-medium`}>
                    {getExperienceBadge(user.experience_level).icon}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {user.skills.slice(0, 4).map(skill => (
                    <span key={skill} className="skill-tag text-xs">
                      {skill}
                    </span>
                  ))}
                  {user.skills.length > 4 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      +{user.skills.length - 4} more
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {user.bio || 'No bio available.'}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Profile;
