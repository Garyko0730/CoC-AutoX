package bot.jarvis.coc.core

import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow

sealed class BotState {
    object Idle : BotState()
    object Preparation : BotState()
    object Searching : BotState()
    object Attacking : BotState()
    object Monitor : BotState()
    object PostBattle : BotState()
    object Collecting : BotState()
}

class BotEngine(
    private val context: android.content.Context,
    private val scope: CoroutineScope = CoroutineScope(Dispatchers.Default + SupervisorJob())
) {
    private val _state = MutableStateFlow<BotState>(BotState.Idle)
    val state = _state.asStateFlow()

    private var job: Job? = null
    private val resourceCollector = bot.jarvis.coc.logic.ResourceCollector(context)

    fun start() {
        if (job?.isActive == true) return
        _state.value = BotState.Preparation
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
        _state.value = BotState.Idle
    }

    private suspend fun tick() {
        when (val currentState = _state.value) {
            is BotState.Preparation -> handlePreparation()
            is BotState.Collecting -> handleCollecting()
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
            // If nothing found for a while, maybe we are done or screen is zoomed out?
            // For now, loop or go to next state
            // _state.value = BotState.Searching
        }
        delay(2000) // Wait between collection cycles
    }

    private suspend fun handleSearching() {
        // TODO: Implement Search logic
    }

    private suspend fun handleAttacking() {
        // TODO: Implement Deployment logic
    }

    private suspend fun handleMonitor() {
        // TODO: Implement Battle Monitoring
    }

    private suspend fun handlePostBattle() {
        // TODO: Implement Return Home logic
    }
}
