import 'package:flutter/material.dart';
import 'dart:ui';
import 'package:shared_preferences/shared_preferences.dart';
import '../../services/enrollment_service.dart';
import 'course_lessons_screen.dart'; 
import '../../../utils/constants.dart';

class MyCoursesScreen extends StatefulWidget {
  const MyCoursesScreen({super.key});

  @override
  State<MyCoursesScreen> createState() => _MyCoursesScreenState();
}

class _MyCoursesScreenState extends State<MyCoursesScreen> {
  final EnrollmentService _enrollmentService = EnrollmentService(); 
  bool isLoading = true;
  List<dynamic> myCourses = [];

  @override
  void initState() {
    super.initState();
    fetchMyCourses();
  }

  String getFullImageUrl(String url) {
    if (url.isEmpty) return "";
    String cleanUrl = url.replaceAll('\\', '/');
    if (cleanUrl.startsWith("http")) return cleanUrl;
    final baseUrl = ApiConstants.baseUrl.replaceAll('/api/v1/auth', '').replaceAll('/api/v1', '');
    String finalUrl = "$baseUrl/$cleanUrl";
    return finalUrl.replaceAll(RegExp(r'(?<!:)/+'), '/');
  }

  Future<void> fetchMyCourses() async {
    setState(() => isLoading = true);
    try {
      final enrollRes = await _enrollmentService.getMyEnrollments();
      
      setState(() {
        if (enrollRes['success'] == true && enrollRes['data'] != null) {
           myCourses = List.from(enrollRes['data']);
        } else if (enrollRes['enrollments'] != null) {
           myCourses = List.from(enrollRes['enrollments']);
        } else {
           myCourses = [];
        }
      });
    } catch (e) {
      showError('Network error. Please check connection.');
      debugPrint("Enrollment List Fetch Error: $e");
    } finally {
      if (mounted) setState(() => isLoading = false);
    }
  }

  void showError(String message) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.error_outline_rounded, color: Colors.white, size: 22),
              const SizedBox(width: 12),
              Expanded(child: Text(message, style: const TextStyle(fontWeight: FontWeight.w600))),
            ],
          ),
          backgroundColor: const Color(0xFFE11D48),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          margin: const EdgeInsets.all(20),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9), // Slate 100
      body: isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFFD4AF37), strokeWidth: 3.0))
          : RefreshIndicator(
              color: const Color(0xFFD4AF37),
              backgroundColor: const Color(0xFF022C22),
              onRefresh: fetchMyCourses,
              child: CustomScrollView(
                physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
                slivers: [
                  // 🌟 ULTRA PREMIUM SLIVER APP BAR
                  SliverAppBar(
                    expandedHeight: 180.0,
                    pinned: true,
                    elevation: 0,
                    backgroundColor: const Color(0xFF064E3B),
                    leading: Padding(
                      padding: const EdgeInsets.all(8.0),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: BackdropFilter(
                          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                          child: Container(
                            decoration: BoxDecoration(color: Colors.black.withOpacity(0.3), borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.white.withOpacity(0.2))),
                            child: IconButton(icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20, color: Colors.white), onPressed: () => Navigator.pop(context)),
                          ),
                        ),
                      ),
                    ),
                    flexibleSpace: FlexibleSpaceBar(
                      titlePadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                      title: const Text(
                        'My Enrolled Courses',
                        style: TextStyle(fontWeight: FontWeight.w900, color: Color(0xFFFDE047), fontSize: 20, letterSpacing: -0.5),
                      ),
                      background: Stack(
                        fit: StackFit.expand,
                        children: [
                          Container(
                            decoration: const BoxDecoration(
                              gradient: LinearGradient(colors: [Color(0xFF064E3B), Color(0xFF022C22), Color(0xFF0F172A)], begin: Alignment.topLeft, end: Alignment.bottomRight),
                            ),
                          ),
                          Opacity(
                            opacity: 0.05,
                            child: Image.network('https://www.transparenttextures.com/patterns/arabesque.png', fit: BoxFit.cover, repeat: ImageRepeat.repeat),
                          ),
                          Positioned(
                            top: -50, right: -30,
                            child: Container(
                              width: 180, height: 180,
                              decoration: BoxDecoration(shape: BoxShape.circle, color: const Color(0xFFD4AF37).withOpacity(0.15)),
                              child: BackdropFilter(filter: ImageFilter.blur(sigmaX: 50, sigmaY: 50), child: Container(color: Colors.transparent)),
                            ),
                          ),
                          Positioned(
                            bottom: -40, left: -40,
                            child: Container(
                              width: 150, height: 150,
                              decoration: BoxDecoration(shape: BoxShape.circle, color: const Color(0xFF10B981).withOpacity(0.15)),
                              child: BackdropFilter(filter: ImageFilter.blur(sigmaX: 40, sigmaY: 40), child: Container(color: Colors.transparent)),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  // 🌟 CONTENT LIST
                  if (myCourses.isEmpty)
                    SliverFillRemaining(
                      child: _buildEmptyState(),
                    )
                  else
                    SliverPadding(
                      padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 32.0),
                      sliver: SliverList(
                        delegate: SliverChildBuilderDelegate(
                          (context, index) {
                            final enrollment = myCourses[index];
                            final course = enrollment['courseId'] ?? enrollment['course'] ?? enrollment; 
                            
                            final teacherName = course['teacherId'] != null && course['teacherId']['name'] != null
                                ? course['teacherId']['name']
                                : 'Eminent Scholar';
                            final level = course['level'] ?? 'Beginner';
                            final thumbnail = course['thumbnail'] != null ? getFullImageUrl(course['thumbnail']) : null;

                            return Container(
                              margin: const EdgeInsets.only(bottom: 24),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(24),
                                border: Border.all(color: const Color(0xFFD4AF37).withOpacity(0.3), width: 1.5), 
                                boxShadow: [
                                  BoxShadow(color: const Color(0xFF064E3B).withOpacity(0.08), blurRadius: 24, offset: const Offset(0, 12)),
                                  BoxShadow(color: const Color(0xFFD4AF37).withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 4)),
                                ],
                              ),
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(24),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Stack(
                                      children: [
                                        Container(
                                          height: 180,
                                          width: double.infinity,
                                          decoration: BoxDecoration(
                                            color: const Color(0xFF022C22),
                                            image: thumbnail != null
                                                ? DecorationImage(image: NetworkImage(thumbnail), fit: BoxFit.cover)
                                                : const DecorationImage(image: NetworkImage('https://www.transparenttextures.com/patterns/black-scales.png'), opacity: 0.3, fit: BoxFit.cover),
                                          ),
                                          child: thumbnail == null 
                                              ? const Center(child: Icon(Icons.mosque_rounded, size: 60, color: Color(0xFFD4AF37)))
                                              : null,
                                        ),
                                        Positioned(
                                          top: 16, right: 16,
                                          child: ClipRRect(
                                            borderRadius: BorderRadius.circular(12),
                                            child: BackdropFilter(
                                              filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                                              child: Container(
                                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                                decoration: BoxDecoration(color: Colors.black.withOpacity(0.6), borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.white.withOpacity(0.2))),
                                                child: const Text('ENROLLED', style: TextStyle(color: Color(0xFFFDE047), fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1.5)),
                                              ),
                                            ),
                                          ),
                                        )
                                      ],
                                    ),

                                    Padding(
                                      padding: const EdgeInsets.all(24.0),
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            course['title'] ?? 'Islamic Studies',
                                            style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Color(0xFF0F172A), letterSpacing: -0.5),
                                            maxLines: 2,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                          const SizedBox(height: 16),
                                          
                                          Row(
                                            children: [
                                              Container(
                                                padding: const EdgeInsets.all(8),
                                                decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(10)),
                                                child: const Icon(Icons.person_outline_rounded, size: 18, color: Color(0xFF64748B)),
                                              ),
                                              const SizedBox(width: 12),
                                              Expanded(
                                                child: Column(
                                                  crossAxisAlignment: CrossAxisAlignment.start,
                                                  children: [
                                                    const Text('Instructor', style: TextStyle(fontSize: 11, color: Color(0xFF94A3B8), fontWeight: FontWeight.w600)),
                                                    Text(teacherName, style: const TextStyle(fontSize: 14, color: Color(0xFF0F172A), fontWeight: FontWeight.w800)),
                                                  ],
                                                ),
                                              ),
                                              Container(
                                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                                decoration: BoxDecoration(color: const Color(0xFFD4AF37).withOpacity(0.15), borderRadius: BorderRadius.circular(10), border: Border.all(color: const Color(0xFFD4AF37).withOpacity(0.3))),
                                                child: Text(level.toUpperCase(), style: const TextStyle(color: Color(0xFFB48608), fontSize: 11, fontWeight: FontWeight.w900, letterSpacing: 1)),
                                              ),
                                            ],
                                          ),
                                          const SizedBox(height: 32),
                                          
                                          SizedBox(
                                            width: double.infinity,
                                            height: 56,
                                            child: ElevatedButton(
                                              onPressed: () {
                                                Navigator.push(
                                                  context,
                                                  MaterialPageRoute(
                                                    builder: (context) => CourseLessonsScreen(
                                                      courseId: course['_id'],
                                                      courseTitle: course['title'] ?? 'Course Lessons',
                                                    ),
                                                  ),
                                                );
                                              },
                                              style: ElevatedButton.styleFrom(
                                                padding: EdgeInsets.zero,
                                                elevation: 0,
                                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                                              ),
                                              child: Ink(
                                                decoration: BoxDecoration(
                                                  gradient: const LinearGradient(colors: [Color(0xFF064E3B), Color(0xFF047857)]),
                                                  borderRadius: BorderRadius.circular(16),
                                                  boxShadow: [BoxShadow(color: const Color(0xFF064E3B).withOpacity(0.3), blurRadius: 15, offset: const Offset(0, 8))],
                                                ),
                                                child: Container(
                                                  alignment: Alignment.center,
                                                  child: const Row(
                                                    mainAxisAlignment: MainAxisAlignment.center,
                                                    children: [
                                                      Text('Resume Learning', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w900, letterSpacing: 0.5)),
                                                      SizedBox(width: 8),
                                                      Icon(Icons.arrow_forward_rounded, color: Colors.white, size: 20),
                                                    ],
                                                  ),
                                                ),
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            );
                          },
                          childCount: myCourses.length,
                        ),
                      ),
                    ),
                ],
              ),
            ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(28),
              decoration: BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
                border: Border.all(color: const Color(0xFFD4AF37).withOpacity(0.3), width: 2),
                boxShadow: [BoxShadow(color: const Color(0xFF064E3B).withOpacity(0.08), blurRadius: 30, offset: const Offset(0, 15))],
              ),
              child: const Icon(Icons.menu_book_rounded, size: 60, color: Color(0xFFD4AF37)),
            ),
            const SizedBox(height: 24),
            const Text('No Courses Yet', style: TextStyle(fontSize: 26, fontWeight: FontWeight.w900, color: Color(0xFF0F172A), letterSpacing: -0.5)),
            const SizedBox(height: 12),
            const Text('Your learning journey begins here. Explore our premium Islamic courses and enroll today.', style: TextStyle(color: Color(0xFF64748B), fontSize: 15, height: 1.5), textAlign: TextAlign.center),
            const SizedBox(height: 40),
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: () => Navigator.pop(context),
                style: ElevatedButton.styleFrom(
                  padding: EdgeInsets.zero,
                  elevation: 0,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                child: Ink(
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [Color(0xFFD4AF37), Color(0xFFB48608)]),
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [BoxShadow(color: const Color(0xFFD4AF37).withOpacity(0.4), blurRadius: 15, offset: const Offset(0, 8))],
                  ),
                  child: Container(
                    alignment: Alignment.center,
                    child: const Text('EXPLORE COURSES', style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w900, letterSpacing: 1.2)),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}