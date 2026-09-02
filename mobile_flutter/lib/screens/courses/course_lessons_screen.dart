import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:ui';
import 'package:shared_preferences/shared_preferences.dart';
import '../../utils/constants.dart';
import 'lesson_details_screen.dart'; 

class CourseLessonsScreen extends StatefulWidget {
  final String courseId;
  final String courseTitle;

  const CourseLessonsScreen({
    super.key,
    required this.courseId,
    required this.courseTitle,
  });

  @override
  State<CourseLessonsScreen> createState() => _CourseLessonsScreenState();
}

class _CourseLessonsScreenState extends State<CourseLessonsScreen> {
  bool isLoading = true;
  List<dynamic> lessons = [];

  @override
  void initState() {
    super.initState();
    fetchLessons();
  }

  Future<void> fetchLessons() async {
    setState(() => isLoading = true);
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');

      if (token == null) return;

      final response = await http.get(
        Uri.parse('${ApiConstants.baseUrl}/lessons/course/${widget.courseId}'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        setState(() {
          lessons = jsonDecode(response.body);
        });
      } else {
        _showPremiumSnackBar('Failed to load lessons', isError: true);
      }
    } catch (e) {
      _showPremiumSnackBar('Network error. Check connection.', isError: true);
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
      backgroundColor: const Color(0xFFF1F5F9), // Premium Slate background
      body: isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFFD4AF37), strokeWidth: 3.0))
          : RefreshIndicator(
              color: const Color(0xFFD4AF37),
              backgroundColor: const Color(0xFF022C22),
              onRefresh: fetchLessons,
              child: CustomScrollView(
                physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
                slivers: [
                  // 🌟 ULTRA PREMIUM SLIVER APP BAR
                  SliverAppBar(
                    expandedHeight: 220.0,
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
                      title: Text(
                        widget.courseTitle,
                        style: const TextStyle(fontWeight: FontWeight.w900, color: Colors.white, fontSize: 18, letterSpacing: -0.5),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
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

                  // 🌟 CONTENT / LESSONS LIST
                  if (lessons.isEmpty)
                    SliverFillRemaining(
                      child: Container(
                        height: MediaQuery.of(context).size.height * 0.6,
                        alignment: Alignment.center,
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
                              child: const Icon(Icons.menu_book_rounded, size: 60, color: Color(0xFFD4AF37)),
                            ),
                            const SizedBox(height: 24),
                            const Text('No Modules Unlocked', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Color(0xFF0F172A), letterSpacing: -0.5)),
                            const SizedBox(height: 12),
                            const Padding(
                              padding: EdgeInsets.symmetric(horizontal: 40),
                              child: Text('Curriculum for this course is being updated. Please check back later.', textAlign: TextAlign.center, style: TextStyle(color: Color(0xFF64748B), fontSize: 15, height: 1.5)),
                            ),
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
                            final lesson = lessons[index];
                            final bool hasVideo = lesson['videoUrl'] != null && lesson['videoUrl'].toString().isNotEmpty;
                            final bool hasPdf = lesson['pdfUrl'] != null && lesson['pdfUrl'].toString().isNotEmpty;
                            final bool hasAudio = lesson['audioUrl'] != null && lesson['audioUrl'].toString().isNotEmpty;

                            return Padding(
                              padding: const EdgeInsets.only(bottom: 20.0),
                              child: Container(
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(24),
                                  border: Border.all(color: const Color(0xFFD4AF37).withOpacity(0.3), width: 1.5),
                                  boxShadow: [BoxShadow(color: const Color(0xFF064E3B).withOpacity(0.06), blurRadius: 24, offset: const Offset(0, 12))],
                                ),
                                child: Material(
                                  color: Colors.transparent,
                                  child: InkWell(
                                    borderRadius: BorderRadius.circular(24),
                                    onTap: () {
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                          builder: (context) => LessonDetailsScreen(
                                            lessonId: lesson['_id'],
                                            courseId: widget.courseId,
                                          ),
                                        ),
                                      );
                                    },
                                    child: Padding(
                                      padding: const EdgeInsets.all(20.0),
                                      child: Row(
                                        crossAxisAlignment: CrossAxisAlignment.center,
                                        children: [
                                          // 🌟 Premium Gold Avatar
                                          Container(
                                            height: 60, width: 60,
                                            decoration: BoxDecoration(
                                              gradient: const LinearGradient(colors: [Color(0xFFD4AF37), Color(0xFFB48608)]),
                                              borderRadius: BorderRadius.circular(18),
                                              boxShadow: [BoxShadow(color: const Color(0xFFD4AF37).withOpacity(0.4), blurRadius: 15, offset: const Offset(0, 8))],
                                            ),
                                            child: Center(
                                              child: Text(
                                                '${lesson['order'] ?? index + 1}',
                                                style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Colors.white),
                                              ),
                                            ),
                                          ),
                                          const SizedBox(width: 20),
                                          
                                          // 📝 Content
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                Text(
                                                  lesson['title'] ?? 'Untitled Lesson',
                                                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF0F172A), letterSpacing: -0.5),
                                                  maxLines: 2, overflow: TextOverflow.ellipsis,
                                                ),
                                                const SizedBox(height: 12),
                                                Wrap(
                                                  spacing: 8, runSpacing: 8,
                                                  children: [
                                                    if (hasVideo) _buildTag(Icons.play_circle_fill_rounded, 'Video', const Color(0xFFE11D48), const Color(0xFFFFF1F2)),
                                                    if (hasPdf) _buildTag(Icons.picture_as_pdf_rounded, 'PDF', const Color(0xFFD97706), const Color(0xFFFFFBEB)),
                                                    if (hasAudio) _buildTag(Icons.audiotrack_rounded, 'Audio', const Color(0xFF7C3AED), const Color(0xFFF5F3FF)),
                                                    if (!hasVideo && !hasPdf && !hasAudio) _buildTag(Icons.article_rounded, 'Reading', const Color(0xFF0F766E), const Color(0xFFCCFBF1)),
                                                  ],
                                                )
                                              ],
                                            ),
                                          ),
                                          
                                          // 👉 Right Arrow
                                          const Padding(
                                            padding: EdgeInsets.only(left: 12.0),
                                            child: Icon(Icons.arrow_forward_ios_rounded, size: 20, color: Color(0xFFD4AF37)),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            );
                          },
                          childCount: lessons.length,
                        ),
                      ),
                    ),
                ],
              ),
            ),
    );
  }

  Widget _buildTag(IconData icon, String label, Color textColor, Color bgColor) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(color: bgColor, borderRadius: BorderRadius.circular(8), border: Border.all(color: textColor.withOpacity(0.2))),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: textColor),
          const SizedBox(width: 6),
          Text(label, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: textColor, letterSpacing: 0.5)),
        ],
      ),
    );
  }
}