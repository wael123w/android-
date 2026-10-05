import 'package:flutter/material.dart';

class SearchScreen extends StatelessWidget {
  const SearchScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const TextField(
          autofocus: true,
          decoration: InputDecoration(
            hintText: 'Search catalog, items, tags...',
            border: InputBorder.none,
          ),
        ),
      ),
      body: const Center(
        child: Text('Type keywords to filter results in real-time', style: TextStyle(color: Colors.grey)),
      ),
    );
  }
}
