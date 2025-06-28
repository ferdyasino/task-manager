import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class TasksPage extends StatefulWidget {
  final String token;

  const TasksPage({Key? key, required this.token}) : super(key: key);

  @override
  State<TasksPage> createState() => _TasksPageState();
}

class _TasksPageState extends State<TasksPage> {
  final List<Map<String, dynamic>> tasks = [];
  final String baseUrl =
      'http://192.168.1.116:4000/api/tasks'; // Replace IP if needed

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
        setState(() {
          tasks
            ..clear()
            ..addAll(data.cast<Map<String, dynamic>>());
        });
      } else {
        debugPrint('❌ Failed to load tasks. Status: ${response.statusCode}');
      }
    } catch (e) {
      debugPrint('❌ Error fetching tasks: $e');
    }
  }

  Future<void> addTask(String title, String description) async {
    if (title.trim().isEmpty) {
      showSnackBar('❌ Title is required.');
      return;
    }

    try {
      final response = await http.post(
        Uri.parse(baseUrl),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'title': title, 'description': description}),
      );

      if (response.statusCode == 201) {
        fetchTasks();
      } else {
        final body = jsonDecode(response.body);
        final error = body['error'] ?? 'Failed to add task';
        showSnackBar('❌ Failed to add task: $error');
      }
    } catch (e) {
      showSnackBar('❌ Error adding task: $e');
    }
  }

  Future<void> updateTask(int id, Map<String, dynamic> payload) async {
    try {
      final response = await http.put(
        Uri.parse('$baseUrl/$id'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(payload),
      );

      if (response.statusCode == 200) {
        fetchTasks();
      } else {
        final body = jsonDecode(response.body);
        final error = body['error'] ?? 'Failed to update task';
        showSnackBar('❌ Failed to update task: $error');
      }
    } catch (e) {
      showSnackBar('❌ Error updating task: $e');
    }
  }

  Future<void> deleteTask(int id) async {
    try {
      final response = await http.delete(Uri.parse('$baseUrl/$id'));
      if (response.statusCode == 200) {
        fetchTasks();
        showSnackBar('🗑️ Task deleted');
      } else {
        showSnackBar('❌ Failed to delete task');
      }
    } catch (e) {
      showSnackBar('❌ Error deleting task: $e');
    }
  }

  Future<bool> confirmDelete(String title) async {
    return await showDialog(
          context: context,
          builder: (context) => AlertDialog(
            title: Text('Delete Task'),
            content: Text('Are you sure you want to delete "$title"?'),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context, false),
                child: Text('Cancel'),
              ),
              TextButton(
                onPressed: () => Navigator.pop(context, true),
                child: Text('Delete', style: TextStyle(color: Colors.red)),
              ),
            ],
          ),
        ) ??
        false;
  }

  void showSnackBar(String message) {
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(message)));
  }

  void showStatusDialog(Map<String, dynamic> task) {
    showDialog(
      context: context,
      builder: (context) => SimpleDialog(
        title: Text('Update status for "${task['title']}"'),
        children: ['pending', 'in-progress', 'done']
            .map(
              (status) => SimpleDialogOption(
                child: Text(status),
                onPressed: () {
                  Navigator.pop(context);
                  updateTask(task['id'], {'status': status});
                },
              ),
            )
            .toList(),
      ),
    );
  }

  void showTaskEditDialog(Map<String, dynamic> task) {
    final descController = TextEditingController(
      text: task['description'] ?? '',
    );
    String selectedStatus = task['status'];

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Edit Task'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(task['title'], style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            TextField(
              controller: descController,
              decoration: InputDecoration(labelText: 'Description'),
              maxLines: 3,
            ),
            const SizedBox(height: 10),
            DropdownButtonFormField<String>(
              value: selectedStatus,
              decoration: InputDecoration(labelText: 'Status'),
              items: [
                'pending',
                'in-progress',
                'done',
              ].map((s) => DropdownMenuItem(value: s, child: Text(s))).toList(),
              onChanged: (val) {
                if (val != null) selectedStatus = val;
              },
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              updateTask(task['id'], {
                'description': descController.text.trim(),
                'status': selectedStatus,
              });
            },
            child: Text('Save'),
          ),
        ],
      ),
    );
  }

  void showAddTaskDialog() {
    final titleController = TextEditingController();
    final descController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('New Task'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: titleController,
              decoration: InputDecoration(labelText: 'Title'),
            ),
            TextField(
              controller: descController,
              decoration: InputDecoration(labelText: 'Description'),
              maxLines: 3,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              addTask(titleController.text.trim(), descController.text.trim());
            },
            child: Text('Add'),
          ),
        ],
      ),
    );
  }

  Widget slideRightBackground() {
    return Container(
      color: Colors.blue,
      alignment: Alignment.centerLeft,
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: const Icon(Icons.sync_alt, color: Colors.white),
    );
  }

  Widget slideLeftBackground() {
    return Container(
      color: Colors.red,
      alignment: Alignment.centerRight,
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: const Icon(Icons.delete, color: Colors.white),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('📝 Tasks')),
      floatingActionButton: FloatingActionButton(
        onPressed: showAddTaskDialog,
        child: Icon(Icons.add),
      ),
      body: RefreshIndicator(
        onRefresh: fetchTasks,
        child: tasks.isEmpty
            ? ListView(
                children: const [
                  SizedBox(height: 200),
                  Center(child: Text('No tasks found.')),
                ],
              )
            : ListView.builder(
                itemCount: tasks.length,
                itemBuilder: (context, index) {
                  final task = tasks[index];
                  return Dismissible(
                    key: ValueKey(task['id']),
                    background: slideRightBackground(),
                    secondaryBackground: slideLeftBackground(),
                    confirmDismiss: (direction) async {
                      if (direction == DismissDirection.startToEnd) {
                        showStatusDialog(task);
                        return false;
                      } else if (direction == DismissDirection.endToStart) {
                        final confirmed = await confirmDelete(task['title']);
                        if (confirmed) await deleteTask(task['id']);
                        return confirmed;
                      }
                      return false;
                    },
                    child: Card(
                      margin: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 6,
                      ),
                      child: ListTile(
                        onTap: () => showTaskEditDialog(task),
                        leading: const Icon(Icons.task),
                        title: Text(task['title']),
                        subtitle: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            if ((task['description'] ?? '')
                                .toString()
                                .isNotEmpty)
                              Text('📝 ${task['description']}'),
                            Text('Status: ${task['status']}'),
                            if (task['dueDate'] != null)
                              Text(
                                'Due: ${task['dueDate'].toString().substring(0, 10)}',
                              ),
                          ],
                        ),
                      ),
                    ),
                  );
                },
              ),
      ),
    );
  }
}
