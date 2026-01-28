package bot.jarvis.coc.core

import android.graphics.Bitmap
import android.util.Log
import org.opencv.android.Utils
import org.opencv.core.Core
import org.opencv.core.CvType
import org.opencv.core.Mat
import org.opencv.core.Point
import org.opencv.core.Scalar
import org.opencv.imgproc.Imgproc

object VisionEngine {
    private const val TAG = "VisionEngine"

    init {
        try {
            System.loadLibrary("opencv_java4")
            Log.i(TAG, "OpenCV library loaded successfully")
        } catch (e: UnsatisfiedLinkError) {
            Log.e(TAG, "Failed to load OpenCV library", e)
        }
    }

    data class MatchResult(
        val point: Point,
        val confidence: Double
    )

    /**
     * 在屏幕截图中查找模板图片的位置
     * Find template image within screen screenshot
     */
    fun findTemplate(screen: Bitmap, template: Bitmap, threshold: Double = 0.8): MatchResult? {
        val screenMat = Mat()
        val templateMat = Mat()
        val result = Mat()

        try {
            // Convert Bitmaps to Mats
            Utils.bitmapToMat(screen, screenMat)
            Utils.bitmapToMat(template, templateMat)

            // Convert to grayscale for performance (optional, but recommended for simple button matching)
            val screenGray = Mat()
            val templateGray = Mat()
            Imgproc.cvtColor(screenMat, screenGray, Imgproc.COLOR_BGR2GRAY)
            Imgproc.cvtColor(templateMat, templateGray, Imgproc.COLOR_BGR2GRAY)

            // Create result matrix
            val resultCols = screenGray.cols() - templateGray.cols() + 1
            val resultRows = screenGray.rows() - templateGray.rows() + 1
            result.create(resultRows, resultCols, CvType.CV_32FC1)

            // Template Matching
            Imgproc.matchTemplate(screenGray, templateGray, result, Imgproc.TM_CCOEFF_NORMED)

            // Find best match
            val mmr = Core.minMaxLoc(result)
            
            if (mmr.maxVal >= threshold) {
                Log.d(TAG, "Match found: ${mmr.maxVal} at ${mmr.maxLoc}")
                // Return center point of the match
                val centerX = mmr.maxLoc.x + template.width / 2
                val centerY = mmr.maxLoc.y + template.height / 2
                return MatchResult(Point(centerX, centerY), mmr.maxVal)
            } else {
                Log.d(TAG, "No match found. Max confidence: ${mmr.maxVal}")
            }

            screenGray.release()
            templateGray.release()

        } catch (e: Exception) {
            Log.e(TAG, "Error during template matching", e)
        } finally {
            screenMat.release()
            templateMat.release()
            result.release()
        }

        return null
    }
}
