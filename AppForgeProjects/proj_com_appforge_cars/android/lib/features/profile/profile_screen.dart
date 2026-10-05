import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Account')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Center(
            child: CircleAvatar(
              radius: 44,
              backgroundColor: AppTheme.primaryColor,
              child: Icon(Icons.person, size: 50, color: Colors.white),
            ),
          ),
          const SizedBox(height: 12),
          const Center(child: Text('Active User', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold))),
          const Center(child: Text('user@appforge.local', style: TextStyle(color: Colors.grey, fontSize: 13))),
          const SizedBox(height: 24),
          ListTile(leading: const Icon(Icons.shopping_bag_outlined), title: const Text('My Orders & Transactions'), trailing: const Icon(Icons.chevron_right)),
          ListTile(leading: const Icon(Icons.favorite_border), title: const Text('Saved Favorites'), trailing: const Icon(Icons.chevron_right)),
          ListTile(leading: const Icon(Icons.security_outlined), title: const Text('Security & Password'), trailing: const Icon(Icons.chevron_right)),
          ListTile(leading: const Icon(Icons.help_outline), title: const Text('Support & Privacy'), trailing: const Icon(Icons.chevron_right)),
        ],
      ),
    );
  }
}
