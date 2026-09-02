import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:ui';

import '../../utils/constants.dart';
import 'course_details_screen.dart'; 

class CoursesScreen extends StatefulWidget {
  const CoursesScreen({super.key});

  @override
  State<CoursesScreen> createState() => _CoursesScreenState();
}

class _CoursesScreenState extends State<CoursesScreen> {
  bool isLoading = true;
  List<dynamic> courses = [];

  @override
  void initState() {
    super.initState();
    fetchCourses();
  }

  String getFullImageUrl(String url) {
    if (url.isEmpty) return "";
    String cleanUrl = url.replaceAll('\\', '/');
    if (cleanUrl.startsWith("http")) return cleanUrl;
    final baseUrl = ApiConstants.baseUrl.replaceAll('/api/v1/auth', '').replaceAll('/api/v1', '');
    String finalUrl = "$baseUrl/$cleanUrl";
    return finalUrl.replaceAll(RegExp(r'(?<!:)/+'), '/');
  }

  Future<void> fetchCourses() async {
    setState(() => isLoading = true);
    try {
      final response = await http.get(
        Uri.parse('${ApiConstants.baseUrl}/courses'),
      );

      if (response.statusCode == 200) {
        setState(() {
          courses = jsonDecode(response.body);
        });
      } else {
        _showPremiumSnackBar('Failed to load courses', isError: true);
      }
    } catch (e) {
      _showPremiumSnackBar('Network error. Please check connection.', isError: true);
    } finally {
      if (mounted) setState(() => isLoading = false);
    }
  }

  void _showPremiumSnackBar(String message, {bool isError = false}) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(isError ? Icons.error_outline_rounded : Icons.check_circle_outline_rounded, color: Colors.white, size: 22),
            const SizedBox(width: 12),
            Expanded(child: Text(message, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14))),
          ],
        ),
        backgroundColor: isError ? const Color(0xFFE11D48) : const Color(0xFF064E3B),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        margin: const EdgeInsets.all(20),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      ),
    );
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
              onRefresh: fetchCourses,
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
                        'Explore Courses',
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

                  // 🌟 COURSE LIST CONTENT
                  if (courses.isEmpty)
                    SliverFillRemaining(
                      child: Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              padding: const EdgeInsets.all(24),
                              decoration: BoxDecoration(
                                color: Colors.white, shape: BoxShape.circle,
                                border: Border.all(color: const Color(0xFFD4AF37).withOpacity(0.3), width: 2),
                                boxShadow: [BoxShadow(color: const Color(0xFF064E3B).withOpacity(0.08), blurRadius: 30, offset: const Offset(0, 15))],
                              ),
                              child: const Icon(Icons.school_rounded, size: 60, color: Color(0xFFD4AF37)),
                            ),
                            const SizedBox(height: 24),
                            const Text('No Courses Available', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Color(0xFF0F172A), letterSpacing: -0.5)),
                            const SizedBox(height: 12),
                            const Text('New premium courses are being added.\nPlease check back later.', textAlign: TextAlign.center, style: TextStyle(color: Color(0xFF64748B), fontSize: 15, height: 1.5)),
                          ],
                        ),
                      ),
                    )
                  else
                    SliverPadding(
                      padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 32.0),
                      sliver: SliverList(
                        delegate: SliverChildBuilderDelegate(
                          (context, index) {
                            final course = courses[index];
                            final teacherName = course['teacherId'] != null ? course['teacherId']['name'] : 'Eminent Scholar';
                            final price = course['price'] != null && course['price'] > 0 ? '₹${course['price']}' : 'Free';
                            final level = course['level'] ?? 'Beginner';
                            final thumbnailUrl = course['thumbnail'] != null ? getFullImageUrl(course['thumbnail']) : null;

                            return Container(
                              margin: const EdgeInsets.only(bottom: 24),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(24),
                                border: Border.all(color: const Color(0xFFD4AF37).withOpacity(0.3), width: 1.5),
                                boxShadow: [
                                  BoxShadow(color: const Color(0xFF064E3B).withOpacity(0.06), blurRadius: 24, offset: const Offset(0, 12)),
                                  BoxShadow(color: const Color(0xFFD4AF37).withOpacity(0.03), blurRadius: 10, offset: const Offset(0, 4)),
                                ],
                              ),
                              child: Material(
                                color: Colors.transparent,
                                child: InkWell(
                                  borderRadius: BorderRadius.circular(24),
                                  onTap: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(builder: (context) => CourseDetailsScreen(courseId: course['_id'])),
                                    );
                                  },
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      // 🖼️ Image Header
                                      Stack(
                                        children: [
                                          Container(
                                            height: 180, width: double.infinity,
                                            decoration: BoxDecoration(
                                              color: const Color(0xFF022C22),
                                              borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
                                              image: thumbnailUrl != null
                                                  ? DecorationImage(image: NetworkImage(thumbnailUrl), fit: BoxFit.cover)
                                                  : const DecorationImage(image: NetworkImage('https://www.transparenttextures.com/patterns/black-scales.png'), opacity: 0.3, fit: BoxFit.cover),
                                            ),
                                            child: thumbnailUrl == null ? const Center(child: Icon(Icons.mosque_rounded, size: 60, color: Color(0xFFD4AF37))) : null,
                                          ),
                                          Positioned(
                                            top: 16, right: 16,
                                            child: ClipRRect(
                                              borderRadius: BorderRadius.circular(12),
                                              child: BackdropFilter(
                                                filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                                                child: Container(
                                                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                                  decoration: BoxDecoration(color: price == 'Free' ? const Color(0xFF10B981).withOpacity(0.9) : Colors.black.withOpacity(0.6), borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.white.withOpacity(0.2))),
                                                  child: Text(price, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w900, letterSpacing: 1)),
                                                ),
                                              ),
                                            ),
                                          )
                                        ],
                                      ),
                                      
                                      // 📝 Details Body
                                      Padding(
                                        padding: const EdgeInsets.all(20.0),
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              course['title'] ?? 'Islamic Studies',
                                              style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Color(0xFF0F172A), letterSpacing: -0.5),
                                              maxLines: 1, overflow: TextOverflow.ellipsis,
                                            ),
                                            const SizedBox(height: 8),
                                            Text(
                                              course['description'] ?? 'Explore the depths of Islamic knowledge with this comprehensive course.',
                                              style: const TextStyle(color: Color(0xFF64748B), height: 1.4, fontSize: 14, fontWeight: FontWeight.w500),
                                              maxLines: 2, overflow: TextOverflow.ellipsis,
                                            ),
                                            const SizedBox(height: 20),
                                            
                                            // Bottom Row: Ustad & Level
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
                                                      Text(teacherName, style: const TextStyle(fontSize: 14, color: Color(0xFF0F172A), fontWeight: FontWeight.w800), maxLines: 1, overflow: TextOverflow.ellipsis),
                                                    ],
                                                  ),
                                                ),
                                                Container(
                                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                                  decoration: BoxDecoration(color: const Color(0xFFD4AF37).withOpacity(0.15), borderRadius: BorderRadius.circular(10), border: Border.all(color: const Color(0xFFD4AF37).withOpacity(0.3))),
                                                  child: Text(level.toUpperCase(), style: const TextStyle(color: Color(0xFFB48608), fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1)),
                                                ),
                                              ],
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            );
                          },
                          childCount: courses.length,
                        ),
                      ),
                    ),
                ],
              ),
            ),
    );
  }
}