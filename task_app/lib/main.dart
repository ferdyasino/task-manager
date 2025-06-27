import 'package:flutter/material.dart';
import 'pages/home_screen.dart'; // Make sure this file exists

void main() {
  runApp(CrudApp());
}

class CrudApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Task App',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(primarySwatch: Colors.blue),
      home: HomeScreen(),
    );
  }
}
