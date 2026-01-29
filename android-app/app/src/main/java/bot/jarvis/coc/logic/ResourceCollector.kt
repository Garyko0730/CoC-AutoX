package bot.jarvis.coc.logic

import android.content.Context
import android.util.Log
import bot.jarvis.coc.core.InputManager
import bot.jarvis.coc.core.ScreenCaptureManager
import bot.jarvis.coc.core.VisionEngine
import bot.jarvis.coc.util.AssetLoader
import kotlinx.coroutines.delay

class ResourceCollector(private val context: Context) {
    private val TAG = "ResourceCollector"

    // Template filenames (assumed to be in assets/templates/)
    private val TARGETS = listOf(
        "icon_gold.png",
        "icon_elixir.png",
        "icon_dark_elixir.png",
        "icon_cart_gold.png", // Resource cart
        "icon_cart_elixir.png"
    )

    suspend fun execute(): Boolean {
        Log.d(TAG, "Starting resource collection routine...")
        
        val screen = ScreenCaptureManager.capture()
        if (screen == null) {
            Log.e(TAG, "Failed to capture screen")
            return false
        }

        var collectedAny = false

        for (target in TARGETS) {
            val template = AssetLoader.getBitmap(context, target)
            if (template == null) {
                Log.w(TAG, "Template not found: $target")
                continue
            }

            // Simple loop to find all instances (VisionEngine currently finds best match)
            // Ideally VisionEngine should support findAll, but for now we find best, click, wait, retry?
            // Or just finding one is enough per tick.
            
            val match = VisionEngine.findTemplate(screen, template, threshold = 0.85)
            if (match != null) {
                Log.i(TAG, "Found $target at ${match.point}")
                
                // Click the resource icon
                InputManager.tap(match.point.x.toFloat(), match.point.y.toFloat())
                collectedAny = true
                
                // Small random delay to feel human
                delay(100 + (Math.random() * 100).toLong())
            }
        }
        
        return collectedAny
    }
}
