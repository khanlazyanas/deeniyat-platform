import Link from "next/link";

// Abhi ke liye dummy data (Baad mein yeh humare Express backend se aayega)
const dummyCourses = [
  {
    id: "1",
    title: "Noorani Qaida Basics",
    level: "Beginner",
    description: "Learn the foundational Arabic alphabets and pronunciation.",
    instructor: "Ustad Ahmed",
    color: "bg-green-100",
  },
  {
    id: "2",
    title: "Tajweed for Intermediates",
    level: "Intermediate",
    description: "Perfect your Quranic recitation with advanced Tajweed rules.",
    instructor: "Ustad Ali",
    color: "bg-blue-100",
  },
  {
    id: "3",
    title: "Hifz Intensive Program",
    level: "Advanced",
    description: "Memorize the Holy Quran with daily tracking and guidance.",
    instructor: "Ustad Fatima",
    color: "bg-purple-100",
  },
  {
    id: "4",
    title: "Islamic Studies & Seerah",
    level: "Beginner",
    description: "Understand the life of the Prophet (PBUH) and basic Fiqh.",
    instructor: "Ustad Omar",
    color: "bg-yellow-100",
  }
];

export default function CoursesPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Explore Our Courses</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Choose from our expertly crafted programs to begin or advance your journey in Islamic learning.
        </p>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {dummyCourses.map((course) => (
          <div key={course.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition flex flex-col">
            {/* Thumbnail Placeholder */}
            <div className={`h-48 w-full flex items-center justify-center ${course.color}`}>
              <span className="text-gray-500 font-medium">Image / Thumbnail</span>
            </div>
            
            <div className="p-6 flex flex-col flex-grow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-gray-800">{course.title}</h3>
                <span className="px-2 py-1 bg-gray-100 text-xs font-semibold text-gray-600 rounded">
                  {course.level}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-4">By {course.instructor}</p>
              <p className="text-gray-600 mb-6 flex-grow">{course.description}</p>
              
              <Link 
                href={`/courses/${course.id}`}
                className="w-full text-center bg-blue-50 text-blue-600 font-medium py-2 rounded hover:bg-blue-600 hover:text-white transition"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}