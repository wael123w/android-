import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/app_config.dart';

class ApiClient {
  static Future<Map<String, String>> _getHeaders() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('auth_token');
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  static Future<dynamic> get(String endpoint) async {
    final uri = Uri.parse('${AppConfig.apiBaseUrl}/$endpoint');
    final response = await http.get(uri, headers: await _getHeaders())
        .timeout(const Duration(seconds: AppConfig.requestTimeoutSeconds));
    return _processResponse(response);
  }

  static Future<dynamic> post(String endpoint, Map<String, dynamic> body) async {
    final uri = Uri.parse('${AppConfig.apiBaseUrl}/$endpoint');
    final response = await http.post(uri, headers: await _getHeaders(), body: jsonEncode(body))
        .timeout(const Duration(seconds: AppConfig.requestTimeoutSeconds));
    return _processResponse(response);
  }

  static dynamic _processResponse(http.Response res) {
    final data = jsonDecode(res.body);
    if (res.statusCode >= 200 && res.statusCode < 300) {
      return data;
    } else {
      throw Exception(data['error'] ?? 'Server error ${res.statusCode}');
    }
  }
}
