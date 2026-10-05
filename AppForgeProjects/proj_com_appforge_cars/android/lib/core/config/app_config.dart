class AppConfig {
  static const String appName = 'AutoForge Market';
  static const String appVersion = '1.0.0';
  // User-configurable API Base URL (default connects to local host or emulator)
  static String apiBaseUrl = 'http://10.0.2.2/api';
  static const String currency = 'USD';
  static const int requestTimeoutSeconds = 20;

  static void setApiBaseUrl(String url) {
    apiBaseUrl = url.endsWith('/') ? url.substring(0, url.length - 1) : url;
  }
}
