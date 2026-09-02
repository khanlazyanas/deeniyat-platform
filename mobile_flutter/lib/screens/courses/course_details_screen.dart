import 'package:flutter/material.dart';
import 'dart:ui';
import 'package:razorpay_flutter/razorpay_flutter.dart';
import '../../services/course_service.dart';
import '../../services/lesson_service.dart';
import '../../services/enrollment_service.dart';
import '../../services/payment_service.dart';
import '../../utils/constants.dart';
import 'lesson_details_screen.dart';

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
    _razorpay.clear(); 
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
      final courseRes = await _courseService.getCourseById(widget.courseId);
      if (courseRes['success']) {
        courseData = courseRes['data'];
      } else {
        _showError(courseRes['message']);
        return;
      }

      final lessonRes = await _lessonService.getLessonsByCourse(widget.courseId);
      if (lessonRes['success']) {
        lessons = lessonRes['data'];
      }

      final enrollRes = await _enrollmentService.getMyEnrollments();
      if (enrollRes['success']) {
        List enrollments = enrollRes['data'] ?? [];
        for (var enrollment in enrollments) {
          final mappedCourseId = enrollment['courseId'] != null 
              ? (enrollment['courseId']['_id'] ?? enrollment['courseId']) 
              : enrollment['course'];
          if (mappedCourseId == widget.courseId) {
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

  Future<void> _startEnrollmentFlow() async {
    final price = courseData!['price'] ?? 0;
    setState(() => isProcessingPayment = true);

    if (price == 0) {
      // 🚀 NAYA MAGIC FIX: Free course ka bhi transaction backend ko bhejo
      await _paymentService.createTransaction({
        'amount': 0,
        'type': 'Course Fee',
        'courseId': widget.courseId,
        'status': 'Completed',
        'paymentId': 'FREE-${DateTime.now().millisecondsSinceEpoch}',
      });

      final result = await _enrollmentService.enrollStudent(widget.courseId);
      if (result['success']) {
        _showSuccess('Enrolled successfully! ✨ You can now access all lessons.');
        setState(() => isEnrolled = true);
      } else {
        _showError(result['message']);
      }
      setState(() => isProcessingPayment = false);
      return;
    }

    try {
      final orderRes = await _paymentService.createOrder(double.parse(price.toString()));
      if (!orderRes['success']) {
        _showError(orderRes['message']);
        setState(() => isProcessingPayment = false);
        return;
      }

      final orderId = orderRes['data']['order']['id'];
      var options = {
        'key': 'rzp_test_8YGiWeZrGctMwH', // Replace with your key
        'amount': (price * 100).toInt(),
        'name': 'Deeniyat Platform',
        'description': courseData!['title'],
        'order_id': orderId,
        'prefill': {'contact': '9999999999', 'email': 'user@example.com'},
        'theme': {'color': '#D4AF37'} 
      };

      _razorpay.open(options);
    } catch (e) {
      _showError('Error initializing payment.');
      setState(() => isProcessingPayment = false);
    }
  }

  void _handlePaymentSuccess(PaymentSuccessResponse response) async {
    try {
      final verifyRes = await _paymentService.verifyPayment({
        'razorpay_order_id': response.orderId,
        'razorpay_payment_id': response.paymentId,
        'razorpay_signature': response.signature,
      });

      if (verifyRes['success']) {
        await _paymentService.createTransaction({
          'amount': courseData!['price'],
          'type': 'Course Fee',
          'courseId': widget.courseId,
          'status': 'Completed',
          'paymentId': response.paymentId,
        });

        final enrollRes = await _enrollmentService.enrollStudent(widget.courseId);
        if (enrollRes['success']) {
          _showSuccess('Payment Successful! Course Unlocked permanently. 🎉');
          setState(() {
            isEnrolled = true;
            isProcessingPayment = false;
          });
        } else {
          _showError('Payment received, but enrollment failed. Please contact Admin.');
          setState(() => isProcessingPayment = false);
        }
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

  void _showError(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Row(children: [const Icon(Icons.error_outline_rounded, color: Colors.white, size: 20), const SizedBox(width: 10), Expanded(child: Text(message, style: const TextStyle(fontWeight: FontWeight.w600)))]),
      backgroundColor: const Color(0xFFE11D48),
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    ));
  }

  void _showSuccess(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Row(children: [const Icon(Icons.check_circle_outline_rounded, color: Colors.white, size: 20), const SizedBox(width: 10), Expanded(child: Text(message, style: const TextStyle(fontWeight: FontWeight.w600)))]),
      backgroundColor: const Color(0xFF064E3B), 
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    ));
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) return const Scaffold(backgroundColor: Color(0xFFF1F5F9), body: Center(child: CircularProgressIndicator(color: Color(0xFFD4AF37), strokeWidth: 3.0)));
    if (courseData == null) return const Scaffold(backgroundColor: Color(0xFFF1F5F9), body: Center(child: Text('Course not found', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold))));

    final teacherName = courseData!['teacherId'] != null ? courseData!['teacherId']['name'] : 'Eminent Scholar';
    final teacherAvatar = courseData!['teacherId'] != null ? (courseData!['teacherId']['profileImage'] ?? '') : '';
    final price = courseData!['price'] != null && courseData!['price'] > 0 ? '₹${courseData!['price']}' : 'Free';
    final level = courseData!['level'] ?? 'Beginner';
    final thumbnailUrl = courseData!['thumbnail'] ?? '';

    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
        decoration: BoxDecoration(
          color: Colors.white,
          border: const Border(top: BorderSide(color: Color(0xFFF1F5F9), width: 1.5)),
          boxShadow: [BoxShadow(color: const Color(0xFF064E3B).withOpacity(0.08), blurRadius: 30, offset: const Offset(0, -10))],
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
                    const Text('Total Investment', style: TextStyle(color: Color(0xFF64748B), fontSize: 13, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 4),
                    Text(price, style: TextStyle(fontSize: 26, fontWeight: FontWeight.w900, color: price == 'Free' ? const Color(0xFF10B981) : const Color(0xFF0F172A), letterSpacing: -0.5)),
                  ],
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                flex: 2,
                child: SizedBox(
                  height: 56,
                  child: ElevatedButton(
                    onPressed: isProcessingPayment 
                        ? null 
                        : (isEnrolled ? () => _showSuccess('Select a lecture from the curriculum below to start! 📖') : _startEnrollmentFlow),
                    style: ElevatedButton.styleFrom(
                      padding: EdgeInsets.zero,
                      elevation: 0,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                    child: Ink(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(colors: isEnrolled ? [const Color(0xFF0F172A), const Color(0xFF1E293B)] : [const Color(0xFFD4AF37), const Color(0xFFB48608)]),
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [BoxShadow(color: isEnrolled ? const Color(0xFF0F172A).withOpacity(0.2) : const Color(0xFFD4AF37).withOpacity(0.4), blurRadius: 15, offset: const Offset(0, 8))],
                      ),
                      child: Container(
                        alignment: Alignment.center,
                        child: isProcessingPayment
                            ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
                            : Text(isEnrolled ? 'Continue Learning' : 'Enroll Now', style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w900, letterSpacing: 0.5)),
                      ),
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
            expandedHeight: 320.0,
            floating: false,
            pinned: true,
            backgroundColor: const Color(0xFF064E3B),
            elevation: 0,
            leading: Padding(
              padding: const EdgeInsets.all(8.0),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: BackdropFilter(
                  filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                  child: Container(
                    decoration: BoxDecoration(color: Colors.black.withOpacity(0.4), borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.white.withOpacity(0.2))),
                    child: IconButton(icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20, color: Colors.white), onPressed: () => Navigator.pop(context)),
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
                      : Container(
                          decoration: const BoxDecoration(gradient: LinearGradient(colors: [Color(0xFF064E3B), Color(0xFF022C22)])),
                          child: const Icon(Icons.mosque_rounded, size: 100, color: Color(0xFFD4AF37)),
                        ),
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter, end: Alignment.bottomCenter, 
                        colors: [Colors.black.withOpacity(0.5), Colors.transparent, const Color(0xFFF1F5F9)], 
                        stops: const [0.0, 0.4, 1.0]
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(24, 0, 24, 40),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8), decoration: BoxDecoration(color: const Color(0xFFD4AF37).withOpacity(0.15), borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFD4AF37).withOpacity(0.4))), child: Text(level.toUpperCase(), style: const TextStyle(color: Color(0xFFB48608), fontSize: 11, fontWeight: FontWeight.w900, letterSpacing: 1.5))),
                      const SizedBox(width: 10),
                      Container(padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8), decoration: BoxDecoration(color: const Color(0xFF064E3B).withOpacity(0.1), borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFF064E3B).withOpacity(0.2))), child: Text('${lessons.length} MODULES', style: const TextStyle(color: Color(0xFF064E3B), fontSize: 11, fontWeight: FontWeight.w900, letterSpacing: 1.5))),
                    ],
                  ),
                  const SizedBox(height: 20),
                  Text(courseData!['title'] ?? 'Course Title', style: const TextStyle(fontSize: 34, fontWeight: FontWeight.w900, color: Color(0xFF0F172A), height: 1.2, letterSpacing: -1)),
                  const SizedBox(height: 32),
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: Colors.white, borderRadius: BorderRadius.circular(28), border: Border.all(color: const Color(0xFFD4AF37).withOpacity(0.3), width: 1.5),
                      boxShadow: [BoxShadow(color: const Color(0xFF064E3B).withOpacity(0.06), blurRadius: 30, offset: const Offset(0, 15))],
                    ),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(4),
                          decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: const Color(0xFFD4AF37), width: 2)),
                          child: CircleAvatar(radius: 28, backgroundColor: const Color(0xFF022C22), backgroundImage: teacherAvatar.isNotEmpty ? NetworkImage(getFullImageUrl(teacherAvatar)) : null, child: teacherAvatar.isEmpty ? const Icon(Icons.person_rounded, color: Color(0xFFD4AF37), size: 28) : null),
                        ),
                        const SizedBox(width: 16),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Course Instructor', style: TextStyle(color: Color(0xFF64748B), fontSize: 13, fontWeight: FontWeight.w600)),
                            const SizedBox(height: 4),
                            Text(teacherName, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: Color(0xFF0F172A))),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 48),
                  const Text('About this Course', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Color(0xFF0F172A), letterSpacing: -0.5)),
                  const SizedBox(height: 16),
                  Text(courseData!['description'] ?? 'No detailed description available.', style: const TextStyle(fontSize: 16, color: Color(0xFF475569), height: 1.7, fontWeight: FontWeight.w500)),
                  const SizedBox(height: 48),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Curriculum', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Color(0xFF0F172A), letterSpacing: -0.5)),
                      Text('${lessons.length} Items', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Color(0xFFB48608))),
                    ],
                  ),
                  const SizedBox(height: 24),
                  lessons.isEmpty
                      ? Container(
                          width: double.infinity, padding: const EdgeInsets.all(40),
                          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(28), border: Border.all(color: const Color(0xFFF1F5F9))),
                          child: const Column(children: [Icon(Icons.hourglass_empty_rounded, size: 48, color: Color(0xFFCBD5E1)), SizedBox(height: 16), Text('Lessons coming soon', style: TextStyle(color: Color(0xFF64748B), fontWeight: FontWeight.w600, fontSize: 16))]),
                        )
                      : ListView.separated(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          padding: EdgeInsets.zero,
                          itemCount: lessons.length,
                          separatorBuilder: (context, index) => const SizedBox(height: 16),
                          itemBuilder: (context, index) {
                            final lesson = lessons[index];
                            return GestureDetector(
                              onTap: isEnrolled 
                                  ? () {
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                          builder: (context) => LessonDetailsScreen(
                                            lessonId: lesson['_id'], 
                                            courseId: widget.courseId,
                                          ),
                                        ),
                                      );
                                    } 
                                  : () => _showError('Please enroll in the course to unlock this module. 🔒'),
                              child: Container(
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(24),
                                  border: Border.all(color: isEnrolled ? const Color(0xFFD4AF37).withOpacity(0.3) : const Color(0xFFF1F5F9), width: 1.5),
                                  boxShadow: [BoxShadow(color: const Color(0xFF0F172A).withOpacity(0.04), blurRadius: 15, offset: const Offset(0, 8))],
                                ),
                                child: ListTile(
                                  contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                                  leading: Container(
                                    width: 50, height: 50,
                                    decoration: BoxDecoration(color: isEnrolled ? const Color(0xFFD4AF37).withOpacity(0.1) : const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(16), border: Border.all(color: isEnrolled ? const Color(0xFFD4AF37).withOpacity(0.3) : const Color(0xFFF1F5F9))),
                                    child: Center(child: Text('${index + 1}', style: TextStyle(color: isEnrolled ? const Color(0xFFB48608) : const Color(0xFF94A3B8), fontWeight: FontWeight.w900, fontSize: 18))),
                                  ),
                                  title: Text(lesson['title'] ?? 'Module ${index + 1}', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: isEnrolled ? const Color(0xFF0F172A) : const Color(0xFF64748B))),
                                  subtitle: Padding(
                                    padding: const EdgeInsets.only(top: 8.0),
                                    child: Row(
                                      children: [
                                        Icon(lesson['videoUrl'] != null ? Icons.play_circle_fill_rounded : Icons.menu_book_rounded, size: 16, color: const Color(0xFF94A3B8)),
                                        const SizedBox(width: 8),
                                        Text(lesson['videoUrl'] != null ? 'Video Masterclass' : 'Reading Material', style: const TextStyle(fontSize: 13, color: Color(0xFF64748B), fontWeight: FontWeight.w600)),
                                      ],
                                    ),
                                  ),
                                  trailing: Icon(isEnrolled ? Icons.arrow_forward_ios_rounded : Icons.lock_rounded, size: 20, color: isEnrolled ? const Color(0xFFD4AF37) : const Color(0xFFCBD5E1)),
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