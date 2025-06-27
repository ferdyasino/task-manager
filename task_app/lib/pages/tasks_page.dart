import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class TasksPage extends StatefulWidget {
  @override
  State<TasksPage> createState() => _TasksPageState();
}

class _TasksPageState extends State<TasksPage> {
  final List<Map<String, dynamic>> tasks = [];
  final TextEditingController _controller = TextEditingController();
  final String baseUrl =
      'http://192.168.1.116:3000/api/tasks'; // 🔁 Replace with your actual IP

  @override
  void initState() {
    super.initState();
    fetchTasks();
  }

  Future<void> fetchTasks() async {
    try {
      final response = await http.get(Uri.parse(baseUrl));
      if (response.statusCode == 200) {
        final List data = jsonDecode(response.body);
        setState(
          () => tasks
            ..clear()
            ..addAll(data.cast<Map<String, dynamic>>()),
        );
      } else {
        debugPrint('❌ Failed to load tasks. Status: ${response.statusCode}');
      }
    } catch (e) {
      debugPrint('❌ Error fetching tasks: $e');
    }
  }

  Future<void> addTask(String title) async {
    if (title.trim().isEmpty) return;

    try {
      final response = await http.post(
        Uri.parse(baseUrl),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'title': title,
          'status': 'pending',
          'dueDate': '2025-12-31',
        }),
      );

      if (response.statusCode == 201) {
        _controller.clear();
        fetchTasks();
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('✅ Task added')));
      } else if (response.statusCode == 400 || response.statusCode == 409) {
        // Assuming backend returns 400 or 409 for duplicate title
        final error = jsonDecode(response.body);
        final message = error['message'] ?? 'Duplicate task title';
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('❌ $message')));
      } else {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('❌ Failed to add task')));
      }
    } catch (e) {
      debugPrint('❌ Error adding task: $e');
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('❌ Network error: $e')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // 📝 Task Input Field
        Padding(
          padding: const EdgeInsets.all(12.0),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _controller,
                  decoration: InputDecoration(
                    labelText: 'Task title',
                    border: OutlineInputBorder(),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              ElevatedButton(
                onPressed: () => addTask(_controller.text),
                child: const Text('Add'),
              ),
            ],
          ),
        ),

        // 📋 Task List
        Expanded(
          child: tasks.isEmpty
              ? const Center(child: Text('No tasks found.'))
              : ListView.builder(
                  itemCount: tasks.length,
                  itemBuilder: (context, index) {
                    final task = tasks[index];
                    return Card(
                      margin: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 6,
                      ),
                      elevation: 2,
                      child: ListTile(
                        leading: const Icon(Icons.task),
                        title: Text(task['title'] ?? 'Untitled'),
                        subtitle: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Status: ${task['status'] ?? 'pending'}'),
                            if (task['dueDate'] != null)
                              Text(
                                'Due: ${task['dueDate'].toString().substring(0, 10)}',
                              ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
        ),
      ],
    );
  }
}
