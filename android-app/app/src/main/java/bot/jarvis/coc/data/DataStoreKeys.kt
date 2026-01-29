package bot.jarvis.coc.data

import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.floatPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import javax.inject.Inject
import javax.inject.Singleton

object DataStoreKeys {
    // Bot Configuration
    val BOT_ENABLED = booleanPreferencesKey("bot_enabled")
    val BOT_STATE = stringPreferencesKey("bot_state")
    val AUTO_START = booleanPreferencesKey("auto_start")
    
    // Screen Coordinates (stored as ratios 0.0-1.0)
    val TARGET_X_RATIO = floatPreferencesKey("target_x_ratio")
    val TARGET_Y_RATIO = floatPreferencesKey("target_y_ratio")
    val ATTACK_BUTTON_X_RATIO = floatPreferencesKey("attack_button_x_ratio")
    val ATTACK_BUTTON_Y_RATIO = floatPreferencesKey("attack_button_y_ratio")
    
    // UI Settings
    val OVERLAY_POSITION_X = floatPreferencesKey("overlay_position_x")
    val OVERLAY_POSITION_Y = floatPreferencesKey("overlay_position_y")
    val OVERLAY_EXPANDED = booleanPreferencesKey("overlay_expanded")
    
    // Bot Settings
    val COLLECT_RESOURCES = booleanPreferencesKey("collect_resources")
    val TRAIN_TROOPS = booleanPreferencesKey("train_troops")
    val DONATE_TROOPS = booleanPreferencesKey("donate_troops")
    val CLAN_CHAT_ENABLED = booleanPreferencesKey("clan_chat_enabled")
    
    // Timing Settings
    val OPERATION_INTERVAL = stringPreferencesKey("operation_interval") // in milliseconds as string
    val RETRY_ATTEMPTS = stringPreferencesKey("retry_attempts")
    val TIMEOUT_DURATION = stringPreferencesKey("timeout_duration")
    
    // Training Configuration
    val BARRACKS_LEVEL = stringPreferencesKey("barracks_level")
    val CAMP_CAPACITY = stringPreferencesKey("camp_capacity")
    val TROOP_COMPOSITION = stringPreferencesKey("troop_composition")
    
    // Resource Collection Settings
    val GOLD_COLLECT = booleanPreferencesKey("gold_collect")
    val ELIXIR_COLLECT = booleanPreferencesKey("elixir_collect")
    val DARK_ELIXIR_COLLECT = booleanPreferencesKey("dark_elixir_collect")
    val GEM_COLLECT = booleanPreferencesKey("gem_collect")
    
    // Accessibility Settings
    val ROOT_ENABLED = booleanPreferencesKey("root_enabled")
    val DEBUG_MODE = booleanPreferencesKey("debug_mode")
    val SCREENSHOT_MODE = booleanPreferencesKey("screenshot_mode")
    val VERBOSE_LOGGING = booleanPreferencesKey("verbose_logging")
    
    // Performance Settings
    val OCR_CONFIDENCE_THRESHOLD = floatPreferencesKey("ocr_confidence_threshold")
    val MATCH_TEMPLATE_THRESHOLD = floatPreferencesKey("match_template_threshold")
    val CAPTURE_QUALITY = stringPreferencesKey("capture_quality")
    val PROCESSING_THREADS = stringPreferencesKey("processing_threads")
    
    // Security Settings
    val ANTI_DETECTION_ENABLED = booleanPreferencesKey("anti_detection_enabled")
    val RANDOM_DELAYS = booleanPreferencesKey("random_delays")
    val HUMAN_BEHAVIOR_MODE = booleanPreferencesKey("human_behavior_mode")
    
    // Notification Settings
    val NOTIFICATIONS_ENABLED = booleanPreferencesKey("notifications_enabled")
    val ERROR_NOTIFICATIONS = booleanPreferencesKey("error_notifications")
    val SUCCESS_NOTIFICATIONS = booleanPreferencesKey("success_notifications")
    val MAINTENANCE_NOTIFICATIONS = booleanPreferencesKey("maintenance_notifications")
}