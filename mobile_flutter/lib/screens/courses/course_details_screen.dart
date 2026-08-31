import 'package:flutter/material.dart';
import 'dart:ui';
import '../../services/course_service.dart';
import '../../services/lesson_service.dart';
import '../../utils/constants.dart';

class CourseDetailsScreen extends StatefulWidget {
  final String courseId;

  const CourseDetailsScreen({super.key, required this.courseId});

  @override
  State<CourseDetailsScreen> createState() => _CourseDetailsScreenState();
}

class _CourseDetailsScreenState extends State<CourseDetailsScreen> {
  final CourseService _courseService = CourseService();
  final LessonService _lessonService = LessonService();

  bool isLoading = true;
  Map<String, dynamic>? courseData;
  List<dynamic> lessons = [];

  @override
  void initState() {
    super.initState();
    _fetchCourseAndLessons();
  }

  String getFullImageUrl(String url) {
    if (url.isEmpty) return "";
    String cleanUrl = url.replaceAll('\\', '/');
    if (cleanUrl.startsWith("http")) return cleanUrl;
    final baseUrl = ApiConstants.baseUrl.replaceAll('/api/v1/auth', '').replaceAll('/api/v1', '');
    String finalUrl = "$baseUrl/$cleanUrl";
    return finalUrl.replaceAll(RegExp(r'(?<!:)/+'), '/');
  }

  Future<void> _fetchCourseAndLessons() async {
    setState(() => isLoading = true);
    try {
      // Fetch Course Details
      final courseRes = await _courseService.getCourseById(widget.courseId);
      if (courseRes['success']) {
        courseData = courseRes['data'];
      } else {
        _showError(courseRes['message']);
        return;
      }

      // Fetch Curriculum (Lessons)
      final lessonRes = await _lessonService.getLessonsByCourse(widget.courseId);
      if (lessonRes['success']) {
        lessons = lessonRes['data'];
      }
    } catch (e) {
      _showError('Network error. Check connection.');
    } finally {
      if (mounted) setState(() => isLoading = false);
    }
  }

  void _showError(String message) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.error_outline_rounded, color: Colors.white, size: 20),
              const SizedBox(width: 10),
              Expanded(child: Text(message, style: const TextStyle(fontWeight: FontWeight.w500))),
            ],
          ),
          backgroundColor: const Color(0xFFE11D48),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          margin: const EdgeInsets.all(16),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return const Scaffold(
        backgroundColor: Color(0xFFF8FAFC),
        body: Center(child: CircularProgressIndicator(color: Color(0xFF0F766E), strokeWidth: 3.0)),
      );
    }

    if (courseData == null) {
      return Scaffold(
        backgroundColor: const Color(0xFFF8FAFC),
        appBar: AppBar(backgroundColor: Colors.transparent, elevation: 0, foregroundColor: const Color(0xFF0F172A)),
        body: const Center(child: Text('Course not found', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold))),
      );
    }

    final teacherName = courseData!['teacherId'] != null ? courseData!['teacherId']['name'] : 'Unknown Ustad';
    final teacherAvatar = courseData!['teacherId'] != null ? (courseData!['teacherId']['profileImage'] ?? '') : '';
    final price = courseData!['price'] != null && courseData!['price'] > 0 ? '₹${courseData!['price']}' : 'Free';
    final level = courseData!['level'] ?? 'Beginner';
    final thumbnailUrl = courseData!['thumbnail'] ?? '';

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
        decoration: BoxDecoration(
          color: Colors.white,
          border: const Border(top: BorderSide(color: Color(0xFFF1F5F9), width: 1.5)),
          boxShadow: [
            BoxShadow(color: const Color(0xFF0F172A).withOpacity(0.05), blurRadius: 20, offset: const Offset(0, -10)),
          ],
        ),
        child: SafeArea(
          child: Row(
            children: [
              Expanded(
                flex: 1,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Total Price', style: TextStyle(color: Color(0xFF64748B), fontSize: 12, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 2),
                    Text(
                      price,
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.w900,
                        color: price == 'Free' ? const Color(0xFF059669) : const Color(0xFF0F172A),
                        letterSpacing: -0.5,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                flex: 2,
                child: SizedBox(
                  height: 56,
                  child: ElevatedButton(
                    onPressed: () {
                      // TODO: Payment Gateway / Enrollment Logic
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF0F766E),
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                    child: const Text('Enroll Now', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, letterSpacing: 0.5)),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
      body: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          // 🖼️ Premium Image Header
          SliverAppBar(
            expandedHeight: 280.0,
            floating: false,
            pinned: true,
            backgroundColor: const Color(0xFFF8FAFC),
            foregroundColor: const Color(0xFF0F172A),
            elevation: 0,
            leading: Padding(
              padding: const EdgeInsets.all(8.0),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: BackdropFilter(
                  filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                  child: Container(
                    decoration: BoxDecoration(color: Colors.white.withOpacity(0.8), borderRadius: BorderRadius.circular(12)),
                    child: IconButton(
                      icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20, color: Color(0xFF0F172A)),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ),
                ),
              ),
            ),
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                fit: StackFit.expand,
                children: [
                  thumbnailUrl.isNotEmpty
                      ? Image.network(getFullImageUrl(thumbnailUrl), fit: BoxFit.cover)
                      : Container(color: const Color(0xFFCBD5E1), child: const Icon(Icons.menu_book_rounded, size: 80, color: Colors.white)),
                  // Gradient Overlay for readability
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [Colors.black.withOpacity(0.3), Colors.transparent, const Color(0xFFF8FAFC)],
                        stops: const [0.0, 0.5, 1.0],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // 📝 Course Details Body
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(24, 10, 24, 40),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Badges
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(color: const Color(0xFFFFFBEB), borderRadius: BorderRadius.circular(20), border: Border.all(color: const Color(0xFFFEF3C7))),
                        child: Text(level.toUpperCase(), style: const TextStyle(color: Color(0xFFD97706), fontSize: 10, fontWeight: FontWeight.w800, letterSpacing: 1)),
                      ),
                      const SizedBox(width: 10),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(color: const Color(0xFFEFF6FF), borderRadius: BorderRadius.circular(20), border: Border.all(color: const Color(0xFFDBEAFE))),
                        child: Text('${lessons.length} LESSONS', style: const TextStyle(color: Color(0xFF2563EB), fontSize: 10, fontWeight: FontWeight.w800, letterSpacing: 1)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Title
                  Text(
                    courseData!['title'] ?? 'Course Title',
                    style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: Color(0xFF0F172A), height: 1.2, letterSpacing: -0.5),
                  ),
                  const SizedBox(height: 24),

                  // Teacher Card
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFFF1F5F9), width: 1.5),
                      boxShadow: [BoxShadow(color: const Color(0xFF0F172A).withOpacity(0.02), blurRadius: 15, offset: const Offset(0, 5))],
                    ),
                    child: Row(
                      children: [
                        CircleAvatar(
                          radius: 24,
                          backgroundColor: const Color(0xFFF1F5F9),
                          backgroundImage: teacherAvatar.isNotEmpty ? NetworkImage(getFullImageUrl(teacherAvatar)) : null,
                          child: teacherAvatar.isEmpty ? const Icon(Icons.person_rounded, color: Color(0xFF94A3B8)) : null,
                        ),
                        const SizedBox(width: 16),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Course Instructor', style: TextStyle(color: Color(0xFF64748B), fontSize: 12, fontWeight: FontWeight.w600)),
                            const SizedBox(height: 2),
                            Text(teacherName, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: Color(0xFF0F172A))),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 32),

                  // About Section
                  const Text('About this Course', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: Color(0xFF0F172A), letterSpacing: -0.5)),
                  const SizedBox(height: 12),
                  Text(
                    courseData!['description'] ?? 'No detailed description available for this course.',
                    style: const TextStyle(fontSize: 15, color: Color(0xFF475569), height: 1.6, fontWeight: FontWeight.w500),
                  ),
                  const SizedBox(height: 40),

                  // Curriculum Section
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Curriculum', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: Color(0xFF0F172A), letterSpacing: -0.5)),
                      Text('${lessons.length} items', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Color(0xFF0F766E))),
                    ],
                  ),
                  const SizedBox(height: 16),

                  lessons.isEmpty
                      ? Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(32),
                          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), border: Border.all(color: const Color(0xFFF1F5F9))),
                          child: const Column(
                            children: [
                              Icon(Icons.hourglass_empty_rounded, size: 40, color: Color(0xFFCBD5E1)),
                              SizedBox(height: 12),
                              Text('Lessons coming soon', style: TextStyle(color: Color(0xFF64748B), fontWeight: FontWeight.w600)),
                            ],
                          ),
                        )
                      : ListView.separated(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          padding: EdgeInsets.zero,
                          itemCount: lessons.length,
                          separatorBuilder: (context, index) => const SizedBox(height: 12),
                          itemBuilder: (context, index) {
                            final lesson = lessons[index];
                            return Container(
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(color: const Color(0xFFF1F5F9), width: 1.5),
                              ),
                              child: ListTile(
                                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                leading: Container(
                                  width: 40,
                                  height: 40,
                                  decoration: BoxDecoration(color: const Color(0xFFF0FDFA), borderRadius: BorderRadius.circular(12)),
                                  child: Center(
                                    child: Text(
                                      '${index + 1}',
                                      style: const TextStyle(color: Color(0xFF0D9488), fontWeight: FontWeight.w800, fontSize: 14),
                                    ),
                                  ),
                                ),
                                title: Text(
                                  lesson['title'] ?? 'Lesson ${index + 1}',
                                  style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15, color: Color(0xFF0F172A)),
                                ),
                                subtitle: Padding(
                                  padding: const EdgeInsets.only(top: 4.0),
                                  child: Row(
                                    children: [
                                      Icon(
                                        lesson['videoUrl'] != null ? Icons.play_circle_fill_rounded : Icons.article_rounded,
                                        size: 14,
                                        color: const Color(0xFF94A3B8),
                                      ),
                                      const SizedBox(width: 6),
                                      Text(
                                        lesson['videoUrl'] != null ? 'Video Lesson' : 'Reading Material',
                                        style: const TextStyle(fontSize: 12, color: Color(0xFF64748B), fontWeight: FontWeight.w600),
                                      ),
                                    ],
                                  ),
                                ),
                                trailing: const Icon(Icons.lock_outline_rounded, size: 20, color: Color(0xFFCBD5E1)),
                              ),
                            );
                          },
                        ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}