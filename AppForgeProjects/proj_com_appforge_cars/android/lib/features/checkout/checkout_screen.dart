import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({super.key});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  String _selectedGateway = 'stripe';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Payment & Checkout')),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Select Payment Method', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            RadioListTile<String>(
              value: 'stripe',
              groupValue: _selectedGateway,
              onChanged: (val) => setState(() => _selectedGateway = val!),
              title: const Text('Credit Card (Stripe Safe Pay)'),
              secondary: const Icon(Icons.credit_card),
            ),
            RadioListTile<String>(
              value: 'paypal',
              groupValue: _selectedGateway,
              onChanged: (val) => setState(() => _selectedGateway = val!),
              title: const Text('PayPal Express'),
              secondary: const Icon(Icons.account_balance_wallet_outlined),
            ),
            RadioListTile<String>(
              value: 'manual',
              groupValue: _selectedGateway,
              onChanged: (val) => setState(() => _selectedGateway = val!),
              title: const Text('Direct Bank Transfer / Cash'),
              secondary: const Icon(Icons.payments_outlined),
            ),
            const Spacer(),
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Payment order initiated successfully through backend API!')),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryColor,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                child: const Text('Confirm Payment', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
