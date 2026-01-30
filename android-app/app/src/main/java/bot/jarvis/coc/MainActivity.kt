package bot.jarvis.coc

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.ui.Modifier
import bot.jarvis.coc.core.BotEngine
import bot.jarvis.coc.data.AppDataStore
import bot.jarvis.coc.screens.CoordinatePickerActivity
import bot.jarvis.coc.screens.MainScreen
import bot.jarvis.coc.service.OverlayService
import bot.jarvis.coc.theme.CoCAutoXTheme
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    private lateinit var engine: BotEngine
    private lateinit var dataStore: AppDataStore
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        engine = BotEngine(applicationContext)
        dataStore = AppDataStore(applicationContext)
        
        setContent {
            CoCAutoXTheme {
                MainScreen(
                    engine = engine,
                    dataStore = dataStore,
                    onLaunchBot = { launchBot() },
                    onNavigateToPicker = { navigateToCoordinatePicker() }
                )
            }
        }
    }
    
    private fun launchBot() {
        CoroutineScope(Dispatchers.Main).launch {
            // Save configuration to DataStore
            dataStore.setBotState("STARTING")
            dataStore.setBotEnabled(true)
            
            // Start OverlayService
            val overlayIntent = Intent(this@MainActivity, OverlayService::class.java)
            startService(overlayIntent)
            
            // Move app to background
            moveTaskToBack(true)
        }
    }
    
    private fun navigateToCoordinatePicker() {
        val intent = Intent(this, CoordinatePickerActivity::class.java)
        startActivity(intent)
    }
}
