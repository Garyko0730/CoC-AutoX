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
            // Close window - try multiple methods
            closeWindow()
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
    
    /**
     * Generic window closing method that tries multiple approaches
     */
    private fun closeWindow(): Boolean {
        // Try 1: Look for close button (X) in common locations
        val closeRegions = listOf(
            android.graphics.Rect(650, 50, 750, 150),  // Top right
            android.graphics.Rect(600, 100, 700, 200) // Slightly lower
        )
        
        for (region in closeRegions) {
            if (findAndClickInRegion(region)) {
                Log.d(TAG, "Closed window with close button")
                return true
            }
        }
        
        // Try 2: Use back button
        InputManager.pressBack()
        Log.d(TAG, "Used back button to close window")
        return true
    }
    
    /**
     * Helper method to find and click any interactive element in a region
     */
    private fun findAndClickInRegion(region: android.graphics.Rect): Boolean {
        val screen = ScreenCaptureManager.capture() ?: return false
        
        // Crop the screen to the specified region
        val croppedScreen = android.graphics.Bitmap.createBitmap(
            screen,
            region.left,
            region.top,
            region.width(),
            region.height()
        )
        
        // Use template matching to find close buttons
        val closeTemplates = listOf("btn_close.png", "btn_x.png", "icon_close.png")
        
        for (templateName in closeTemplates) {
            val template = AssetLoader.getBitmap(context, templateName)
            if (template != null) {
                val match = VisionEngine.findTemplate(croppedScreen, template, 0.7)
                if (match != null) {
                    // Adjust coordinates to original screen
                    val absoluteX = region.left + match.point.x
                    val absoluteY = region.top + match.point.y
                    InputManager.tap(absoluteX.toFloat(), absoluteY.toFloat())
                    return true
                }
            }
        }
        
        // Fallback: Click center of region if we can't find a specific button
        InputManager.tap(region.centerX().toFloat(), region.centerY().toFloat())
        return true
    }
}
