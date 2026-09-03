import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:ui';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import '../../../utils/constants.dart';

class TransactionHistoryScreen extends StatefulWidget {
  const TransactionHistoryScreen({super.key});

  @override
  State<TransactionHistoryScreen> createState() => _TransactionHistoryScreenState();
}

class _TransactionHistoryScreenState extends State<TransactionHistoryScreen> {
  bool isLoading = true;
  List<dynamic> transactions = [];
  String? downloadingTxnId; 

  @override
  void initState() {
    super.initState();
    fetchTransactions();
  }

  Future<void> fetchTransactions() async {
    setState(() => isLoading = true);
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');

      if (token == null) return;

      final response = await http.get(
        Uri.parse('${ApiConstants.baseUrl}/transactions/my-transactions'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        setState(() {
          transactions = jsonDecode(response.body);
        });
      } else {
        _showPremiumSnackBar('Failed to load transactions', isError: true);
      }
    } catch (e) {
      _showPremiumSnackBar('Network error. Please check connection.', isError: true);
    } finally {
      if (mounted) setState(() => isLoading = false);
    }
  }

  // 🚀 Premium PDF Download Receipt
  Future<void> downloadReceipt(Map<String, dynamic> txn) async {
    final txnId = txn['transactionId'] ?? 'TXN-UNKNOWN';
    setState(() => downloadingTxnId = txnId);
    
    try {
      final pdf = pw.Document();
      final title = txn['courseId'] != null ? txn['courseId']['title'] : (txn['type'] ?? 'Course Fee');
      final amount = txn['amount']?.toString() ?? '0';
      final date = txn['createdAt'] != null ? formatDate(txn['createdAt']) : 'Unknown Date';
      final status = txn['status'] ?? 'Pending';
      
      final prefs = await SharedPreferences.getInstance();
      final userName = prefs.getString('userName') ?? 'Valued Student';
      final userEmail = prefs.getString('userEmail') ?? '';

      // Create PDF Design
      pdf.addPage(
        pw.Page(
          pageFormat: PdfPageFormat.a4,
          build: (pw.Context context) {
            return pw.Container(
              padding: const pw.EdgeInsets.all(40),
              decoration: pw.BoxDecoration(
                border: pw.Border.all(color: const PdfColor(0.83, 0.69, 0.22), width: 2), // Gold Border
              ),
              child: pw.Column(
                crossAxisAlignment: pw.CrossAxisAlignment.start,
                children: [
                  // Header
                  pw.Row(
                    mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                    children: [
                      pw.Column(
                        crossAxisAlignment: pw.CrossAxisAlignment.start,
                        children: [
                          pw.Text('DEENIYAT PLATFORM', style: pw.TextStyle(fontSize: 28, fontWeight: pw.FontWeight.bold, color: const PdfColor(0.02, 0.31, 0.23))), // Deep Emerald
                          pw.SizedBox(height: 5),
                          pw.Text('Official Payment Receipt', style: pw.TextStyle(fontSize: 14, color: const PdfColor(0.5, 0.5, 0.5))),
                        ],
                      ),
                      pw.Container(
                        padding: const pw.EdgeInsets.symmetric(horizontal: 15, vertical: 8),
                        decoration: pw.BoxDecoration(
                          color: const PdfColor(0.83, 0.69, 0.22), // Gold
                          borderRadius: const pw.BorderRadius.all(pw.Radius.circular(10)),
                        ),
                        child: pw.Text('RECEIPT', style: pw.TextStyle(color: PdfColors.white, fontWeight: pw.FontWeight.bold, letterSpacing: 2)),
                      ),
                    ],
                  ),
                  pw.SizedBox(height: 50),

                  // Customer Details
                  pw.Text('BILLED TO:', style: pw.TextStyle(fontSize: 12, fontWeight: pw.FontWeight.bold, color: const PdfColor(0.4, 0.4, 0.4))),
                  pw.SizedBox(height: 5),
                  pw.Text(userName, style: pw.TextStyle(fontSize: 18, fontWeight: pw.FontWeight.bold)),
                  if (userEmail.isNotEmpty) pw.Text(userEmail, style: pw.TextStyle(fontSize: 14, color: const PdfColor(0.3, 0.3, 0.3))),
                  pw.SizedBox(height: 40),

                  // Transaction Details Box
                  pw.Container(
                    padding: const pw.EdgeInsets.all(20),
                    decoration: pw.BoxDecoration(
                      color: const PdfColor(0.95, 0.96, 0.98), // Slate 100
                      borderRadius: const pw.BorderRadius.all(pw.Radius.circular(15)),
                    ),
                    child: pw.Column(
                      children: [
                        _buildPdfRow('Transaction ID', '#$txnId'),
                        pw.Divider(color: const PdfColor(0.8, 0.8, 0.8)),
                        _buildPdfRow('Date of Payment', date),
                        pw.Divider(color: const PdfColor(0.8, 0.8, 0.8)),
                        _buildPdfRow('Payment Status', status.toUpperCase()),
                        pw.Divider(color: const PdfColor(0.8, 0.8, 0.8)),
                        _buildPdfRow('Course / Item', title),
                      ],
                    ),
                  ),
                  pw.SizedBox(height: 40),

                  // Total Amount
                  pw.Row(
                    mainAxisAlignment: pw.MainAxisAlignment.end,
                    children: [
                      pw.Text('TOTAL PAID: ', style: pw.TextStyle(fontSize: 16, fontWeight: pw.FontWeight.bold, color: const PdfColor(0.4, 0.4, 0.4))),
                      pw.Text('INR $amount', style: pw.TextStyle(fontSize: 24, fontWeight: pw.FontWeight.bold, color: const PdfColor(0.02, 0.31, 0.23))),
                    ],
                  ),
                  pw.Spacer(),

                  // Footer
                  pw.Center(
                    child: pw.Column(
                      children: [
                        pw.Divider(color: const PdfColor(0.83, 0.69, 0.22)), // Gold Divider
                        pw.SizedBox(height: 10),
                        pw.Text('Jazakallah Khair for your payment.', style: pw.TextStyle(fontSize: 14, fontStyle: pw.FontStyle.italic, color: const PdfColor(0.02, 0.31, 0.23))),
                        pw.SizedBox(height: 5),
                        pw.Text('If you have any questions, please contact our support team.', style: pw.TextStyle(fontSize: 10, color: const PdfColor(0.5, 0.5, 0.5))),
                      ],
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      );

      // Open PDF preview/share sheet using Printing package
      await Printing.layoutPdf(
        onLayout: (PdfPageFormat format) async => pdf.save(),
        name: 'Receipt_$txnId.pdf',
      );

      if (mounted) {
        _showPremiumSnackBar('Receipt opened successfully! 📄', isError: false);
      }
    } catch (e) {
      if (mounted) {
        _showPremiumSnackBar('Failed to generate receipt.', isError: true);
      }
    } finally {
      if (mounted) {
        setState(() => downloadingTxnId = null);
      }
    }
  }

  // Helper for PDF Rows
  pw.Widget _buildPdfRow(String label, String value) {
    return pw.Padding(
      padding: const pw.EdgeInsets.symmetric(vertical: 8),
      child: pw.Row(
        mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
        children: [
          pw.Text(label, style: pw.TextStyle(fontSize: 14, color: const PdfColor(0.4, 0.4, 0.4))),
          pw.Text(value, style: pw.TextStyle(fontSize: 14, fontWeight: pw.FontWeight.bold, color: const PdfColor(0.1, 0.1, 0.1))),
        ],
      ),
    );
  }

  String formatDate(String isoDate) {
    try {
      final DateTime date = DateTime.parse(isoDate).toLocal();
      final List<String> months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return "${date.day.toString().padLeft(2, '0')} ${months[date.month - 1]} ${date.year}";
    } catch (e) {
      return "Unknown Date";
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
              onRefresh: fetchTransactions,
              child: CustomScrollView(
                physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
                slivers: [
                  // 🌟 ULTRA PREMIUM SLIVER APP BAR
                  SliverAppBar(
                    expandedHeight: 200.0,
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
                        'Payment History',
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
                            top: -30, right: -30,
                            child: Container(
                              width: 150, height: 150,
                              decoration: BoxDecoration(shape: BoxShape.circle, color: const Color(0xFFD4AF37).withOpacity(0.15)),
                              child: BackdropFilter(filter: ImageFilter.blur(sigmaX: 50, sigmaY: 50), child: Container(color: Colors.transparent)),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  // 🌟 TRANSACTIONS LIST
                  if (transactions.isEmpty)
                    SliverFillRemaining(
                      child: Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              padding: const EdgeInsets.all(28),
                              decoration: BoxDecoration(
                                color: Colors.white, shape: BoxShape.circle,
                                border: Border.all(color: const Color(0xFFD4AF37).withOpacity(0.3), width: 2),
                                boxShadow: [BoxShadow(color: const Color(0xFF064E3B).withOpacity(0.08), blurRadius: 30, offset: const Offset(0, 15))],
                              ),
                              child: const Icon(Icons.receipt_long_rounded, size: 60, color: Color(0xFFD4AF37)),
                            ),
                            const SizedBox(height: 24),
                            const Text('No Transactions Yet', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Color(0xFF0F172A), letterSpacing: -0.5)),
                            const SizedBox(height: 12),
                            const Text('Any purchases or donations you make\nwill appear securely right here.', textAlign: TextAlign.center, style: TextStyle(color: Color(0xFF64748B), fontSize: 15, height: 1.5)),
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
                            final txn = transactions[index];
                            final title = txn['courseId'] != null ? txn['courseId']['title'] : (txn['type'] ?? 'Course Fee');
                            final amount = txn['amount']?.toString() ?? '0';
                            final txnId = txn['transactionId'] ?? 'TXN-UNKNOWN';
                            final date = txn['createdAt'] != null ? formatDate(txn['createdAt']) : 'Unknown Date';
                            final status = txn['status'] ?? 'Pending';
                            
                            Color statusColor = const Color(0xFFD97706); // Orange (Pending)
                            Color statusBg = const Color(0xFFFEF3C7);
                            if (status == 'Completed' || status == 'Success') {
                              statusColor = const Color(0xFF059669); // Green
                              statusBg = const Color(0xFFD1FAE5);
                            } else if (status == 'Failed') {
                              statusColor = const Color(0xFFE11D48); // Red
                              statusBg = const Color(0xFFFFE4E6);
                            }

                            final isDownloading = downloadingTxnId == txnId;

                            return Container(
                              margin: const EdgeInsets.only(bottom: 20),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(24),
                                border: Border.all(color: const Color(0xFFD4AF37).withOpacity(0.3), width: 1.5),
                                boxShadow: [
                                  BoxShadow(color: const Color(0xFF064E3B).withOpacity(0.04), blurRadius: 20, offset: const Offset(0, 10)),
                                ],
                              ),
                              child: Column(
                                children: [
                                  Padding(
                                    padding: const EdgeInsets.all(20.0),
                                    child: Row(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        // Icon
                                        Container(
                                          padding: const EdgeInsets.all(12),
                                          decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFE2E8F0))),
                                          child: Icon(
                                            txn['courseId'] != null ? Icons.school_rounded : Icons.favorite_rounded, 
                                            color: const Color(0xFF64748B), size: 24
                                          ),
                                        ),
                                        const SizedBox(width: 16),
                                        
                                        // Details
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(title, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: Color(0xFF0F172A), letterSpacing: -0.3), maxLines: 2, overflow: TextOverflow.ellipsis),
                                              const SizedBox(height: 6),
                                              Text(date, style: const TextStyle(fontSize: 13, color: Color(0xFF94A3B8), fontWeight: FontWeight.w600)),
                                              const SizedBox(height: 8),
                                              Text('#$txnId', style: const TextStyle(fontSize: 12, color: Color(0xFF64748B), fontWeight: FontWeight.w500, fontFamily: 'monospace')),
                                            ],
                                          ),
                                        ),
                                        
                                        // Amount & Status
                                        Column(
                                          crossAxisAlignment: CrossAxisAlignment.end,
                                          children: [
                                            Text('₹$amount', style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: Color(0xFF0F172A))),
                                            const SizedBox(height: 12),
                                            Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                              decoration: BoxDecoration(color: statusBg, borderRadius: BorderRadius.circular(8)),
                                              child: Text(status.toUpperCase(), style: TextStyle(color: statusColor, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 0.5)),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                  ),
                                  
                                  // Download Receipt Area
                                  if (status == 'Completed' || status == 'Success') ...[
                                    const Divider(height: 1, color: Color(0xFFF1F5F9), thickness: 1.5),
                                    InkWell(
                                      onTap: isDownloading ? null : () => downloadReceipt(txn), // 🚀 Pura transaction map paas kar rahe hain
                                      borderRadius: const BorderRadius.only(bottomLeft: Radius.circular(24), bottomRight: Radius.circular(24)),
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(vertical: 16),
                                        width: double.infinity,
                                        child: Row(
                                          mainAxisAlignment: MainAxisAlignment.center,
                                          children: [
                                            isDownloading 
                                              ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Color(0xFFD4AF37), strokeWidth: 2.5))
                                              : const Icon(Icons.download_rounded, size: 20, color: Color(0xFFD4AF37)),
                                            const SizedBox(width: 10),
                                            Text(
                                              isDownloading ? 'GENERATING RECEIPT...' : 'DOWNLOAD RECEIPT', 
                                              style: TextStyle(color: isDownloading ? const Color(0xFF0F172A) : const Color(0xFFB48608), fontSize: 13, fontWeight: FontWeight.w900, letterSpacing: 1)
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ]
                                ],
                              ),
                            );
                          },
                          childCount: transactions.length,
                        ),
                      ),
                    ),
                ],
              ),
            ),
    );
  }
}