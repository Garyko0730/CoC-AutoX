package bot.jarvis.coc.core

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "settings")

class SettingsRepository(private val context: Context) {

    companion object {
        val KEY_ROOT_ENABLED = booleanPreferencesKey("root_enabled")
        val KEY_DEBUG_MODE = booleanPreferencesKey("debug_mode")
    }

    val rootEnabled: Flow<Boolean> = context.dataStore.data
        .map { preferences -> preferences[KEY_ROOT_ENABLED] ?: false }

    val debugMode: Flow<Boolean> = context.dataStore.data
        .map { preferences -> preferences[KEY_DEBUG_MODE] ?: true }

    suspend fun setRootEnabled(enabled: Boolean) {
        context.dataStore.edit { preferences ->
            preferences[KEY_ROOT_ENABLED] = enabled
        }
        // Update InputManager config
        InputManager.preferRoot = enabled
        LogManager.i("Settings: Root Mode set to $enabled")
    }

    suspend fun setDebugMode(enabled: Boolean) {
        context.dataStore.edit { preferences ->
            preferences[KEY_DEBUG_MODE] = enabled
        }
        LogManager.i("Settings: Debug Mode set to $enabled")
    }
}
