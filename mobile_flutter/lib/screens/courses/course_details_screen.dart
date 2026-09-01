import 'package:flutter/material.dart';
import 'dart:ui';
import 'package:razorpay_flutter/razorpay_flutter.dart';
import '../../services/course_service.dart';
import '../../services/lesson_service.dart';
import '../../services/enrollment_service.dart';
import '../../services/payment_service.dart';
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
  final EnrollmentService _enrollmentService = EnrollmentService();
  final PaymentService _paymentService = PaymentService();
  
  late Razorpay _razorpay;

  bool isLoading = true;
  bool isProcessingPayment = false;
  bool isEnrolled = false; 

  Map<String, dynamic>? courseData;
  List<dynamic> lessons = [];

  @override
  void initState() {
    super.initState();
    _initializeRazorpay();
    _fetchCourseAndLessons();
  }

  @override
  void dispose() {
    _razorpay.clear(); // 👈 Razorpay memory clear
    super.dispose();
  }

  void _initializeRazorpay() {
    _razorpay = Razorpay();
    _razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, _handlePaymentSuccess);
    _razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, _handlePaymentError);
    _razorpay.on(Razorpay.EVENT_EXTERNAL_WALLET, _handleExternalWallet);
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
      // 1. Fetch Course
      final courseRes = await _courseService.getCourseById(widget.courseId);
      if (courseRes['success']) {
        courseData = courseRes['data'];
      } else {
        _showError(courseRes['message']);
        return;
      }

      // 2. Fetch Lessons
      final lessonRes = await _lessonService.getLessonsByCourse(widget.courseId);
      if (lessonRes['success']) {
        lessons = lessonRes['data'];
      }

      // 3. Check Enrollment Status 👈 MAGIC LOGIC
      final enrollRes = await _enrollmentService.getMyEnrollments();
      if (enrollRes['success']) {
        List enrollments = enrollRes['data'];
        for (var enrollment in enrollments) {
          // Compare course IDs
          if (enrollment['courseId']['_id'] == widget.courseId || enrollment['courseId'] == widget.courseId) {
            isEnrolled = true;
            break;
          }
        }
      }
    } catch (e) {
      _showError('Network error. Check connection.');
    } finally {
      if (mounted) setState(() => isLoading = false);
    }
  }

  // ================= ENROLLMENT & PAYMENT LOGIC =================

  Future<void> _startEnrollmentFlow() async {
    final price = courseData!['price'] ?? 0;

    setState(() => isProcessingPayment = true);

    // Flow 1: FREE COURSE (Direct Enrollment)
    if (price == 0) {
      final result = await _enrollmentService.enrollStudent(widget.courseId);
      if (result['success']) {
        _showSuccess('Enrolled successfully! You can now access all lessons.');
        setState(() => isEnrolled = true);
      } else {
        _showError(result['message']);
      }
      setState(() => isProcessingPayment = false);
      return;
    }

    // Flow 2: PAID COURSE (Razorpay Engine)
    try {
      final orderRes = await _paymentService.createOrder(double.parse(price.toString()));
      if (!orderRes['success']) {
        _showError(orderRes['message']);
        setState(() => isProcessingPayment = false);
        return;
      }

      final orderId = orderRes['data']['order']['id'];
      
      // Open Razorpay Checkout
      var options = {
        'key': 'rzp_test_8YGiWeZrGctMwH', // TODO: Yahan apni public key dalein
        'amount': (price * 100).toInt(),
        'name': 'Deeniyat Platform',
        'description': courseData!['title'],
        'order_id': orderId,
        'prefill': {
          'contact': '9999999999',
          'email': 'user@example.com'
        },
        'theme': {'color': '#0F766E'}
      };

      _razorpay.open(options);
    } catch (e) {
      _showError('Error initializing payment.');
      setState(() => isProcessingPayment = false);
    }
  }

  // Razorpay Callbacks
  void _handlePaymentSuccess(PaymentSuccessResponse response) async {
    try {
      // 1. Verify Signature
      final verifyRes = await _paymentService.verifyPayment({
        'razorpay_order_id': response.orderId,
        'razorpay_payment_id': response.paymentId,
        'razorpay_signature': response.signature,
      });

      if (verifyRes['success']) {
        // 2. Create Transaction (Backend unlock karega)
        await _paymentService.createTransaction({
          'amount': courseData!['price'],
          'type': 'Course Fee',
          'courseId': widget.courseId,
          'status': 'Completed',
          'paymentId': response.paymentId,
        });

        _showSuccess('Payment Successful! Course Unlocked. 🎉');
        setState(() {
          isEnrolled = true;
          isProcessingPayment = false;
        });
      } else {
        _showError('Payment Verification Failed!');
        setState(() => isProcessingPayment = false);
      }
    } catch (e) {
      _showError('Server update failed after payment.');
      setState(() => isProcessingPayment = false);
    }
  }

  void _handlePaymentError(PaymentFailureResponse response) {
    _showError("Payment Failed: ${response.message}");
    setState(() => isProcessingPayment = false);
  }

  void _handleExternalWallet(ExternalWalletResponse response) {
    _showError("External wallets are not supported yet.");
    setState(() => isProcessingPayment = false);
  }

  // ================= UI HELPERS =================

  void _showError(String message) {
    if (!mounted) return;
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
      ),
    );
  }

  void _showSuccess(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.check_circle_outline_rounded, color: Colors.white, size: 20),
            const SizedBox(width: 10),
            Expanded(child: Text(message, style: const TextStyle(fontWeight: FontWeight.w500))),
          ],
        ),
        backgroundColor: const Color(0xFF10B981), // Emerald Success
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
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
      return const Scaffold(
        backgroundColor: Color(0xFFF8FAFC),
        body: Center(child: Text('Course not found', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold))),
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
          boxShadow: [BoxShadow(color: const Color(0xFF0F172A).withOpacity(0.05), blurRadius: 20, offset: const Offset(0, -10))],
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
                    // 👇 Button logic changes dynamically based on Enrollment Status
                    onPressed: isProcessingPayment 
                        ? null 
                        : (isEnrolled ? () {/* TODO: Navigate to active player */} : _startEnrollmentFlow),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: isEnrolled ? const Color(0xFF3B82F6) : const Color(0xFF0F766E), // Blue if enrolled, Teal if not
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                    child: isProcessingPayment
                        ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
                        : Text(
                            isEnrolled ? 'Continue Learning' : 'Enroll Now', 
                            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, letterSpacing: 0.5)
                          ),
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
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(24, 10, 24, 40),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
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
                  Text(
                    courseData!['title'] ?? 'Course Title',
                    style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: Color(0xFF0F172A), height: 1.2, letterSpacing: -0.5),
                  ),
                  const SizedBox(height: 24),
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
                  const Text('About this Course', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: Color(0xFF0F172A), letterSpacing: -0.5)),
                  const SizedBox(height: 12),
                  Text(
                    courseData!['description'] ?? 'No detailed description available for this course.',
                    style: const TextStyle(fontSize: 15, color: Color(0xFF475569), height: 1.6, fontWeight: FontWeight.w500),
                  ),
                  const SizedBox(height: 40),
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
                            return GestureDetector(
                              onTap: isEnrolled 
                                  ? () {/* TODO: Navigate to Lesson Video Player */} 
                                  : () => _showError('Please enroll to view this lesson.'),
                              child: Container(
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(color: isEnrolled ? const Color(0xFFE2E8F0) : const Color(0xFFF1F5F9), width: 1.5),
                                ),
                                child: ListTile(
                                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                  leading: Container(
                                    width: 40,
                                    height: 40,
                                    decoration: BoxDecoration(
                                      color: isEnrolled ? const Color(0xFFF0FDFA) : const Color(0xFFF1F5F9), 
                                      borderRadius: BorderRadius.circular(12)
                                    ),
                                    child: Center(
                                      child: Text(
                                        '${index + 1}',
                                        style: TextStyle(
                                          color: isEnrolled ? const Color(0xFF0D9488) : const Color(0xFF94A3B8), 
                                          fontWeight: FontWeight.w800, fontSize: 14
                                        ),
                                      ),
                                    ),
                                  ),
                                  title: Text(
                                    lesson['title'] ?? 'Lesson ${index + 1}',
                                    style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15, color: isEnrolled ? const Color(0xFF0F172A) : const Color(0xFF64748B)),
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
                                  // 👇 ICON MAGIC: Enrolled hai toh Play Icon, nahi toh Lock 🔒
                                  trailing: Icon(
                                    isEnrolled ? Icons.play_arrow_rounded : Icons.lock_outline_rounded, 
                                    size: 22, 
                                    color: isEnrolled ? const Color(0xFF0F766E) : const Color(0xFFCBD5E1)
                                  ),
                                ),
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