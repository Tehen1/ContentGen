import 'package:flutter/material.dart';

void main() {
  runApp(const FitApp());
}

class FitApp extends StatelessWidget {
  const FitApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'FitApp Flutter',
      home: Scaffold(
        appBar: AppBar(
          title: const Text('Hello FitApp Flutter'),
        ),
        body: const Center(
          child: Text('Hello World from Flutter!', style: TextStyle(fontSize: 24)),
        ),
      ),
    );
  }
}

