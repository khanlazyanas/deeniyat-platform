export default function DashboardOverview() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Welcome back, Student! 👋</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Enrolled Courses</h3>
          <p className="text-4xl font-bold text-blue-600 mt-2">2</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Pending Assignments</h3>
          <p className="text-4xl font-bold text-orange-500 mt-2">1</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Attendance Rate</h3>
          <p className="text-4xl font-bold text-green-500 mt-2">95%</p>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
            <div>
              <p className="text-gray-800 font-medium">Submitted Tajweed Audio</p>
              <p className="text-sm text-gray-500">Lesson 3: Haroof-e-Maddah</p>
            </div>
            <span className="text-sm text-gray-400">2 hours ago</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
            <div>
              <p className="text-gray-800 font-medium">Attended Live Class</p>
              <p className="text-sm text-gray-500">Noorani Qaida Basics</p>
            </div>
            <span className="text-sm text-gray-400">Yesterday</span>
          </div>
        </div>
      </div>
      
    </div>
  );
}