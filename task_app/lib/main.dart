import 'package:flutter/material.dart';
import 'pages/login_page.dart';
import 'pages/home_screen.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Task App',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(primarySwatch: Colors.blue),
      home: const LoginPageWrapper(),
    );
  }
}

class LoginPageWrapper extends StatefulWidget {
  const LoginPageWrapper({super.key});

  @override
  State<LoginPageWrapper> createState() => _LoginPageWrapperState();
}

class _LoginPageWrapperState extends State<LoginPageWrapper> {
  String? token;

  void handleLogin(String newToken) {
    setState(() {
      token = newToken;
    });
  }

  @override
  Widget build(BuildContext context) {
    return token == null
        ? LoginPage(onLoginSuccess: handleLogin)
        : HomeScreen(token: token!);
  }
}
