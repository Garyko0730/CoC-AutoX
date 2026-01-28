package bot.jarvis.coc.core

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

data class LogEntry(
    val timestamp: Long,
    val level: LogLevel,
    val message: String
) {
    val formattedTime: String
        get() = SimpleDateFormat("HH:mm:ss", Locale.getDefault()).format(Date(timestamp))
}

enum class LogLevel {
    INFO, WARN, ERROR, DEBUG
}

object LogManager {
    private val _logs = MutableStateFlow<List<LogEntry>>(emptyList())
    val logs = _logs.asStateFlow()

    fun log(message: String, level: LogLevel = LogLevel.INFO) {
        val entry = LogEntry(System.currentTimeMillis(), level, message)
        // Keep last 100 logs
        val currentList = _logs.value.toMutableList()
        currentList.add(0, entry) // Add to top
        if (currentList.size > 100) {
            currentList.removeAt(currentList.lastIndex)
        }
        _logs.value = currentList
        
        // Also log to Android system log
        when(level) {
            LogLevel.INFO -> android.util.Log.i("JarvisBot", message)
            LogLevel.WARN -> android.util.Log.w("JarvisBot", message)
            LogLevel.ERROR -> android.util.Log.e("JarvisBot", message)
            LogLevel.DEBUG -> android.util.Log.d("JarvisBot", message)
        }
    }

    fun i(msg: String) = log(msg, LogLevel.INFO)
    fun w(msg: String) = log(msg, LogLevel.WARN)
    fun e(msg: String) = log(msg, LogLevel.ERROR)
    fun d(msg: String) = log(msg, LogLevel.DEBUG)
}
