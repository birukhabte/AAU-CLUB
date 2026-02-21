import React, { useState } from 'react';
import { 
  UserPlus, CheckCircle, XCircle, Eye, Search,
  Filter, Clock, Mail, BookOpen, Calendar, User,
  ChevronDown, Download, RefreshCw, AlertCircle
} from 'lucide-react';

interface MemberRequest {
  id: string;
  name: string;
  studentId: string;
  email: string;
  department: string;
  year: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
  skills?: string[];
  avatar?: string;
}

const MembershipRequestsPanel: React.FC = () => {
  const [requests, setRequests] = useState<MemberRequest[]>([
    { 
      id: '1', 
      name: 'Abebe Kebede', 
      studentId: 'AAU/2024/1234',
      email: 'abebe.k@student.aau.edu.et',
      department: 'Computer Science',
      year: '3rd Year',
      requestedAt: '2024-03-15T09:30:00',
      status: 'pending',
      reason: 'Passionate about robotics and AI, have experience with Arduino',
      skills: ['Python', 'Arduino', 'Team Player']
    },
    { 
      id: '2', 
      name: 'Sara Tesfaye', 
      studentId: 'AAU/2024/5678',
      email: 'sara.t@student.aau.edu.et',
      department: 'Electrical Engineering',
      year: '2nd Year',
      requestedAt: '2024-03-14T14:20:00',
      status: 'pending',
      reason: 'Want to learn robotics and work on real projects',
      skills: ['Circuit Design', 'C++', 'Problem Solving']
    },
    { 
      id: '3', 
      name: 'Dawit Haile', 
      studentId: 'AAU/2024/9012',
      email: 'dawit.h@student.aau.edu.et',
      department: 'Mechanical Engineering',
      year: '4th Year',
      requestedAt: '2024-03-14T11:15:00',
      status: 'pending',
      reason: 'Experienced in CAD and want to contribute to robotics design',
      skills: ['AutoCAD', 'SolidWorks', 'Leadership']
    },
    { 
      id: '4', 
      name: 'Meron Assefa', 
      studentId: 'AAU/2024/3456',
      email: 'meron.a@student.aau.edu.et',
      department: 'Software Engineering',
      year: '3rd Year',
      requestedAt: '2024-03-13T16:45:00',
      status: 'pending',
      reason: 'Interested in AI and machine learning applications in robotics',
      skills: ['JavaScript', 'Python', 'React']
    },
  ]);

  const [selectedRequest, setSelectedRequest] = useState<MemberRequest | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Filter and search logic
  const filteredRequests = requests
    .filter(req => req.status === 'pending')
    .filter(req => {
      const matchesSearch = 
        req.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDepartment = filterDepartment === 'all' || req.department === filterDepartment;
      const matchesYear = filterYear === 'all' || req.year === filterYear;
      
      return matchesSearch && matchesDepartment && matchesYear;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime();
      } else {
        return new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime();
      }
    });

  const handleApprove = (id: string) => {
    setRequests(prev => 
      prev.map(req => 
        req.id === id ? { ...req, status: 'approved' } : req
      )
    );
    // Show success notification
    alert('Member request approved successfully!');
  };

  const handleReject = (id: string) => {
    if (window.confirm('Are you sure you want to reject this membership request?')) {
      setRequests(prev => 
        prev.map(req => 
          req.id === id ? { ...req, status: 'rejected' } : req
        )
      );
    }
  };

  const handleBulkApprove = () => {
    if (window.confirm(`Approve all ${filteredRequests.length} pending requests?`)) {
      const updatedRequests = requests.map(req => 
        req.status === 'pending' ? { ...req, status: 'approved' } : req
      );
      setRequests(updatedRequests);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  // Get unique departments for filter
  const departments = ['all', ...new Set(requests.map(r => r.department))];
  const years = ['all', ...new Set(requests.map(r => r.year))];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="p-2 bg-blue-600 rounded-lg">
              <UserPlus className="h-5 w-5 text-white" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-gray-800">Membership Requests</h3>
              <p className="text-sm text-gray-600">
                Review and manage pending membership applications
              </p>
            </div>
          </div>
          
          {/* Stats Badge */}
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {filteredRequests.length} Pending
            </span>
            {filteredRequests.length > 1 && (
              <button
                onClick={handleBulkApprove}
                className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Approve All
              </button>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, ID, or email..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
          >
            <option value="all">All Departments</option>
            {departments.filter(d => d !== 'all').map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
          >
            <option value="all">All Years</option>
            {years.filter(y => y !== 'all').map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Requests List */}
      <div className="divide-y divide-gray-200">
        {filteredRequests.length > 0 ? (
          filteredRequests.map((request) => (
            <div key={request.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                {/* Left side - Student Info */}
                <div className="flex-1">
                  <div className="flex items-start mb-3">
                    <div className="flex-shrink-0">
                      {request.avatar ? (
                        <img src={request.avatar} alt={request.name} className="h-10 w-10 rounded-full" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                      )}
                    </div>
                    <div className="ml-3">
                      <div className="flex items-center flex-wrap gap-2">
                        <h4 className="font-semibold text-gray-800">{request.name}</h4>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {request.studentId}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Mail className="h-3 w-3 mr-1" />
                        {request.email}
                      </div>
                    </div>
                  </div>

                  {/* Student Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 ml-13 mt-3">
                    <div className="flex items-center text-sm">
                      <BookOpen className="h-4 w-4 mr-2 text-gray-400" />
                      <div>
                        <p className="text-gray-500 text-xs">Department</p>
                        <p className="text-gray-800 font-medium">{request.department}</p>
                      </div>
                    </div>
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <div>
                        <p className="text-gray-500 text-xs">Year</p>
                        <p className="text-gray-800 font-medium">{request.year}</p>
                      </div>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      <div>
                        <p className="text-gray-500 text-xs">Requested</p>
                        <p className="text-gray-800 font-medium">{formatDate(request.requestedAt)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Reason for joining */}
                  {request.reason && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Reason for joining:</p>
                      <p className="text-sm text-gray-700">{request.reason}</p>
                    </div>
                  )}

                  {/* Skills/Tags */}
                  {request.skills && request.skills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {request.skills.map((skill, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right side - Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 mt-4 lg:mt-0 lg:ml-6">
                  <button
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowProfileModal(true);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm flex items-center justify-center"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Profile
                  </button>
                  <button
                    onClick={() => handleApprove(request.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center justify-center"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(request.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm flex items-center justify-center"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h4 className="text-lg font-medium text-gray-800 mb-2">All Caught Up!</h4>
            <p className="text-gray-500">No pending membership requests at the moment</p>
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterDepartment('all');
                  setFilterYear('all');
                }}
                className="mt-4 text-blue-600 hover:text-blue-700 text-sm"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* View Profile Modal */}
      {showProfileModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-gray-800">Student Profile</h3>
              <button 
                onClick={() => setShowProfileModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <XCircle className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Profile Header */}
              <div className="flex items-center mb-6">
                <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-10 w-10 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h4 className="text-2xl font-bold text-gray-800">{selectedRequest.name}</h4>
                  <p className="text-gray-600">{selectedRequest.studentId}</p>
                </div>
              </div>

              {/* Profile Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <p className="text-gray-800">{selectedRequest.email}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Department</p>
                  <p className="text-gray-800">{selectedRequest.department}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Year of Study</p>
                  <p className="text-gray-800">{selectedRequest.year}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Request Date</p>
                  <p className="text-gray-800">{new Date(selectedRequest.requestedAt).toLocaleString()}</p>
                </div>
              </div>

              {/* Reason Section */}
              <div className="mb-6">
                <h5 className="font-semibold text-gray-800 mb-2">Reason for Joining</h5>
                <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">
                  {selectedRequest.reason || 'No reason provided'}
                </p>
              </div>

              {/* Skills Section */}
              {selectedRequest.skills && selectedRequest.skills.length > 0 && (
                <div className="mb-6">
                  <h5 className="font-semibold text-gray-800 mb-2">Skills & Interests</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedRequest.skills.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  handleReject(selectedRequest.id);
                  setShowProfileModal(false);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleApprove(selectedRequest.id);
                  setShowProfileModal(false);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Approve Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembershipRequestsPanel;