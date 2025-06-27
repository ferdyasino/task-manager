import 'package:flutter/material.dart';
import 'tasks_page.dart';
import 'users_page.dart';

class HomeScreen extends StatefulWidget {
  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String currentPage = 'Tasks';

  void navigateTo(String page) {
    setState(() => currentPage = page);
    Navigator.pop(context); // Close drawer
  }

  Widget _getPage() {
    switch (currentPage) {
      case 'Users':
        return UsersPage();
      default:
        return TasksPage();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(currentPage)),
      endDrawer: Drawer(
        // 👈 This already slides from the right
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            DrawerHeader(
              decoration: BoxDecoration(color: Colors.blue),
              child: Center(
                child: Text(
                  'Menu',
                  style: TextStyle(fontSize: 24, color: Colors.white),
                ),
              ),
            ),
            ListTile(
              leading: Icon(Icons.task),
              title: Text('Tasks'),
              onTap: () => navigateTo('Tasks'),
            ),
            ListTile(
              leading: Icon(Icons.people),
              title: Text('Users'),
              onTap: () => navigateTo('Users'),
            ),
          ],
        ),
      ),
      body: _getPage(),
    );
  }
}
