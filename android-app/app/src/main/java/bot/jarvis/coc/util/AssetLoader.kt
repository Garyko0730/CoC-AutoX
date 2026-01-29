package bot.jarvis.coc.util

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import java.io.IOException

object AssetLoader {
    private val cache = mutableMapOf<String, Bitmap>()

    fun getBitmap(context: Context, fileName: String): Bitmap? {
        if (cache.containsKey(fileName)) {
            return cache[fileName]
        }

        return try {
            val inputStream = context.assets.open("templates/$fileName")
            val bitmap = BitmapFactory.decodeStream(inputStream)
            inputStream.close()
            if (bitmap != null) {
                cache[fileName] = bitmap
            }
            bitmap
        } catch (e: IOException) {
            e.printStackTrace()
            null
        }
    }
    
    fun clearCache() {
        cache.clear()
    }
}
