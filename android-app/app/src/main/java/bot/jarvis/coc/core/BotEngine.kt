package bot.jarvis.coc.core

import android.content.Context
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow

sealed class BotState {
    object Idle : BotState()
    object Running : BotState()
    object Stopped : BotState()
    object Preparation : BotState()
    object Searching : BotState()
    object Attacking : BotState()
    object Monitor : BotState()
    object PostBattle : BotState()
    object Collecting : BotState()
    object Training : BotState()
}

class BotEngine(
    private val context: Context,
    private val scope: CoroutineScope = CoroutineScope(Dispatchers.Default + SupervisorJob())
) {
    private val _state = MutableStateFlow<BotState>(BotState.Idle)
    val state = _state.asStateFlow()

    private var job: Job? = null
    private val resourceCollector = bot.jarvis.coc.logic.ResourceCollector(context)
    private val trainingManager = bot.jarvis.coc.logic.TrainingManager(context)

    fun start() {
        if (job?.isActive == true) return
        _state.value = BotState.Running
        job = scope.launch {
            while (isActive) {
                try {
                    tick()
                } catch (e: Exception) {
                    android.util.Log.e("BotEngine", "Error in tick", e)
                    _state.value = BotState.Idle // Stop on error for safety
                }
                delay(1000)
            }
        }
    }

    fun stop() {
        job?.cancel()
        _state.value = BotState.Stopped
    }

private suspend fun tick() {
        when (val currentState = _state.value) {
            is BotState.Running -> handlePreparation()
            is BotState.Preparation -> handlePreparation()
            is BotState.Collecting -> handleCollecting()
            is BotState.Training -> handleTraining()
            is BotState.Searching -> handleSearching()
            is BotState.Attacking -> handleAttacking()
            is BotState.Monitor -> handleMonitor()
            is BotState.PostBattle -> handlePostBattle()
            else -> {}
        }
    }

    private suspend fun handlePreparation() {
        // Simple logic: Just go to collecting for now
        delay(1000)
        _state.value = BotState.Collecting
    }

    private suspend fun handleCollecting() {
        android.util.Log.d("BotEngine", "Collecting Resources...")
        val foundSomething = resourceCollector.execute()
        if (!foundSomething) {
            // Nothing to collect, check troops?
             _state.value = BotState.Training
        }
        delay(2000) 
    }

    private suspend fun handleTraining() {
         android.util.Log.d("BotEngine", "Checking Troops...")
         // Try to train
         trainingManager.execute()
         // If done or failed, assume we are ready to search (or wait)
         // For now, loop back to collecting to wait
         delay(5000)
         _state.value = BotState.Collecting
    }

    private suspend fun handleSearching() {
        android.util.Log.d("BotEngine", "Searching for opponents...")
        
        // Look for "Find Match" or similar button and click it
        val findMatchButton = android.graphics.Rect(100, 1000, 300, 1100) // Adjust coordinates
        val screenshot = ScreenCaptureManager.captureScreen() ?: run {
            _state.value = BotState.Idle
            return
        }
        
        val ocrEngine = OcrEngine(context)
        val buttonText = ocrEngine.recognizeButtonText(screenshot, findMatchButton)
        
        if (buttonText?.contains("match", ignoreCase = true) == true || 
            buttonText?.contains("find", ignoreCase = true) == true) {
            // Click the find match button
            InputManager.tap(findMatchButton.centerX(), findMatchButton.centerY())
            android.util.Log.d("BotEngine", "Clicked Find Match button")
            
            // Wait for search to complete, then transition to attacking
            delay(5000)
            _state.value = BotState.Attacking
        } else {
            // Can't find match button, go back to collecting
            android.util.Log.d("BotEngine", "Find Match button not found, returning to collecting")
            _state.value = BotState.Collecting
        }
        
        ocrEngine.close()
    }

    private suspend fun handleAttacking() {
        android.util.Log.d("BotEngine", "Deploying troops...")
        
        // Simple deployment strategy - deploy troops in a line across the bottom
        val deploymentArea = android.graphics.Rect(200, 800, 600, 900)
        val troopCount = 20
        val spacing = deploymentArea.width() / troopCount
        
        for (i in 0 until troopCount) {
            val x = deploymentArea.left + (i * spacing)
            val y = deploymentArea.centerY()
            
            // Deploy one troop
            InputManager.tap(x, y)
            delay(100) // Small delay between deployments
        }
        
        android.util.Log.d("BotEngine", "Troop deployment complete")
        delay(2000) // Wait for deployment to register
        _state.value = BotState.Monitor
    }

    private suspend fun handleMonitor() {
        android.util.Log.d("BotEngine", "Monitoring battle progress...")
        
        // Look for battle end indicators (stars, victory/defeat, return home button)
        val screenshot = ScreenCaptureManager.captureScreen() ?: run {
            delay(3000)
            return
        }
        
        val ocrEngine = OcrEngine(context)
        val battleEndRegion = android.graphics.Rect(50, 50, 300, 150)
        val battleText = ocrEngine.recognizeButtonText(screenshot, battleEndRegion)
        
        val battleEnded = battleText?.contains("victory", ignoreCase = true) == true ||
                         battleText?.contains("defeat", ignoreCase = true) == true ||
                         battleText?.contains("return", ignoreCase = true) == true
        
        if (battleEnded) {
            android.util.Log.d("BotEngine", "Battle ended: $battleText")
            _state.value = BotState.PostBattle
        } else {
            // Continue monitoring
            delay(3000)
        }
        
        ocrEngine.close()
    }

    private suspend fun handlePostBattle() {
        android.util.Log.d("BotEngine", "Returning home...")
        
        // Look for and click the "Return Home" button
        val returnHomeButton = android.graphics.Rect(400, 1000, 600, 1100) // Adjust coordinates
        val screenshot = ScreenCaptureManager.captureScreen() ?: run {
            _state.value = BotState.Collecting // Fallback
            return
        }
        
        val ocrEngine = OcrEngine(context)
        val buttonText = ocrEngine.recognizeButtonText(screenshot, returnHomeButton)
        
        if (buttonText?.contains("return", ignoreCase = true) == true || 
            buttonText?.contains("home", ignoreCase = true) == true) {
            // Click the return home button
            InputManager.tap(returnHomeButton.centerX(), returnHomeButton.centerY())
            android.util.Log.d("BotEngine", "Clicked Return Home button")
            
            // Wait for home screen to load
            delay(5000)
        }
        
        // Return to resource collection cycle
        _state.value = BotState.Collecting
        ocrEngine.close()
    }
}
