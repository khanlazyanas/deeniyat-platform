import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

import 'dart:convert';

import '../../utils/constants.dart';

import 'package:shared_preferences/shared_preferences.dart';

import '../auth/login_screen.dart'; // Logout hone par wapas yahan aayenge

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  bool isLoading = true;
  int enrolledCourses = 0;
  int pendingAssignments = 0;
  int attendanceRate = 0;
  List<dynamic> recentActivities = [];

  @override
  void initState() {
    super.initState();
    fetchDashboardStats();
  }

  Future<void> fetchDashboardStats() async {
    setState(() => isLoading = true);
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');

      if (token == null) {
        logout();
        return;
      }

      final response = await http.get(
        Uri.parse('${ApiConstants.baseUrl}/dashboard/stats'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token', // JWT token bhejna zaroori hai
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          enrolledCourses = data['enrolledCourses'] ?? 0;
          pendingAssignments = data['pendingAssignments'] ?? 0;
          attendanceRate = data['attendanceRate'] ?? 0;
          recentActivities = data['recentActivities'] ?? [];
        });
      } else {
        showError('Failed to fetch dashboard data');
      }
    } catch (e) {
      showError('Network error. Check connection.');
    } finally {
      setState(() => isLoading = false);
    }
  }

  void showError(String message) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(message),
          backgroundColor: Colors.redAccent,
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  Future<void> logout() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.remove('token'); // Token delete karein
    if (mounted) {
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (context) => const LoginScreen()),
        (route) => false, // Pichli saari screens hata dega
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: AppBar(
        title: const Text(
          'Dashboard',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        backgroundColor: Colors.teal,
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: logout,
            tooltip: 'Logout',
          ),
        ],
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator(color: Colors.teal))
          : RefreshIndicator(
              color: Colors.teal,
              onRefresh: fetchDashboardStats,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Overview',
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: Colors.black87,
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Stats Grid
                    GridView.count(
                      crossAxisCount: 2,
                      crossAxisSpacing: 15,
                      mainAxisSpacing: 15,
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      children: [
                        _buildStatCard(
                          'Courses',
                          enrolledCourses.toString(),
                          Icons.book,
                          Colors.blue,
                        ),
                        _buildStatCard(
                          'Pending',
                          pendingAssignments.toString(),
                          Icons.assignment_late,
                          Colors.orange,
                        ),
                        _buildStatCard(
                          'Attendance',
                          '$attendanceRate%',
                          Icons.fact_check,
                          Colors.green,
                        ),
                      ],
                    ),

                    const SizedBox(height: 30),
                    const Text(
                      'Recent Activity',
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: Colors.black87,
                      ),
                    ),
                    const SizedBox(height: 15),

                    // Activities List
                    recentActivities.isEmpty
                        ? const Center(
                            child: Padding(
                              padding: EdgeInsets.all(20.0),
                              child: Text(
                                'No recent activities.',
                                style: TextStyle(color: Colors.grey),
                              ),
                            ),
                          )
                        : ListView.builder(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: recentActivities.length,
                            itemBuilder: (context, index) {
                              final activity = recentActivities[index];
                              return Card(
                                margin: const EdgeInsets.only(bottom: 12),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                elevation: 0.5,
                                child: ListTile(
                                  leading: const CircleAvatar(
                                    backgroundColor: Color(0xFFE0F2F1),
                                    child: Icon(
                                      Icons.notifications_active,
                                      color: Colors.teal,
                                    ),
                                  ),
                                  title: Text(
                                    activity['title'] ?? 'Activity',
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  subtitle: Text(
                                    activity['description'] ?? 'No description',
                                  ),
                                  trailing: const Icon(
                                    Icons.arrow_forward_ios,
                                    size: 14,
                                    color: Colors.grey,
                                  ),
                                ),
                              );
                            },
                          ),
                  ],
                ),
              ),
            ),
    );
  }

  // Helper function UI cards banane ke liye
  Widget _buildStatCard(
    String title,
    String value,
    IconData icon,
    Color color,
  ) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(15),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            blurRadius: 10,
            spreadRadius: 2,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 40, color: color),
          const SizedBox(height: 10),
          Text(
            value,
            style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 5),
          Text(
            title,
            style: const TextStyle(
              color: Colors.grey,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}
