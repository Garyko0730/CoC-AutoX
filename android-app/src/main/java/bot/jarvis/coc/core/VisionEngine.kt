package bot.jarvis.coc.core

import android.graphics.Bitmap
import android.util.Log
import org.opencv.android.Utils
import org.opencv.core.Core
import org.opencv.core.CvType
import org.opencv.core.Mat
import org.opencv.core.Point
import org.opencv.imgproc.Imgproc

object VisionEngine {
    private const val TAG = "VisionEngine"
    private var isInitialized = false

    init {
        try {
            // Try explicit load first
            System.loadLibrary("opencv_java4")
            isInitialized = true
            Log.i(TAG, "OpenCV library loaded successfully via System.loadLibrary")
        } catch (e: UnsatisfiedLinkError) {
            Log.w(TAG, "System.loadLibrary failed, trying OpenCVLoader...")
            try {
                if (org.opencv.android.OpenCVLoader.initDebug()) {
                    isInitialized = true
                    Log.i(TAG, "OpenCV library loaded successfully via OpenCVLoader")
                } else {
                    Log.e(TAG, "OpenCVLoader.initDebug() returned false")
                }
            } catch (ex: Exception) {
                 Log.e(TAG, "Failed to load OpenCV", ex)
            }
        }
    }

    data class MatchResult(
        val point: Point,
        val confidence: Double
    )

    fun findTemplate(screen: Bitmap, template: Bitmap, threshold: Double = 0.8): MatchResult? {
        if (!isInitialized) {
            Log.e(TAG, "VisionEngine not initialized (OpenCV missing). Skipping match.")
            return null
        }

        val screenMat = Mat()
        val templateMat = Mat()
        val result = Mat()

        try {
            Utils.bitmapToMat(screen, screenMat)
            Utils.bitmapToMat(template, templateMat)

            val screenGray = Mat()
            val templateGray = Mat()
            Imgproc.cvtColor(screenMat, screenGray, Imgproc.COLOR_BGR2GRAY)
            Imgproc.cvtColor(templateMat, templateGray, Imgproc.COLOR_BGR2GRAY)

            val resultCols = screenGray.cols() - templateGray.cols() + 1
            val resultRows = screenGray.rows() - templateGray.rows() + 1
            if (resultCols <= 0 || resultRows <= 0) {
                 Log.w(TAG, "Screen smaller than template!")
                 return null
            }
            
            result.create(resultRows, resultCols, CvType.CV_32FC1)

            Imgproc.matchTemplate(screenGray, templateGray, result, Imgproc.TM_CCOEFF_NORMED)
            val mmr = Core.minMaxLoc(result)
            
            if (mmr.maxVal >= threshold) {
                val centerX = mmr.maxLoc.x + template.width / 2
                val centerY = mmr.maxLoc.y + template.height / 2
                return MatchResult(Point(centerX, centerY), mmr.maxVal)
            }

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
