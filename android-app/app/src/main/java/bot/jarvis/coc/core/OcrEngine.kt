package bot.jarvis.coc.core

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Rect
import android.util.Log
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.TextRecognizer
import com.google.mlkit.vision.text.latin.TextRecognizerOptions
import java.io.File
import java.util.regex.Pattern

class OcrEngine(private val context: Context) {
    
    private val textRecognizer: TextRecognizer = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS)
    private val goldPattern = Pattern.compile("(\\d+(?:,\\d+)?)(?:k|m)??\\s*gold", Pattern.CASE_INSENSITIVE)
    private val elixirPattern = Pattern.compile("(\\d+(?:,\\d+)?)(?:k|m)??\\s*elixir", Pattern.CASE_INSENSITIVE)
    private val darkElixirPattern = Pattern.compile("(\\d+(?:,\\d+)?)(?:k|m)??\\s*dark\\s*elixir", Pattern.CASE_INSENSITIVE)
    private val gemPattern = Pattern.compile("(\\d+)\\s*gem", Pattern.CASE_INSENSITIVE)
    
    /**
     * 获取屏幕截图并转换为 Bitmap
     * Captures screen and converts to Bitmap
     */
    fun getScreenshot(): Bitmap? {
        val path = "/sdcard/coc_capture.png"
        return if (ShellExecutor.captureScreen(path)) {
            BitmapFactory.decodeFile(path)
        } else {
            null
        }
    }
    
    /**
     * 识别战利品信息
     * Analyzes loot information from screenshot region
     */
    fun analyzeLoot(bitmap: Bitmap, region: Rect? = null): Map<String, Int> {
        val croppedBitmap = if (region != null) {
            Bitmap.createBitmap(
                bitmap, 
                region.left, 
                region.top, 
                region.width(), 
                region.height()
            )
        } else {
            bitmap
        }
        
        val image = InputImage.fromBitmap(croppedBitmap, 0)
        var result = mapOf<String, Int>("gold" to 0, "elixir" to 0, "darkElixir" to 0, "gems" to 0)
        
        textRecognizer.process(image)
            .addOnSuccessListener { visionText ->
                val text = visionText.text
                Log.d("OcrEngine", "Detected text: $text")
                
                result = mapOf(
                    "gold" to extractAmount(text, goldPattern),
                    "elixir" to extractAmount(text, elixirPattern),
                    "darkElixir" to extractAmount(text, darkElixirPattern),
                    "gems" to extractAmount(text, gemPattern)
                )
            }
            .addOnFailureListener { e ->
                Log.e("OcrEngine", "Text recognition failed", e)
            }
        
        return result
    }
    
    /**
     * 识别按钮文本
     * Recognizes button text
     */
    fun recognizeButtonText(bitmap: Bitmap, region: Rect): String? {
        val croppedBitmap = Bitmap.createBitmap(
            bitmap, 
            region.left, 
            region.top, 
            region.width(), 
            region.height()
        )
        
        val image = InputImage.fromBitmap(croppedBitmap, 0)
        var recognizedText: String? = null
        
        textRecognizer.process(image)
            .addOnSuccessListener { visionText ->
                recognizedText = visionText.text.trim()
                Log.d("OcrEngine", "Button text: $recognizedText")
            }
            .addOnFailureListener { e ->
                Log.e("OcrEngine", "Button text recognition failed", e)
            }
        
        return recognizedText
    }
    
    /**
     * 检测是否存在特定文本
     * Checks if specific text exists in region
     */
    fun detectText(bitmap: Bitmap, region: Rect, targetText: String): Boolean {
        val recognizedText = recognizeButtonText(bitmap, region) ?: return false
        return recognizedText.contains(targetText, ignoreCase = true)
    }
    
    /**
     * 从文本中提取数量
     * Extracts numeric amount from text using regex pattern
     */
    private fun extractAmount(text: String, pattern: Pattern): Int {
        val matcher = pattern.matcher(text)
        if (matcher.find()) {
            val amountStr = matcher.group(1)?.replace(",", "") ?: "0"
            var amount = amountStr.toIntOrNull() ?: 0
            
            // Handle k/m multipliers
            val fullMatch = matcher.group(0)?.lowercase() ?: ""
            when {
                fullMatch.contains("k") -> amount *= 1000
                fullMatch.contains("m") -> amount *= 1000000
            }
            
            return amount
        }
        return 0
    }
    
    /**
     * 关闭OCR引擎
     * Close OCR engine
     */
    fun close() {
        textRecognizer.close()
    }
}
