package bot.jarvis.coc.data

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.emptyPreferences
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.map
import java.io.IOException

val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "coc_autox_settings")

class AppDataStore @Inject constructor(
    private val context: Context
) {
    private val dataStore = context.dataStore

    // Bot Configuration
    val botEnabled: Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[DataStoreKeys.BOT_ENABLED] ?: false
    }

    val botState: Flow<String> = dataStore.data.map { preferences ->
        preferences[DataStoreKeys.BOT_STATE] ?: "IDLE"
    }

    val autoStart: Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[DataStoreKeys.AUTO_START] ?: false
    }

    // Screen Coordinates
    val targetCoordinates: Flow<Pair<Float, Float>> = dataStore.data.map { preferences ->
        Pair(
            preferences[DataStoreKeys.TARGET_X_RATIO] ?: 0.5f,
            preferences[DataStoreKeys.TARGET_Y_RATIO] ?: 0.5f
        )
    }

    val attackButtonCoordinates: Flow<Pair<Float, Float>> = dataStore.data.map { preferences ->
        Pair(
            preferences[DataStoreKeys.ATTACK_BUTTON_X_RATIO] ?: 0.8f,
            preferences[DataStoreKeys.ATTACK_BUTTON_Y_RATIO] ?: 0.8f
        )
    }

    // Overlay Settings
    val overlayPosition: Flow<Pair<Float, Float>> = dataStore.data.map { preferences ->
        Pair(
            preferences[DataStoreKeys.OVERLAY_POSITION_X] ?: 0.1f,
            preferences[DataStoreKeys.OVERLAY_POSITION_Y] ?: 0.1f
        )
    }

    val overlayExpanded: Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[DataStoreKeys.OVERLAY_EXPANDED] ?: false
    }

    // Bot Settings
    val collectResources: Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[DataStoreKeys.COLLECT_RESOURCES] ?: true
    }

    val trainTroops: Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[DataStoreKeys.TRAIN_TROOPS] ?: true
    }

    val donateTroops: Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[DataStoreKeys.DONATE_TROOPS] ?: false
    }

    val clanChatEnabled: Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[DataStoreKeys.CLAN_CHAT_ENABLED] ?: false
    }

    val debugMode: Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[DataStoreKeys.DEBUG_MODE] ?: false
    }

    // Additional DataStore flows for missing keys
    val rootEnabled: Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[DataStoreKeys.ROOT_ENABLED] ?: false
    }

    val screenshotMode: Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[DataStoreKeys.SCREENSHOT_MODE] ?: false
    }

    val verboseLogging: Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[DataStoreKeys.VERBOSE_LOGGING] ?: false
    }

    val ocrConfidenceThreshold: Flow<Float> = dataStore.data.map { preferences ->
        preferences[DataStoreKeys.OCR_CONFIDENCE_THRESHOLD] ?: 0.8f
    }

    val matchTemplateThreshold: Flow<Float> = dataStore.data.map { preferences ->
        preferences[DataStoreKeys.MATCH_TEMPLATE_THRESHOLD] ?: 0.8f
    }

    val captureQuality: Flow<String> = dataStore.data.map { preferences ->
        preferences[DataStoreKeys.CAPTURE_QUALITY] ?: "high"
    }

    val processingThreads: Flow<String> = dataStore.data.map { preferences ->
        preferences[DataStoreKeys.PROCESSING_THREADS] ?: "2"
    }

    val antiDetectionEnabled: Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[DataStoreKeys.ANTI_DETECTION_ENABLED] ?: true
    }

    val randomDelays: Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[DataStoreKeys.RANDOM_DELAYS] ?: true
    }

    val humanBehaviorMode: Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[DataStoreKeys.HUMAN_BEHAVIOR_MODE] ?: false
    }

    val notificationsEnabled: Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[DataStoreKeys.NOTIFICATIONS_ENABLED] ?: true
    }

    val errorNotifications: Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[DataStoreKeys.ERROR_NOTIFICATIONS] ?: true
    }

    val successNotifications: Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[DataStoreKeys.SUCCESS_NOTIFICATIONS] ?: false
    }

    val maintenanceNotifications: Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[DataStoreKeys.MAINTENANCE_NOTIFICATIONS] ?: true
    }

    // Settings Functions
    suspend fun setBotEnabled(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[DataStoreKeys.BOT_ENABLED] = enabled
        }
    }

    suspend fun setBotState(state: String) {
        dataStore.edit { preferences ->
            preferences[DataStoreKeys.BOT_STATE] = state
        }
    }

    suspend fun setAutoStart(autoStart: Boolean) {
        dataStore.edit { preferences ->
            preferences[DataStoreKeys.AUTO_START] = autoStart
        }
    }

    suspend fun setTargetCoordinates(xRatio: Float, yRatio: Float) {
        dataStore.edit { preferences ->
            preferences[DataStoreKeys.TARGET_X_RATIO] = xRatio
            preferences[DataStoreKeys.TARGET_Y_RATIO] = yRatio
        }
    }

    suspend fun setAttackButtonCoordinates(xRatio: Float, yRatio: Float) {
        dataStore.edit { preferences ->
            preferences[DataStoreKeys.ATTACK_BUTTON_X_RATIO] = xRatio
            preferences[DataStoreKeys.ATTACK_BUTTON_Y_RATIO] = yRatio
        }
    }

    suspend fun setOverlayPosition(xRatio: Float, yRatio: Float) {
        dataStore.edit { preferences ->
            preferences[DataStoreKeys.OVERLAY_POSITION_X] = xRatio
            preferences[DataStoreKeys.OVERLAY_POSITION_Y] = yRatio
        }
    }

    suspend fun setOverlayExpanded(expanded: Boolean) {
        dataStore.edit { preferences ->
            preferences[DataStoreKeys.OVERLAY_EXPANDED] = expanded
        }
    }

    suspend fun setBotSettings(
        collectResources: Boolean,
        trainTroops: Boolean,
        donateTroops: Boolean,
        clanChatEnabled: Boolean
    ) {
        dataStore.edit { preferences ->
            preferences[DataStoreKeys.COLLECT_RESOURCES] = collectResources
            preferences[DataStoreKeys.TRAIN_TROOPS] = trainTroops
            preferences[DataStoreKeys.DONATE_TROOPS] = donateTroops
            preferences[DataStoreKeys.CLAN_CHAT_ENABLED] = clanChatEnabled
        }
    }

    suspend fun setDebugMode(debug: Boolean) {
        dataStore.edit { preferences ->
            preferences[DataStoreKeys.DEBUG_MODE] = debug
        }
    }

    // Additional setter functions
    suspend fun setRootEnabled(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[DataStoreKeys.ROOT_ENABLED] = enabled
        }
    }

    suspend fun setScreenshotMode(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[DataStoreKeys.SCREENSHOT_MODE] = enabled
        }
    }

    suspend fun setVerboseLogging(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[DataStoreKeys.VERBOSE_LOGGING] = enabled
        }
    }

    suspend fun setOcrConfidenceThreshold(threshold: Float) {
        dataStore.edit { preferences ->
            preferences[DataStoreKeys.OCR_CONFIDENCE_THRESHOLD] = threshold
        }
    }

    suspend fun setMatchTemplateThreshold(threshold: Float) {
        dataStore.edit { preferences ->
            preferences[DataStoreKeys.MATCH_TEMPLATE_THRESHOLD] = threshold
        }
    }

    suspend fun setCaptureQuality(quality: String) {
        dataStore.edit { preferences ->
            preferences[DataStoreKeys.CAPTURE_QUALITY] = quality
        }
    }

    suspend fun setProcessingThreads(threads: String) {
        dataStore.edit { preferences ->
            preferences[DataStoreKeys.PROCESSING_THREADS] = threads
        }
    }

    suspend fun setAntiDetectionEnabled(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[DataStoreKeys.ANTI_DETECTION_ENABLED] = enabled
        }
    }

    suspend fun setRandomDelays(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[DataStoreKeys.RANDOM_DELAYS] = enabled
        }
    }

    suspend fun setHumanBehaviorMode(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[DataStoreKeys.HUMAN_BEHAVIOR_MODE] = enabled
        }
    }

    suspend fun setNotificationsEnabled(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[DataStoreKeys.NOTIFICATIONS_ENABLED] = enabled
        }
    }

    suspend fun setErrorNotifications(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[DataStoreKeys.ERROR_NOTIFICATIONS] = enabled
        }
    }

    suspend fun setSuccessNotifications(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[DataStoreKeys.SUCCESS_NOTIFICATIONS] = enabled
        }
    }

    suspend fun setMaintenanceNotifications(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[DataStoreKeys.MAINTENANCE_NOTIFICATIONS] = enabled
        }
    }

    // Utility function to safely get preferences
    private fun <T> Flow<T>.safeCatch(): Flow<T> {
        return catch { exception ->
            if (exception is IOException) {
                emit(emptyPreferences())
            } else {
                throw exception
            }
        }
    }
}