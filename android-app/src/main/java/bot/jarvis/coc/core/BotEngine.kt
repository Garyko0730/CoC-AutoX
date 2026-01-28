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
}

class BotEngine(
    private val scope: CoroutineScope = CoroutineScope(Dispatchers.Default + SupervisorJob())
) {
    private val _state = MutableStateFlow<BotState>(BotState.Idle)
    val state = _state.asStateFlow()

    private var job: Job? = null

    fun start() {
        if (job?.isActive == true) return
        _state.value = BotState.Preparation
        job = scope.launch {
            while (isActive) {
                try {
                    tick()
                } catch (e: Exception) {
                    // Log error
                    _state.value = BotState.Preparation
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
            is BotState.Searching -> handleSearching()
            is BotState.Attacking -> handleAttacking()
            is BotState.Monitor -> handleMonitor()
            is BotState.PostBattle -> handlePostBattle()
            else -> {}
        }
    }

    private suspend fun handlePreparation() {
        // TODO: Implement OCR check for Home Screen
        // If army full -> _state.value = BotState.Searching
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
