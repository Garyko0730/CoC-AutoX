package bot.jarvis.coc.logic

import android.content.Context
import android.util.Log
import bot.jarvis.coc.core.InputManager
import bot.jarvis.coc.core.ScreenCaptureManager
import bot.jarvis.coc.core.VisionEngine
import bot.jarvis.coc.util.AssetLoader
import kotlinx.coroutines.delay

class TrainingManager(private val context: Context) {
    private val TAG = "TrainingManager"

    // Templates for Training UI
    private val TEMPLATES = mapOf(
        "train_troops_tab" to "icon_sword.png",  // The sword icon to open training
        "train_tab_selected" to "tab_train_active.png",
        "quick_train_tab" to "tab_quick_train.png",
        "train_button" to "btn_train_green.png"  // The big green button to confirm training
    )

    /**
     * Executes the training routine.
     * 1. Open Army Overview
     * 2. Switch to Quick Train
     * 3. Train Previous Army (if available)
     */
    suspend fun execute(): Boolean {
        Log.d(TAG, "Starting Training routine...")
        
        // Step 1: Find Training Icon on Home Screen
        if (!findAndClick("train_troops_tab")) {
            Log.w(TAG, "Could not find Train Troops icon.")
            return false
        }
        delay(1500)

        // Step 2: Switch to Quick Train tab
        if (!findAndClick("quick_train_tab")) {
             Log.w(TAG, "Could not find Quick Train tab.")
             // Try normal training? For now just return
             return false
        }
        delay(1000)

        // Step 3: Click 'Train' (assuming using Previous Army slot 1)
        // Ideally we check for "Train" button coordinates relative to the list
        if (findAndClick("train_button")) {
            Log.i(TAG, "Troops training started.")
            delay(500)
            // Close window (click X or Back) - TODO: Implement generic close
            // For now, assume back works or click outside
            InputManager.tap(100f, 100f) // Tap top left to close?
            return true
        }

        return false
    }

    private fun findAndClick(templateKey: String, threshold: Double = 0.8): Boolean {
        val filename = TEMPLATES[templateKey] ?: return false
        val screen = ScreenCaptureManager.capture() ?: return false
        val template = AssetLoader.getBitmap(context, filename) ?: return false

        val match = VisionEngine.findTemplate(screen, template, threshold)
        if (match != null) {
            InputManager.tap(match.point.x.toFloat(), match.point.y.toFloat())
            return true
        }
        return false
    }
}
