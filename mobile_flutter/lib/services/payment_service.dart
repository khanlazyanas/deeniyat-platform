import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../utils/constants.dart';

class PaymentService {
  // 👇 DHYAN DEIN: Agar backend mein route plural ('/payments') hai, toh isko update karna padega
static String get paymentUrl => '${ApiConstants.baseUrl}/payments';
static String get transactionUrl => '${ApiConstants.baseUrl}/transactions';

  Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  // Step 1: Create Order
  Future<Map<String, dynamic>> createOrder(double amount) async {
    try {
      final String url = '$paymentUrl/create-order';
      print("🚀 HITTING RAZORPAY API: $url");
      
      final response = await http.post(
        Uri.parse(url),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'amount': amount}),
      );

      // 👇 EXACT ERROR PRINT KAREGA
      print("🟢 RAZORPAY STATUS: ${response.statusCode}");
      print("📦 RAZORPAY RESPONSE: '${response.body}'");

      if (response.statusCode == 200) {
        return {'success': true, 'data': jsonDecode(response.body)};
      } else {
        // Asli error message return karega
        final errorData = jsonDecode(response.body);
        return {'success': false, 'message': errorData['message'] ?? 'Failed to create order (Status: ${response.statusCode})'};
      }
    } catch (e) {
      print("❌ RAZORPAY EXCEPTION: $e");
      return {'success': false, 'message': 'Network Error: $e'};
    }
  }

  // Step 2: Verify Signature
  Future<Map<String, dynamic>> verifyPayment(Map<String, dynamic> paymentData) async {
    try {
      final response = await http.post(
        Uri.parse('$paymentUrl/verify'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(paymentData),
      );
      if (response.statusCode == 200) return {'success': true};
      return {'success': false, 'message': 'Verification failed'};
    } catch (e) {
      return {'success': false, 'message': 'Network Error'};
    }
  }

  // Step 3: Record Transaction
  Future<Map<String, dynamic>> createTransaction(Map<String, dynamic> txnData) async {
    try {
      final token = await _getToken();
      final response = await http.post(
        Uri.parse(transactionUrl),
        headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer $token'},
        body: jsonEncode(txnData),
      );
      if (response.statusCode == 201) return {'success': true};
      return {'success': false, 'message': 'Failed to save transaction'};
    } catch (e) {
      return {'success': false, 'message': 'Network Error'};
    }
  }
}