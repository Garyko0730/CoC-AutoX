package bot.jarvis.coc.service

import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.PixelFormat
import android.os.Build
import android.os.IBinder
import android.view.Gravity
import android.view.MotionEvent
import android.view.WindowManager
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.ComposeView
import androidx.compose.ui.unit.dp
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.LifecycleRegistry
import androidx.lifecycle.setViewTreeLifecycleOwner
import androidx.savedstate.SavedStateRegistry
import androidx.savedstate.SavedStateRegistryController
import androidx.savedstate.SavedStateRegistryOwner
import androidx.savedstate.setViewTreeSavedStateRegistryOwner
import bot.jarvis.coc.components.OverlayCompactIcon
import bot.jarvis.coc.components.OverlayExpandedPanel
import bot.jarvis.coc.core.BotEngine
import bot.jarvis.coc.core.BotState
import bot.jarvis.coc.data.AppDataStore
import bot.jarvis.coc.screens.SettingsActivity
import bot.jarvis.coc.theme.*
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.launch

class OverlayService : Service(), LifecycleOwner, SavedStateRegistryOwner {

    private lateinit var windowManager: WindowManager
    private lateinit var overlayView: ComposeView
    private val lifecycleRegistry = LifecycleRegistry(this)
    private val savedStateRegistryController = SavedStateRegistryController.create(this)
    
    private lateinit var engine: BotEngine
    private lateinit var dataStore: AppDataStore
    private var isExpanded = false
    private var initialX = 0
    private var initialY = 0
    private var initialTouchX = 0f
    private var initialTouchY = 0f

    override val lifecycle: Lifecycle get() = lifecycleRegistry
    override val savedStateRegistry: SavedStateRegistry get() = savedStateRegistryController.savedStateRegistry

    override fun onCreate() {
        super.onCreate()
        savedStateRegistryController.performRestore(null)
        lifecycleRegistry.handleLifecycleEvent(Lifecycle.Event.ON_CREATE)
        
        windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager
        engine = BotEngine(applicationContext)
        dataStore = AppDataStore(applicationContext)
        
        // Setup Compose View for Overlay
        overlayView = ComposeView(this).apply {
            setViewTreeLifecycleOwner(this@OverlayService)
            setViewTreeSavedStateRegistryOwner(this@OverlayService)
            
            setContent {
                CoCAutoXTheme {
                    OverlayHUD()
                }
            }
        }

        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) 
                WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY 
            else 
                WindowManager.LayoutParams.TYPE_PHONE,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            x = 100
            y = 100
        }

        windowManager.addView(overlayView, params)
        lifecycleRegistry.handleLifecycleEvent(Lifecycle.Event.ON_START)
        lifecycleRegistry.handleLifecycleEvent(Lifecycle.Event.ON_RESUME)
    }

    @Composable
    private fun OverlayHUD() {
        val botState by engine.state.collectAsState()
        val overlayExpanded by dataStore.overlayExpanded.collectAsState(initial = false)
        
        LaunchedEffect(overlayExpanded) {
            isExpanded = overlayExpanded
        }
        
        Box(
            modifier = Modifier
                .background(Color.Transparent)
        ) {
            if (isExpanded) {
                OverlayExpandedPanel(
                    botState = botState::class.simpleName ?: "UNKNOWN",
                    isBotActive = botState is BotState.Running,
                    onStart = { 
                        launch { 
                            engine.start()
                            dataStore.setBotState("RUNNING")
                        }
                    },
                    onPause = { 
                        launch { 
                            engine.stop()
                            dataStore.setBotState("PAUSED")
                        }
                    },
                    onStop = { 
                        launch { 
                            engine.stop()
                            dataStore.setBotState("STOPPED")
                            dataStore.setBotEnabled(false)
                        }
                    },
                    onSettings = { 
                        val intent = Intent(applicationContext, SettingsActivity::class.java)
                        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                        startActivity(intent)
                    },
                    onExit = { 
                        launch { 
                            dataStore.setOverlayExpanded(false)
                            stopSelf()
                        }
                    }
                )
            } else {
                OverlayCompactIcon(
                    isExpanded = false,
                    onToggle = { 
                        launch { 
                            dataStore.setOverlayExpanded(true)
                        }
                    }
                )
            }
        }
    }

    private fun launch(block: suspend () -> Unit) {
        kotlinx.coroutines.GlobalScope.launch {
            block()
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        lifecycleRegistry.handleLifecycleEvent(Lifecycle.Event.ON_PAUSE)
        lifecycleRegistry.handleLifecycleEvent(Lifecycle.Event.ON_STOP)
        lifecycleRegistry.handleLifecycleEvent(Lifecycle.Event.ON_DESTROY)
        if (::overlayView.isInitialized) {
            windowManager.removeView(overlayView)
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
