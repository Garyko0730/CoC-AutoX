package bot.jarvis.coc.core

import android.graphics.Bitmap
import android.util.Log
// import org.opencv.android.Utils
// import org.opencv.core.Core
// import org.opencv.core.CvType
// import org.opencv.core.Mat
// import org.opencv.core.Point
// import org.opencv.imgproc.Imgproc

object VisionEngine {
    private const val TAG = "VisionEngine"
    private var isInitialized = false

    init {
        // Disabled for build stability
        isInitialized = false
    }

    data class Point(val x: Double, val y: Double)

    data class MatchResult(
        val point: Point,
        val confidence: Double
    )

    fun findTemplate(screen: Bitmap, template: Bitmap, threshold: Double = 0.8): MatchResult? {
        Log.w(TAG, "VisionEngine is disabled. Returning null.")
        return null
    }
}
