import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController nameCtrl = TextEditingController();
  final TextEditingController passwordCtrl = TextEditingController();
  final TextEditingController birthDateCtrl = TextEditingController();

  bool isLoading = false;
  String? errorMessage;

  Future<void> pickBirthDate() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime(now.year - 18),
      firstDate: DateTime(1900),
      lastDate: now,
    );
    if (picked != null) {
      birthDateCtrl.text = picked.toIso8601String().split('T')[0]; // yyyy-MM-dd
    }
  }

  Future<void> registerUser() async {
    final url = Uri.parse('http://192.168.1.116:4000/api/auth/register');

    setState(() {
      isLoading = true;
      errorMessage = null;
    });

    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          "name": nameCtrl.text.trim(),
          "password": passwordCtrl.text.trim(),
          "birthDate": birthDateCtrl.text.trim(),
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 201) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('✅ Registration successful')),
        );
        Navigator.pop(context); // Back to login
      } else {
        setState(() {
          errorMessage =
              data['error'] ??
              (data['errors']?.join(", ") ?? 'Registration failed');
        });
      }
    } catch (e) {
      setState(() {
        errorMessage = '❌ Error: ${e.toString()}';
      });
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Register")),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              if (errorMessage != null) ...[
                Text(errorMessage!, style: const TextStyle(color: Colors.red)),
                const SizedBox(height: 10),
              ],
              TextFormField(
                controller: nameCtrl,
                decoration: const InputDecoration(labelText: "Name"),
                validator: (val) => val == null || val.trim().isEmpty
                    ? "Enter your name"
                    : null,
              ),
              TextFormField(
                controller: birthDateCtrl,
                readOnly: true,
                decoration: const InputDecoration(
                  labelText: "Birth Date",
                  hintText: "Select your birth date",
                ),
                onTap: pickBirthDate,
                validator: (val) =>
                    val == null || val.isEmpty ? "Pick your birth date" : null,
              ),
              TextFormField(
                controller: passwordCtrl,
                decoration: const InputDecoration(labelText: "Password"),
                obscureText: true,
                validator: (val) =>
                    val == null || val.length < 6 ? "Min 6 characters" : null,
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: isLoading
                    ? null
                    : () {
                        if (_formKey.currentState!.validate()) {
                          registerUser();
                        }
                      },
                child: isLoading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text("Register"),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
