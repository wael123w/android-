import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../checkout/checkout_screen.dart';

class DetailScreen extends StatelessWidget {
  final int itemId;
  const DetailScreen({super.key, required this.itemId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Item #$itemId Details')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              height: 220,
              width: double.infinity,
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Icon(Icons.photo_library_outlined, size: 60, color: Colors.grey),
            ),
            const SizedBox(height: 20),
            Text('Premium Item Listing #$itemId', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            const Text('Verified Merchant • 4.9 ★ (120 reviews)', style: TextStyle(color: Colors.grey, fontSize: 13)),
            const SizedBox(height: 16),
            const Text('Description', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            const Text(
              'High grade verified item published through the AppForge AI modular ecosystem. Fully synced with MySQL backend and managed via administrative dashboard.',
              style: TextStyle(color: Colors.black87, height: 1.5),
            ),
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const CheckoutScreen())),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryColor,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                child: const Text('Proceed to Order / Checkout', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
