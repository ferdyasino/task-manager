import 'package:flutter/material.dart';
import 'tasks_page.dart';
import 'users_page.dart';

class HomeScreen extends StatefulWidget {
  final String token;

  const HomeScreen({Key? key, required this.token}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String currentPage = 'Tasks';

  void navigateTo(String page) {
    setState(() {
      currentPage = page;
    });
    Navigator.pop(context); // Close the drawer
  }

  Widget _getPage() {
    switch (currentPage) {
      case 'Users':
        return UsersPage(); // ✅ Make sure UsersPage has const constructor if possible
      case 'Tasks':
      default:
        return TasksPage(token: widget.token); // ✅ Passing token to TasksPage
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(currentPage)),
      endDrawer: Drawer(
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            const DrawerHeader(
              decoration: BoxDecoration(color: Colors.blue),
              child: Center(
                child: Text(
                  'Menu',
                  style: TextStyle(fontSize: 24, color: Colors.white),
                ),
              ),
            ),
            ListTile(
              leading: const Icon(Icons.task),
              title: const Text('Tasks'),
              onTap: () => navigateTo('Tasks'),
            ),
            ListTile(
              leading: const Icon(Icons.people),
              title: const Text('Users'),
              onTap: () => navigateTo('Users'),
            ),
          ],
        ),
      ),
      body: _getPage(),
    );
  }
}
