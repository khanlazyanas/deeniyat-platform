import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:ui';
import '../../utils/constants.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../services/enrollment_service.dart'; 

import '../auth/login_screen.dart';
import '../courses/courses_screen.dart';
import '../courses/my-courses_screen.dart';
import '../submissions/my_submissions_screen.dart';
import '../profile/profile_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final EnrollmentService _enrollmentService = EnrollmentService(); 

  bool isLoading = true;
  String userName = "Anas Khan";
  String userAvatar = "";
  int enrolledCourses = 0; 
  int pendingAssignments = 0;
  int attendanceRate = 0;
  List<dynamic> recentActivities = [];

  @override
  void initState() {
    super.initState();
    _loadLocalUserData();
    _fetchAllData();
  }

  String _getGreeting() {
    var hour = DateTime.now().hour;
    if (hour < 12) return 'Assalamu Alaikum 🌅';
    if (hour < 17) return 'Good Afternoon ☀️';
    return 'Good Evening 🌙';
  }

  String getFullImageUrl(String url) {
    if (url.isEmpty) return "";
    String cleanUrl = url.replaceAll('\\', '/');
    if (cleanUrl.startsWith("http")) return cleanUrl;
    final baseUrl = ApiConstants.baseUrl.replaceAll('/api/v1/auth', '').replaceAll('/api/v1', '');
    String finalUrl = "$baseUrl/$cleanUrl";
    return finalUrl.replaceAll(RegExp(r'(?<!:)/+'), '/');
  }

  Future<void> _loadLocalUserData() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      userName = prefs.getString('userName') ?? 'Anas Khan';
      userAvatar = prefs.getString('userAvatar') ?? '';
    });
  }

  // 🚀 BULLETPROOF FETCH LOGIC
  Future<void> _fetchAllData() async {
    setState(() => isLoading = true);
    try {
      final prefs = await SharedPreferences.getInstance();
      final String? token = prefs.getString('token');

      if (token == null) {
        logout();
        return;
      }

      // 1. Enrollment count logic fix
      try {
        final enrollRes = await _enrollmentService.getMyEnrollments();
        if (enrollRes is List) {
          enrolledCourses = enrollRes.length;
        } else if (enrollRes is Map) {
          if (enrollRes.containsKey('data') && enrollRes['data'] is List) {
            enrolledCourses = (enrollRes['data'] as List).length;
          } else if (enrollRes.containsKey('enrollments') && enrollRes['enrollments'] is List) {
            enrolledCourses = (enrollRes['enrollments'] as List).length;
          } else if (enrollRes.containsKey('length')) {
            enrolledCourses = enrollRes['length'];
          }
        }
      } catch (e) {
        debugPrint("Enrollment fetch error: $e");
      }

      // 2. Fetch Other Stats
      final response = await http.get(
        Uri.parse('${ApiConstants.baseUrl}/dashboard/stats'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          if (enrolledCourses == 0 && data['enrolledCourses'] != null) {
            enrolledCourses = int.tryParse(data['enrolledCourses'].toString()) ?? 0;
          }
          pendingAssignments = data['pendingAssignments'] ?? 0;
          attendanceRate = data['attendanceRate'] ?? 0;
          recentActivities = data['recentActivities'] ?? [];
        });
      }
    } catch (e) {
      debugPrint("Stats API error: $e");
    } finally {
      if (mounted) setState(() => isLoading = false);
    }
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
    if (mounted) {
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (context) => const LoginScreen()),
        (route) => false,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9), 
      body: isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF0F766E), strokeWidth: 3.0))
          : RefreshIndicator(
              color: const Color(0xFFD4AF37), 
              backgroundColor: const Color(0xFF022C22),
              onRefresh: () async {
                await _loadLocalUserData();
                await _fetchAllData();
              },
              child: CustomScrollView(
                physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
                slivers: [
                  _buildPremiumSliverHeader(),
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(20, 24, 20, 40),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _buildExploreBanner(),
                          const SizedBox(height: 36),
                          _buildSectionTitle('Your Progress', 'Track your learning journey'),
                          const SizedBox(height: 16),
                          _buildStatsGrid(),
                          const SizedBox(height: 40),
                          _buildSectionTitle('Timeline', 'Recent updates & activities'),
                          const SizedBox(height: 20),
                          _buildActivitiesList(),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildPremiumSliverHeader() {
    return SliverAppBar(
      expandedHeight: 180,
      pinned: true,
      elevation: 0,
      backgroundColor: const Color(0xFF064E3B), 
      flexibleSpace: FlexibleSpaceBar(
        background: Stack(
          fit: StackFit.expand,
          children: [
            Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFF064E3B), Color(0xFF022C22), Color(0xFF0F172A)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
            ),
            Opacity(
              opacity: 0.05,
              child: Image.network(
                'https://www.transparenttextures.com/patterns/arabesque.png',
                fit: BoxFit.cover,
                repeat: ImageRepeat.repeat,
              ),
            ),
            Positioned(
              top: -50, right: -50,
              child: Container(
                width: 200, height: 200,
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
            SafeArea(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(24, 28, 24, 0),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                            decoration: BoxDecoration(
                              color: const Color(0xFFD4AF37).withOpacity(0.15),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: const Color(0xFFD4AF37).withOpacity(0.4)),
                            ),
                            child: Text(
                              _getGreeting(),
                              style: const TextStyle(color: Color(0xFFFDE047), fontSize: 13, fontWeight: FontWeight.w800, letterSpacing: 0.5),
                            ),
                          ),
                          const SizedBox(height: 12),
                          Text(
                            userName,
                            style: const TextStyle(color: Colors.white, fontSize: 30, fontWeight: FontWeight.w900, letterSpacing: -0.5),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                    GestureDetector(
                      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const ProfileScreen())).then((_) => _loadLocalUserData()),
                      child: Container(
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(color: const Color(0xFFD4AF37), width: 3), 
                          boxShadow: [BoxShadow(color: const Color(0xFFD4AF37).withOpacity(0.4), blurRadius: 25, offset: const Offset(0, 10))],
                        ),
                        child: CircleAvatar(
                          radius: 30,
                          backgroundColor: const Color(0xFF022C22),
                          backgroundImage: userAvatar.isNotEmpty ? NetworkImage(getFullImageUrl(userAvatar)) : null,
                          child: userAvatar.isEmpty
                              ? Text(userName.isNotEmpty ? userName[0].toUpperCase() : 'U', style: const TextStyle(color: Color(0xFFD4AF37), fontWeight: FontWeight.bold, fontSize: 26))
                              : null,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildExploreBanner() {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(28),
        gradient: const LinearGradient(
          colors: [Color(0xFF0F172A), Color(0xFF020617)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        border: Border.all(color: const Color(0xFF334155), width: 1.5),
        boxShadow: [
          BoxShadow(color: const Color(0xFF0F172A).withOpacity(0.3), blurRadius: 40, offset: const Offset(0, 20)),
          BoxShadow(color: const Color(0xFFD4AF37).withOpacity(0.1), blurRadius: 20, offset: const Offset(0, -5)),
        ],
        image: const DecorationImage(
          image: NetworkImage('https://www.transparenttextures.com/patterns/black-scales.png'), 
          opacity: 0.3,
          fit: BoxFit.cover,
        ),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(28),
          onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const CoursesScreen())),
          child: Stack(
            children: [
              Positioned(
                right: -20, bottom: -40,
                child: Icon(Icons.mosque_rounded, size: 160, color: const Color(0xFFD4AF37).withOpacity(0.05)), 
              ),
              Padding(
                padding: const EdgeInsets.all(28.0),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                            decoration: BoxDecoration(
                              color: const Color(0xFFD4AF37).withOpacity(0.2), 
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: const Color(0xFFD4AF37).withOpacity(0.5)),
                            ),
                            child: const Text('MASTER YOUR DEEN', style: TextStyle(color: Color(0xFFFDE047), fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1.5)),
                          ),
                          const SizedBox(height: 16),
                          const Text('Explore New Courses', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w800, letterSpacing: -0.5)),
                          const SizedBox(height: 8),
                          Text('Dive into comprehensive Islamic studies tailored perfectly for you.', style: TextStyle(color: Colors.white70, fontSize: 14, height: 1.5)),
                        ],
                      ),
                    ),
                    const SizedBox(width: 16),
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(colors: [Color(0xFFD4AF37), Color(0xFFB48608)]), 
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(color: const Color(0xFFD4AF37).withOpacity(0.5), blurRadius: 20, offset: const Offset(0, 10))
                        ],
                      ),
                      child: const Icon(Icons.arrow_forward_rounded, color: Colors.white, size: 28),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatsGrid() {
    return GridView.count(
      crossAxisCount: 2,
      crossAxisSpacing: 16,
      mainAxisSpacing: 16,
      shrinkWrap: true,
      childAspectRatio: 0.82,
      physics: const NeverScrollableScrollPhysics(),
      children: [
        _buildLuxuryStatCard(
          title: 'Courses',
          value: enrolledCourses.toString(),
          subtitle: 'Active enrollments',
          icon: Icons.menu_book_rounded,
          color: const Color(0xFF0EA5E9), 
          onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const MyCoursesScreen())),
        ),
        _buildLuxuryStatCard(
          title: 'Pending',
          value: pendingAssignments.toString(),
          subtitle: 'Assignments due',
          icon: Icons.assignment_late_rounded,
          color: const Color(0xFFF59E0B), 
          onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const MySubmissionsScreen())),
        ),
        _buildLuxuryStatCard(
          title: 'Attendance',
          value: '$attendanceRate%',
          subtitle: 'Overall presence',
          icon: Icons.verified_rounded,
          color: const Color(0xFF10B981), 
          progress: attendanceRate / 100,
        ),
        _buildLuxuryStatCard(
          title: 'Status',
          value: 'Active',
          subtitle: 'Account standing',
          icon: Icons.local_fire_department_rounded,
          color: const Color(0xFF8B5CF6), 
        ),
      ],
    );
  }

  Widget _buildLuxuryStatCard({
    required String title,
    required String value,
    required String subtitle,
    required IconData icon,
    required Color color,
    double? progress,
    VoidCallback? onTap,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: color.withOpacity(0.3), width: 1.5), 
        boxShadow: [
          BoxShadow(color: color.withOpacity(0.15), blurRadius: 30, offset: const Offset(0, 15)),
          BoxShadow(color: const Color(0xFF0F172A).withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 4)),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(28),
          onTap: onTap,
          child: Stack(
            children: [
              Positioned(
                right: -20, bottom: -20,
                child: Container(
                  width: 110, height: 110,
                  decoration: BoxDecoration(shape: BoxShape.circle, gradient: RadialGradient(colors: [color.withOpacity(0.15), Colors.transparent])),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            gradient: LinearGradient(colors: [color.withOpacity(0.2), color.withOpacity(0.05)], begin: Alignment.topLeft, end: Alignment.bottomRight),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: color.withOpacity(0.2)),
                          ),
                          child: Icon(icon, size: 26, color: color),
                        ),
                        if (onTap != null) Icon(Icons.arrow_outward_rounded, size: 20, color: const Color(0xFFCBD5E1)),
                      ],
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (progress != null) ...[
                          LinearProgressIndicator(value: progress, backgroundColor: const Color(0xFFF1F5F9), valueColor: AlwaysStoppedAnimation<Color>(color), borderRadius: BorderRadius.circular(10), minHeight: 6),
                          const SizedBox(height: 12),
                        ],
                        Text(value, style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: Color(0xFF0F172A), letterSpacing: -1)),
                        const SizedBox(height: 4),
                        Text(title, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Color(0xFF334155))),
                        Text(subtitle, style: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8), fontWeight: FontWeight.w600)),
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
  }

  Widget _buildActivitiesList() {
    if (recentActivities.isEmpty) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 24),
        decoration: BoxDecoration(
          color: Colors.white, 
          borderRadius: BorderRadius.circular(28), 
          border: Border.all(color: const Color(0xFFF1F5F9), width: 2), 
          boxShadow: [BoxShadow(color: const Color(0xFF0F172A).withOpacity(0.08), blurRadius: 30, offset: const Offset(0, 15))]
        ),
        child: Column(
          children: [
            Container(padding: const EdgeInsets.all(20), decoration: const BoxDecoration(color: Color(0xFFF1F5F9), shape: BoxShape.circle), child: const Icon(Icons.history_rounded, color: Color(0xFF94A3B8), size: 36)),
            const SizedBox(height: 16),
            const Text('No Recent Activity', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Color(0xFF0F172A))),
            const SizedBox(height: 8),
            const Text('Your learning timeline will automatically update here as you interact with courses.', style: TextStyle(fontSize: 14, color: Color(0xFF64748B), fontWeight: FontWeight.w500, height: 1.5), textAlign: TextAlign.center),
          ],
        ),
      );
    }

    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: recentActivities.length,
      itemBuilder: (context, index) {
        final activity = recentActivities[index];
        final isLast = index == recentActivities.length - 1;
        return Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Column(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(color: const Color(0xFFD4AF37).withOpacity(0.15), shape: BoxShape.circle, border: Border.all(color: const Color(0xFFD4AF37).withOpacity(0.5), width: 2)),
                  child: const Icon(Icons.auto_awesome_rounded, color: Color(0xFFB48608), size: 18),
                ),
                if (!isLast) Container(width: 2, height: 50, margin: const EdgeInsets.symmetric(vertical: 4), decoration: BoxDecoration(color: const Color(0xFFE2E8F0), borderRadius: BorderRadius.circular(2))),
              ],
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Container(
                margin: const EdgeInsets.only(bottom: 24),
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white, 
                  borderRadius: BorderRadius.circular(24), 
                  border: Border.all(color: const Color(0xFFF8FAFC), width: 2),
                  boxShadow: [BoxShadow(color: const Color(0xFF0F172A).withOpacity(0.06), blurRadius: 25, offset: const Offset(0, 12))]
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(activity['title'] ?? 'Activity Update', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: Color(0xFF0F172A), letterSpacing: -0.3)),
                    const SizedBox(height: 6),
                    Text(activity['description'] ?? 'No details provided', style: const TextStyle(fontSize: 14, color: Color(0xFF64748B), fontWeight: FontWeight.w500, height: 1.4)),
                  ],
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildSectionTitle(String title, String subtitle) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Color(0xFF0F172A), letterSpacing: -0.5)),
        const SizedBox(height: 4),
        Text(subtitle, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xFF64748B))),
      ],
    );
  }
}